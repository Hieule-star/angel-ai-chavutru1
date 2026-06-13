import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Topic = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  category: string | null;
  icon: string | null;
};

const STOPWORDS = new Set([
  "là","của","có","được","cho","với","một","các","và","để","này","đó","khi","như","trong","trên",
  "không","đã","sẽ","thì","mà","nhưng","hay","hoặc","nếu","vì","bởi","do","từ","đến","tại","về",
  "bạn","tôi","mình","con","cha","ạ","nhé","ơi","gì","sao","thế","nào","chưa","rồi","còn","đang",
  "what","how","why","when","where","the","and","for","you","are","can","please","help"
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResp({ error: "Missing Authorization header" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return jsonResp({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isAdminData } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdminData) return jsonResp({ error: "Forbidden: admin role required" }, 403);

    const body = await req.json();
    const query: string = (body.query || "").toString();
    if (!query.trim()) return jsonResp({ error: "Missing 'query' field" }, 400);

    const lastUserMsg = query.toLowerCase();
    const rawTokens = lastUserMsg
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
    const words = lastUserMsg.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
    const bigrams: string[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      const bg = `${words[i]} ${words[i + 1]}`;
      if (bg.length >= 6) bigrams.push(bg);
    }
    const keywords = Array.from(new Set([...rawTokens, ...bigrams])).slice(0, 12);

    const funKeywords = ["fun","profile","wallet","live","stream","livestream","camly","ecosystem","charity","token"];
    const isFunQuery = funKeywords.some((k) => lastUserMsg.includes(k));

    const matched = new Map<string, Topic>();
    const matchSources = new Map<string, Set<string>>();

    for (const kw of keywords) {
      const safe = kw.replace(/[%,()]/g, " ").trim();
      if (!safe) continue;
      const { data } = await admin
        .from("knowledge_topics")
        .select("id, title, description, content, category, icon")
        .or(`title.ilike.%${safe}%,description.ilike.%${safe}%,content.ilike.%${safe}%`)
        .limit(8);
      if (data) {
        for (const t of data as Topic[]) {
          matched.set(t.id, t);
          if (!matchSources.has(t.id)) matchSources.set(t.id, new Set());
          matchSources.get(t.id)!.add(kw);
        }
      }
    }

    let funEcosystemSeeded = false;
    if (isFunQuery) {
      const { data: funTopics } = await admin
        .from("knowledge_topics")
        .select("id, title, description, content, category, icon")
        .eq("category", "FUN Ecosystem")
        .limit(10);
      if (funTopics) {
        funEcosystemSeeded = true;
        for (const t of funTopics as Topic[]) {
          if (!matched.has(t.id)) matched.set(t.id, t);
          if (!matchSources.has(t.id)) matchSources.set(t.id, new Set());
          matchSources.get(t.id)!.add("[FUN seed]");
        }
      }
    }

    let fallbackUsed = false;
    if (matched.size === 0) {
      fallbackUsed = true;
      const { data: defaults } = await admin
        .from("knowledge_topics")
        .select("id, title, description, content, category, icon")
        .limit(8);
      if (defaults) {
        for (const t of defaults as Topic[]) {
          matched.set(t.id, t);
          matchSources.set(t.id, new Set(["[fallback]"]));
        }
      }
    }

    const scoreTopic = (t: Topic): number => {
      let score = 0;
      const title = (t.title || "").toLowerCase();
      const desc = (t.description || "").toLowerCase();
      const content = (t.content || "").toLowerCase();
      const cat = (t.category || "").toLowerCase();
      for (const kw of keywords) {
        if (title === kw) score += 200;
        if (title.includes(kw)) score += 50;
        if (desc.includes(kw)) score += 20;
        if (content.includes(kw)) score += 10;
      }
      if (isFunQuery && cat === "fun ecosystem") score += 30;
      return score;
    };

    const ranked = Array.from(matched.values())
      .map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        icon: t.icon,
        score: scoreTopic(t),
        matchedKeywords: Array.from(matchSources.get(t.id) || []),
        contentLength: (t.content || "").length,
        preview: (t.content || t.description || "").substring(0, 250),
      }))
      .sort((a, b) => b.score - a.score);

    return jsonResp({
      query,
      extractedKeywords: keywords,
      isFunQuery,
      funEcosystemSeeded,
      fallbackUsed,
      totalMatched: matched.size,
      usedInContext: Math.min(15, ranked.length),
      topTopics: ranked.slice(0, 15),
      excludedTopics: ranked.slice(15),
    });
  } catch (err) {
    return jsonResp({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

function jsonResp(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

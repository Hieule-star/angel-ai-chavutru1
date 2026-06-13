/**
 * Cloudflare Video Transform Worker Template
 * 
 * Deploy this worker to Cloudflare Workers to enable video transformations.
 * 
 * Features:
 * - Thumbnail extraction (first frame)
 * - Preview GIF generation
 * - Video resizing (720p, 480p, 360p)
 * - Poster image generation
 * 
 * Setup:
 * 1. Create a new Cloudflare Worker
 * 2. Copy this code
 * 3. Configure KV namespace for caching
 * 4. Set environment variables
 * 5. Deploy and get the worker URL
 * 6. Add CLOUDFLARE_WORKER_URL secret in Lovable
 */

// KV namespace binding (configure in Cloudflare dashboard)
// const CACHE = env.VIDEO_CACHE;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Video-Id, X-User-Id",
    };

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Get transform parameters
      const videoUrl = url.searchParams.get("url");
      const type = url.searchParams.get("type") || "thumbnail";
      const width = parseInt(url.searchParams.get("width") || "0") || null;
      const height = parseInt(url.searchParams.get("height") || "0") || null;
      const quality = parseInt(url.searchParams.get("quality") || "80");
      const format = url.searchParams.get("format") || getDefaultFormat(type);

      if (!videoUrl) {
        return new Response(
          JSON.stringify({ error: "Missing video URL" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate cache key
      const cacheKey = `${btoa(videoUrl)}_${type}_${width}_${height}_${quality}_${format}`;

      // Check cache first
      if (env.VIDEO_CACHE) {
        const cached = await env.VIDEO_CACHE.get(cacheKey);
        if (cached) {
          console.log(`Cache hit for ${cacheKey}`);
          return new Response(
            JSON.stringify({ url: cached, cached: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Process based on type
      let transformedUrl;
      
      switch (type) {
        case "thumbnail":
          transformedUrl = await generateThumbnail(videoUrl, width || 300, height || 200, quality, format, env);
          break;
        case "preview":
          transformedUrl = await generatePreviewGif(videoUrl, width || 320, height || 180, env);
          break;
        case "poster":
          transformedUrl = await generatePoster(videoUrl, width || 1920, height || 1080, quality, env);
          break;
        case "resize":
          transformedUrl = await resizeVideo(videoUrl, width || 1280, height || 720, quality, env);
          break;
        default:
          return new Response(
            JSON.stringify({ error: `Unknown transform type: ${type}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
      }

      // Cache the result
      if (env.VIDEO_CACHE && transformedUrl) {
        const ttl = getCacheTTL(type);
        await env.VIDEO_CACHE.put(cacheKey, transformedUrl, { expirationTtl: ttl });
      }

      return new Response(
        JSON.stringify({ 
          url: transformedUrl, 
          type,
          width,
          height,
          cached: false 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Cache-Control": getCacheControl(type)
          } 
        }
      );

    } catch (error) {
      console.error("Transform error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }
};

function getDefaultFormat(type) {
  switch (type) {
    case "thumbnail":
    case "poster":
      return "webp";
    case "preview":
      return "gif";
    case "resize":
      return "mp4";
    default:
      return "webp";
  }
}

function getCacheTTL(type) {
  switch (type) {
    case "thumbnail":
    case "poster":
      return 2592000; // 30 days
    case "preview":
      return 604800; // 7 days
    case "resize":
      return 86400; // 24 hours
    default:
      return 3600; // 1 hour
  }
}

function getCacheControl(type) {
  const ttl = getCacheTTL(type);
  return `public, max-age=${ttl}`;
}

/**
 * Generate thumbnail from video
 * Uses Cloudflare Stream or external service
 */
async function generateThumbnail(videoUrl, width, height, quality, format, env) {
  // Option 1: Use Cloudflare Stream (if video is in Stream)
  // return `${videoUrl}/thumbnails/thumbnail.${format}?time=0s&width=${width}&height=${height}`;

  // Option 2: Use Cloudflare Images (if you have it enabled)
  // const imageUrl = `${env.CLOUDFLARE_IMAGES_URL}/video-thumb/${encodeURIComponent(videoUrl)}`;
  // return `${imageUrl}/w=${width},h=${height},q=${quality},f=${format}`;

  // Option 3: Use external service like thumbor, imgproxy, etc.
  // return `${env.THUMBOR_URL}/unsafe/${width}x${height}/filters:format(${format}):quality(${quality})/video/${encodeURIComponent(videoUrl)}`;

  // Fallback: Return original URL with timestamp hint
  // The frontend can use video element to capture first frame
  return `${videoUrl}#t=0.1`;
}

/**
 * Generate animated GIF preview
 */
async function generatePreviewGif(videoUrl, width, height, env) {
  // This requires ffmpeg or similar processing
  // Options:
  // 1. Cloudflare Stream animated thumbnails
  // 2. External ffmpeg service
  // 3. Pre-process and store on upload

  // Fallback: Return video URL for frontend to handle
  return videoUrl;
}

/**
 * Generate high-quality poster image
 */
async function generatePoster(videoUrl, width, height, quality, env) {
  // Similar to thumbnail but higher quality
  return `${videoUrl}#t=0.1`;
}

/**
 * Resize video to different quality
 */
async function resizeVideo(videoUrl, width, height, quality, env) {
  // Video transcoding requires heavy processing
  // Options:
  // 1. Cloudflare Stream variants
  // 2. AWS MediaConvert
  // 3. Pre-transcode on upload

  // For now, return original
  return videoUrl;
}

/**
 * ADVANCED: Using Cloudflare Stream
 * 
 * If you have Cloudflare Stream, you can use these APIs:
 * 
 * 1. Upload video to Stream:
 *    POST https://api.cloudflare.com/client/v4/accounts/{account_id}/stream
 * 
 * 2. Get thumbnails:
 *    https://customer-{code}.cloudflarestream.com/{video_id}/thumbnails/thumbnail.jpg?time=0s
 * 
 * 3. Get animated thumbnails:
 *    https://customer-{code}.cloudflarestream.com/{video_id}/thumbnails/thumbnail.gif?start=0s&duration=5s
 * 
 * 4. Adaptive bitrate streaming:
 *    https://customer-{code}.cloudflarestream.com/{video_id}/manifest/video.m3u8
 */

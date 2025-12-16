export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  light_points: number;
  created_at: string;
}

export type AIModel = 'google/gemini-2.5-flash' | 'google/gemini-2.5-pro' | 'openai/gpt-5-mini' | 'openai/gpt-5';

export type SelectionMode = 'auto' | 'fast' | 'deep';

export interface KnowledgeSource {
  id: string;
  title: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  message: string;
  timestamp: string;
  model?: AIModel;
  sources?: KnowledgeSource[];
  session_id?: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeTopic {
  id: string;
  title: string;
  description: string;
  content: string;
  icon: string;
  category: string;
  created_at: string;
}

export interface WalletInfo {
  address: string | null;
  balance: number;
  connected: boolean;
}

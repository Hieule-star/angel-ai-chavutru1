export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  light_points: number;
  created_at: string;
}

export type AIModel = 'google/gemini-2.5-flash' | 'google/gemini-2.5-pro' | 'openai/gpt-5-mini' | 'openai/gpt-5';

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  message: string;
  timestamp: string;
  model?: AIModel;
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

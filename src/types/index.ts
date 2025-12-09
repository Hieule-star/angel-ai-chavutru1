export interface User {
  id: string;
  universal_user_id: string;
  email: string;
  display_name: string;
  avatar: string;
  created_at: string;
  light_points: number;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  message: string;
  timestamp: string;
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

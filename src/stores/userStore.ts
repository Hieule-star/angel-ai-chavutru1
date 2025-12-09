import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, ChatMessage, WalletInfo } from '@/types';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  chatHistory: ChatMessage[];
  wallet: WalletInfo;
  setUser: (user: User | null) => void;
  logout: () => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
  addLightPoints: (points: number) => void;
  setWallet: (wallet: Partial<WalletInfo>) => void;
  disconnectWallet: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      chatHistory: [],
      wallet: {
        address: null,
        balance: 0,
        connected: false,
      },
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        wallet: { address: null, balance: 0, connected: false }
      }),
      addChatMessage: (message) =>
        set((state) => ({
          chatHistory: [...state.chatHistory, message],
        })),
      clearChatHistory: () => set({ chatHistory: [] }),
      addLightPoints: (points) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, light_points: state.user.light_points + points }
            : null,
        })),
      setWallet: (walletUpdate) =>
        set((state) => ({
          wallet: { ...state.wallet, ...walletUpdate },
        })),
      disconnectWallet: () =>
        set({
          wallet: { address: null, balance: 0, connected: false },
        }),
    }),
    {
      name: 'angel-ai-storage',
    }
  )
);

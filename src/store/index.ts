import { create } from 'zustand'
import type { Bot, Profile } from '@/types/database'

interface AuthState {
  user: Profile | null
  isLoading: boolean
  setUser: (user: Profile | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}))

interface BotState {
  bots: Bot[]
  selectedBot: Bot | null
  isLoading: boolean
  setBots: (bots: Bot[]) => void
  setSelectedBot: (bot: Bot | null) => void
  addBot: (bot: Bot) => void
  updateBot: (id: string, updates: Partial<Bot>) => void
  removeBot: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useBotStore = create<BotState>((set) => ({
  bots: [],
  selectedBot: null,
  isLoading: false,
  setBots: (bots) => set({ bots }),
  setSelectedBot: (selectedBot) => set({ selectedBot }),
  addBot: (bot) => set((state) => ({ bots: [...state.bots, bot] })),
  updateBot: (id, updates) =>
    set((state) => ({
      bots: state.bots.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      selectedBot:
        state.selectedBot?.id === id
          ? { ...state.selectedBot, ...updates }
          : state.selectedBot,
    })),
  removeBot: (id) =>
    set((state) => ({
      bots: state.bots.filter((b) => b.id !== id),
      selectedBot: state.selectedBot?.id === id ? null : state.selectedBot,
    })),
  setLoading: (isLoading) => set({ isLoading }),
}))

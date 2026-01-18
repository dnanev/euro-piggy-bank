import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppState, AppActions } from './types';
import { EURO_DENOMINATIONS } from './constants';

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      denominations: EURO_DENOMINATIONS,
      theme: 'light',
      language: 'bg',
      showBgn: false,
      lastUpdated: null,

      // Actions
      setQuantity: (id: string, quantity: number) =>
        set((state) => ({
          denominations: state.denominations.map((denom) =>
            denom.id === id ? { ...denom, quantity: Math.max(0, quantity) } : denom
          ),
        })),

      setTheme: (theme: 'light' | 'dark') =>
        set({ theme }),

      setLanguage: (language: 'bg' | 'en') =>
        set({ language }),

      setShowBgn: (showBgn: boolean) =>
        set({ showBgn }),

      resetAll: () =>
        set({
          denominations: EURO_DENOMINATIONS,
          lastUpdated: null,
        }),

      saveState: () =>
        set({
          lastUpdated: new Date().toISOString(),
        }),

      loadState: () => {
        // This is handled by the persist middleware
        const stored = get();
        return stored;
      },
    }),
    {
      name: 'euro-piggy-bank-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        denominations: state.denominations,
        theme: state.theme,
        language: state.language,
        showBgn: state.showBgn,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

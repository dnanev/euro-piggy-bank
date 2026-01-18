import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppState, AppActions, EuroDenomination } from './types';
import { EURO_DENOMINATIONS } from './constants';
import type { HistoryEntry, SavingsGoal } from './types';

type AppStore = AppState & AppActions & {
  // History actions
  addHistoryEntry: (entry: HistoryEntry) => void;
  updateHistoryEntry: (id: string, entry: HistoryEntry) => void;
  deleteHistoryEntry: (id: string) => void;
  clearHistory: () => void;

  // Goal actions
  addGoal: (goal: SavingsGoal) => void;
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  clearGoals: () => void;

  // Statistics actions
  updateStatistics: (stats: import('./types').HistoryStatistics) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      denominations: EURO_DENOMINATIONS,
      theme: 'light',
      language: 'bg',
      showBgn: false,
      lastUpdated: null,
      history: [],
      goals: [],
      statistics: null,

      // Existing actions
      setQuantity: (id: string, quantity: number) =>
        set((state) => {
          const previousQuantity = state.denominations.find((d: EuroDenomination) => d.id === id)?.quantity || 0;
          const newQuantity = Math.max(0, quantity);

          const newDenominations = state.denominations.map((denom: EuroDenomination) =>
            denom.id === id ? { ...denom, quantity: newQuantity } : denom
          );

          // Create automatic history entry if quantity changed
          if (previousQuantity !== newQuantity && newQuantity > 0) {
            const totalEurCents = newDenominations.reduce((total: number, denom: EuroDenomination) => total + (denom.quantity * denom.value), 0);
            const totalEur = totalEurCents / 100; // Convert cents to euros
            const totalBgn = totalEur * 1.95583; // Convert euros to BGN

            const historyEntry = {
              id: Date.now().toString(36) + Math.random().toString(36).substr(2),
              timestamp: new Date().toISOString(),
              totalEur: totalEurCents, // Store in cents for consistency
              totalBgn,
              denominations: newDenominations,
              type: 'snapshot' as const
            };

            return {
              denominations: newDenominations,
              history: [...state.history, historyEntry],
              lastUpdated: new Date().toISOString(),
            };
          }

          return {
            denominations: newDenominations,
            lastUpdated: new Date().toISOString(),
          };
        }),

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
          history: [],
          goals: [],
          statistics: null,
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

      // History actions
      addHistoryEntry: (entry) =>
        set((state) => ({
          history: [...state.history, entry],
          lastUpdated: new Date().toISOString(),
        })),

      updateHistoryEntry: (id, entry) =>
        set((state) => ({
          history: state.history.map(h =>
            h.id === id ? { ...h, ...entry } : h
          ),
          lastUpdated: new Date().toISOString(),
        })),

      deleteHistoryEntry: (id) =>
        set((state) => ({
          history: state.history.filter(h => h.id !== id),
          lastUpdated: new Date().toISOString(),
        })),

      clearHistory: () =>
        set({
          history: [],
          lastUpdated: new Date().toISOString(),
        }),

      // Goal actions
      addGoal: (goal) =>
        set((state) => ({
          goals: [...state.goals, goal],
          lastUpdated: new Date().toISOString(),
        })),

      updateGoal: (id, goal) =>
        set((state) => ({
          goals: state.goals.map(g =>
            g.id === id ? { ...g, ...goal } : g
          ),
          lastUpdated: new Date().toISOString(),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter(g => g.id !== id),
          lastUpdated: new Date().toISOString(),
        })),

      clearGoals: () =>
        set({
          goals: [],
          lastUpdated: new Date().toISOString(),
        }),

      // Statistics actions
      updateStatistics: (stats) =>
        set({ statistics: stats, lastUpdated: new Date().toISOString() }),
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
        history: state.history,
        goals: state.goals,
        statistics: state.statistics,
      }),
    }
  )
);

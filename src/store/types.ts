import type { EURO_DENOMINATIONS } from './constants';
import type { HistoryEntry, SavingsGoal, HistoryStatistics, HistoryFilters, HistoryExportOptions } from '@/types/history';

export type { EURO_DENOMINATIONS };
export type { HistoryEntry, SavingsGoal, HistoryStatistics, HistoryFilters, HistoryExportOptions };

export interface EuroDenomination {
  id: string;
  label: string;
  value: number; // in Euro cents
  type: 'coin' | 'banknote';
  quantity: number;
}

export interface AppState {
  denominations: EuroDenomination[];
  theme: 'light' | 'dark';
  language: 'bg' | 'en';
  showBgn: boolean;
  lastUpdated: string | null;
  history: HistoryEntry[];
  goals: SavingsGoal[];
  statistics: HistoryStatistics | null;
}

export interface AppActions {
  setQuantity: (id: string, quantity: number) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'bg' | 'en') => void;
  setShowBgn: (showBgn: boolean) => void;
  resetAll: () => void;
  saveState: () => void;
  loadState: () => void;

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
  updateStatistics: (stats: HistoryStatistics) => void;
}

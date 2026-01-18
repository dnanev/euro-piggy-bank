import type { EuroDenomination } from '@/store/types';

export interface HistoryEntry {
  id: string;
  timestamp: string;
  totalEur: number;
  totalBgn: number;
  denominations: EuroDenomination[];
  type: 'snapshot' | 'manual-entry';
  title?: string;
  description?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  targetCurrency: 'EUR' | 'BGN';
  deadline: string | null;
  createdAt: string;
  achievedAt: string | null;
}

export interface HistoryStatistics {
  totalSnapshots: number;
  averageDailySaving: number;
  bestSavingDay: number;
  currentStreak: number;
  longestStreak: number;
  totalSavedEur: number;
  totalSavedBgn: number;
  periodComparison: {
    period1: {
      startDate: string;
      endDate: string;
      totalEur: number;
      totalBgn: number;
      entryCount: number;
    };
    period2: {
      startDate: string;
      endDate: string;
      totalEur: number;
      totalBgn: number;
      entryCount: number;
    };
  };
}

export interface HistoryFilters {
  dateRange: {
    start: string | null;
    end: string | null;
  };
  entryTypes: Array<'snapshot' | 'manual-entry'>;
  searchQuery: string;
}

export interface HistoryExportOptions {
  format: 'csv' | 'json';
  includeFilters: boolean;
  dateRange: HistoryFilters['dateRange'];
}

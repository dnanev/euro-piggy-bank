import type { EuroDenomination } from '@/store/types';
import type { HistoryEntry, SavingsGoal, HistoryStatistics, HistoryFilters } from '@/store/types';
import { convertEurToBgn, calculateTotal } from './currency';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const createHistoryEntry = (
  denominations: EuroDenomination[],
  type: HistoryEntry['type'] = 'snapshot'
): HistoryEntry => {
  const totalEur = calculateTotal(denominations);
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    totalEur,
    totalBgn: convertEurToBgn(totalEur),
    denominations: [...denominations],
    type
  };
};

export const createManualHistoryEntry = (
  title: string,
  amountEur: number,
  description: string,
  type: HistoryEntry['type'] = 'manual-entry'
): HistoryEntry => {
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    totalEur: amountEur,
    totalBgn: convertEurToBgn(amountEur),
    denominations: [], // Manual entries don't track denominations
    type,
    title,
    description
  };
};

export const calculateHistoryStatistics = (entries: HistoryEntry[]): HistoryStatistics => {
  if (entries.length === 0) {
    return {
      totalSnapshots: 0,
      averageDailySaving: 0,
      bestSavingDay: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalSavedEur: 0,
      totalSavedBgn: 0,
      periodComparison: {
        period1: {
          startDate: '',
          endDate: '',
          totalEur: 0,
          totalBgn: 0,
          entryCount: 0
        },
        period2: {
          startDate: '',
          endDate: '',
          totalEur: 0,
          totalBgn: 0,
          entryCount: 0
        }
      }
    };
  }

  const totalEur = entries.length > 0 ? entries[entries.length - 1].totalEur : 0;
  const totalBgn = entries.length > 0 ? entries[entries.length - 1].totalBgn : 0;

  // Calculate daily averages
  const dailySavings = entries.map(entry => entry.totalEur);
  const averageDailySaving = dailySavings.length > 0 ? dailySavings.reduce((sum, saving) => sum + saving, 0) / dailySavings.length : 0;

  // Find best saving day
  const bestSavingDay = Math.max(...dailySavings);

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].totalEur > 0) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
    }
  }

  currentStreak = tempStreak;

  return {
    totalSnapshots: entries.filter(e => e.type === 'snapshot').length,
    averageDailySaving,
    bestSavingDay,
    currentStreak,
    longestStreak,
    totalSavedEur: totalEur,
    totalSavedBgn: totalBgn,
    periodComparison: {
      period1: {
        startDate: '',
        endDate: '',
        totalEur: 0,
        totalBgn: 0,
        entryCount: 0
      },
      period2: {
        startDate: '',
        endDate: '',
        totalEur: 0,
        totalBgn: 0,
        entryCount: 0
      }
    }
  };
};

export const filterHistoryEntries = (
  entries: HistoryEntry[],
  filters: HistoryFilters
): HistoryEntry[] => {
  return entries.filter(entry => {
    // Date range filtering
    if (filters.dateRange.start && new Date(entry.timestamp) < new Date(filters.dateRange.start)) {
      return false;
    }
    if (filters.dateRange.end && new Date(entry.timestamp) > new Date(filters.dateRange.end)) {
      return false;
    }

    // Entry type filtering
    if (filters.entryTypes.length > 0 && !filters.entryTypes.includes(entry.type)) {
      return false;
    }

    // Search query filtering
    if (filters.searchQuery && !entry.title?.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });
};

export const exportHistoryData = (
  entries: HistoryEntry[],
  format: 'csv' | 'json',
  filters?: HistoryFilters
): string => {
  const filteredEntries = filters ? filterHistoryEntries(entries, filters) : entries;

  if (format === 'csv') {
    const headers = ['Date', 'Type', 'Title', 'Description', 'Total EUR', 'Total BGN'];
    const csvData = filteredEntries.map(entry => [
      new Date(entry.timestamp).toLocaleDateString('en-US'), // Use consistent locale for tests
      entry.type,
      entry.title || '',
      entry.description || '',
      (entry.totalEur / 100).toFixed(2), // Convert cents to euros
      entry.totalBgn.toFixed(2)
    ]);

    return [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
  }

  return JSON.stringify(filteredEntries, null, 2);
};

export const calculateGoalProgress = (goal: SavingsGoal, currentTotal: number): number => {
  if (!goal || goal.targetAmount <= 0) return 0;
  return Math.min((currentTotal / goal.targetAmount) * 100, 100);
};

export const getGoalDetails = (goal: SavingsGoal, currentTotal: number) => {
  if (!goal || goal.targetAmount <= 0) {
    return {
      progress: 0,
      remaining: 0,
      daysRemaining: null,
      isAchieved: false,
      isOverdue: false
    };
  }

  const progress = Math.min((currentTotal / goal.targetAmount) * 100, 100);
  const remaining = Math.max(goal.targetAmount - currentTotal, 0);
  const now = new Date();
  const deadline = goal.deadline ? new Date(goal.deadline) : null;

  const daysRemaining = deadline ?
    Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) :
    null;

  return {
    progress,
    remaining,
    daysRemaining,
    isAchieved: currentTotal >= goal.targetAmount,
    isOverdue: deadline ? now > deadline : false
  };
};

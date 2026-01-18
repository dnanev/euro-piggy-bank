import { describe, it, expect, vi } from 'vitest';
import type { EuroDenomination } from '@/store/types';
import type { HistoryEntry, SavingsGoal, HistoryFilters } from '@/store/types';

// Mock the currency utilities
vi.mock('@/utils/currency', () => ({
  convertEurToBgn: (cents: number) => (cents / 100) * 1.9544, // Mock EUR to BGN rate
  calculateTotal: (denominations: EuroDenomination[]) =>
    denominations.reduce((total, denom) => total + (denom.quantity * denom.value), 0)
}));

// Import functions after mocking
import {
  generateId,
  createHistoryEntry,
  createManualHistoryEntry,
  calculateHistoryStatistics,
  filterHistoryEntries,
  exportHistoryData,
  calculateGoalProgress,
  getGoalDetails
} from '../history';

describe('History Utilities', () => {
  const mockDenominations: EuroDenomination[] = [
    { id: '1-cent', label: '1¢', value: 1, quantity: 5, type: 'coin' },
    { id: '2-cent', label: '2¢', value: 2, quantity: 3, type: 'coin' },
    { id: '5-cent', label: '5¢', value: 5, quantity: 2, type: 'coin' },
    { id: '1-euro', label: '1€', value: 100, quantity: 1, type: 'coin' },
    { id: '5-euro', label: '5€', value: 500, quantity: 1, type: 'banknote' }
  ];

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
      expect(id2.length).toBeGreaterThan(0);
    });

    it('should generate IDs with consistent format', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+$/); // Should contain only lowercase letters and numbers
    });
  });

  describe('createHistoryEntry', () => {
    it('should create a snapshot entry with correct calculations', () => {
      const entry = createHistoryEntry(mockDenominations, 'snapshot');

      expect(entry.type).toBe('snapshot');
      expect(entry.denominations).toEqual(mockDenominations);
      expect(entry.totalEur).toBe(5 * 1 + 3 * 2 + 2 * 5 + 1 * 100 + 1 * 500); // 5 + 6 + 10 + 100 + 500 = 621
      expect(entry.totalBgn).toBeCloseTo(6.21 * 1.9544, 2);
      expect(entry.id).toMatch(/^[a-z0-9]+$/);
      expect(() => new Date(entry.timestamp)).not.toThrow();
    });

    it('should create manual-entry type by default', () => {
      const entry = createHistoryEntry(mockDenominations);
      expect(entry.type).toBe('snapshot'); // Default is 'snapshot'
    });

    it('should handle empty denominations', () => {
      const entry = createHistoryEntry([], 'snapshot');

      expect(entry.totalEur).toBe(0);
      expect(entry.totalBgn).toBe(0);
      expect(entry.denominations).toEqual([]);
    });
  });

  describe('createManualHistoryEntry', () => {
    it('should create a manual entry with provided data', () => {
      const entry = createManualHistoryEntry(
        'Manual Deposit',
        2500, // 25.00 EUR in cents
        'Added cash from wallet'
      );

      expect(entry.type).toBe('manual-entry');
      expect(entry.title).toBe('Manual Deposit');
      expect(entry.description).toBe('Added cash from wallet');
      expect(entry.totalEur).toBe(2500);
      expect(entry.totalBgn).toBeCloseTo(25 * 1.9544, 2);
      expect(entry.denominations).toEqual([]);
      expect(entry.id).toMatch(/^[a-z0-9]+$/);
    });

    it('should handle zero amount', () => {
      const entry = createManualHistoryEntry('Zero Entry', 0, 'Test');

      expect(entry.totalEur).toBe(0);
      expect(entry.totalBgn).toBe(0);
    });
  });

  describe('calculateHistoryStatistics', () => {
    const mockEntries: HistoryEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T00:00:00.000Z',
        totalEur: 1000,
        totalBgn: 1954.40,
        denominations: [],
        type: 'snapshot'
      },
      {
        id: '2',
        timestamp: '2024-01-02T00:00:00.000Z',
        totalEur: 1500,
        totalBgn: 2931.60,
        denominations: [],
        type: 'snapshot'
      },
      {
        id: '3',
        timestamp: '2024-01-03T00:00:00.000Z',
        totalEur: 500,
        totalBgn: 977.20,
        denominations: [],
        type: 'manual-entry',
        title: 'Manual',
        description: 'Test'
      }
    ];

    it('should calculate correct statistics', () => {
      const stats = calculateHistoryStatistics(mockEntries);

      expect(stats.totalSnapshots).toBe(2); // Only snapshot entries
      expect(stats.totalSavedEur).toBe(500); // Last entry: 500 cents
      expect(stats.totalSavedBgn).toBeCloseTo(977.20, 2); // Last entry BGN
      expect(stats.averageDailySaving).toBeCloseTo(1000, 2); // (1000 + 1500 + 500) / 3
      expect(stats.bestSavingDay).toBe(1500);
    });

    it('should handle empty entries', () => {
      const stats = calculateHistoryStatistics([]);

      expect(stats.totalSnapshots).toBe(0);
      expect(stats.totalSavedEur).toBe(0);
      expect(stats.totalSavedBgn).toBe(0);
      expect(stats.averageDailySaving).toBe(0);
      expect(stats.bestSavingDay).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.longestStreak).toBe(0);
    });

    it('should calculate streaks correctly', () => {
      const entriesWithStreaks: HistoryEntry[] = [
        { id: '1', timestamp: '2024-01-01T00:00:00.000Z', totalEur: 100, totalBgn: 195.44, denominations: [], type: 'snapshot' },
        { id: '2', timestamp: '2024-01-02T00:00:00.000Z', totalEur: 200, totalBgn: 390.88, denominations: [], type: 'snapshot' },
        { id: '3', timestamp: '2024-01-03T00:00:00.000Z', totalEur: 0, totalBgn: 0, denominations: [], type: 'snapshot' },
        { id: '4', timestamp: '2024-01-04T00:00:00.000Z', totalEur: 150, totalBgn: 293.16, denominations: [], type: 'snapshot' },
        { id: '5', timestamp: '2024-01-05T00:00:00.000Z', totalEur: 250, totalBgn: 488.60, denominations: [], type: 'snapshot' }
      ];

      const stats = calculateHistoryStatistics(entriesWithStreaks);

      expect(stats.currentStreak).toBe(2); // Last 2 entries have > 0
      expect(stats.longestStreak).toBe(2); // Longest streak was 2 at the beginning
    });
  });

  describe('filterHistoryEntries', () => {
    const mockEntries: HistoryEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T00:00:00.000Z',
        totalEur: 1000,
        totalBgn: 1954.40,
        denominations: [],
        type: 'snapshot'
      },
      {
        id: '2',
        timestamp: '2024-02-01T00:00:00.000Z',
        totalEur: 1500,
        totalBgn: 2931.60,
        denominations: [],
        type: 'manual-entry',
        title: 'February Deposit',
        description: 'Monthly savings'
      },
      {
        id: '3',
        timestamp: '2024-03-01T00:00:00.000Z',
        totalEur: 500,
        totalBgn: 977.20,
        denominations: [],
        type: 'snapshot'
      }
    ];

    it('should filter by date range', () => {
      const filters: HistoryFilters = {
        dateRange: {
          start: '2024-01-15T00:00:00.000Z',
          end: '2024-02-15T00:00:00.000Z'
        },
        entryTypes: ['snapshot', 'manual-entry'],
        searchQuery: ''
      };

      const filtered = filterHistoryEntries(mockEntries, filters);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });

    it('should filter by entry type', () => {
      const filters: HistoryFilters = {
        dateRange: { start: null, end: null },
        entryTypes: ['snapshot'],
        searchQuery: ''
      };

      const filtered = filterHistoryEntries(mockEntries, filters);
      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => e.type === 'snapshot')).toBe(true);
    });

    it('should filter by search query', () => {
      const filters: HistoryFilters = {
        dateRange: { start: null, end: null },
        entryTypes: ['snapshot', 'manual-entry'],
        searchQuery: 'February'
      };

      const filtered = filterHistoryEntries(mockEntries, filters);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('February Deposit');
    });

    it('should handle case-insensitive search', () => {
      const filters: HistoryFilters = {
        dateRange: { start: null, end: null },
        entryTypes: ['snapshot', 'manual-entry'],
        searchQuery: 'february'
      };

      const filtered = filterHistoryEntries(mockEntries, filters);
      expect(filtered).toHaveLength(1);
    });

    it('should return all entries when no filters applied', () => {
      const filters: HistoryFilters = {
        dateRange: { start: null, end: null },
        entryTypes: ['snapshot', 'manual-entry'],
        searchQuery: ''
      };

      const filtered = filterHistoryEntries(mockEntries, filters);
      expect(filtered).toHaveLength(3);
    });
  });

  describe('exportHistoryData', () => {
    const mockEntries: HistoryEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T00:00:00.000Z',
        totalEur: 1000,
        totalBgn: 1954.40,
        denominations: [],
        type: 'snapshot'
      },
      {
        id: '2',
        timestamp: '2024-01-02T00:00:00.000Z',
        totalEur: 1500,
        totalBgn: 2931.60,
        denominations: [],
        type: 'manual-entry',
        title: 'Manual Deposit',
        description: 'Test entry'
      }
    ];

    it('should export data as JSON', () => {
      const exported = exportHistoryData(mockEntries, 'json');
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].id).toBe('1');
      expect(parsed[1].title).toBe('Manual Deposit');
    });

    it('should export data as CSV', () => {
      const exported = exportHistoryData(mockEntries, 'csv');

      expect(exported).toContain('Date,Type,Title,Description,Total EUR,Total BGN');
      expect(exported).toContain('snapshot');
      expect(exported).toContain('manual-entry');
      expect(exported).toContain('Manual Deposit');
      expect(exported).toContain('10.00'); // 1000 cents = 10.00 EUR
      expect(exported).toContain('15.00'); // 1500 cents = 15.00 EUR
    });

    it('should apply filters before export', () => {
      const filters: HistoryFilters = {
        dateRange: { start: null, end: null },
        entryTypes: ['snapshot'],
        searchQuery: ''
      };

      const exported = exportHistoryData(mockEntries, 'json', filters);
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].type).toBe('snapshot');
    });
  });

  describe('calculateGoalProgress', () => {
    it('should calculate progress percentage correctly', () => {
      const goal: SavingsGoal = {
        id: 'goal1',
        title: 'Test Goal',
        targetAmount: 10000, // 100 EUR
        targetCurrency: 'EUR',
        deadline: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        achievedAt: null
      };

      expect(calculateGoalProgress(goal, 0)).toBe(0);
      expect(calculateGoalProgress(goal, 5000)).toBe(50);
      expect(calculateGoalProgress(goal, 10000)).toBe(100);
      expect(calculateGoalProgress(goal, 15000)).toBe(100); // Cap at 100%
    });

    it('should handle invalid goal', () => {
      expect(calculateGoalProgress(null as unknown as SavingsGoal, 1000)).toBe(0);
      expect(calculateGoalProgress(undefined as unknown as SavingsGoal, 1000)).toBe(0);

      const invalidGoal = { ...{} as SavingsGoal, targetAmount: 0 };
      expect(calculateGoalProgress(invalidGoal, 1000)).toBe(0);
    });
  });

  describe('getGoalDetails', () => {
    const goal: SavingsGoal = {
      id: 'goal1',
      title: 'Test Goal',
      targetAmount: 10000, // 100 EUR
      targetCurrency: 'EUR',
      deadline: '2026-12-31T23:59:59.000Z', // Future date from current time
      createdAt: '2024-01-01T00:00:00.000Z',
      achievedAt: null
    };

    it('should calculate goal details correctly', () => {
      const details = getGoalDetails(goal, 6000); // 60% progress

      expect(details.progress).toBe(60);
      expect(details.remaining).toBe(4000);
      expect(details.isAchieved).toBe(false);
      expect(details.isOverdue).toBe(false);
      expect(details.daysRemaining).toBeGreaterThan(0);
    });

    it('should handle achieved goal', () => {
      const details = getGoalDetails(goal, 12000); // 120% progress

      expect(details.progress).toBe(100);
      expect(details.remaining).toBe(0);
      expect(details.isAchieved).toBe(true);
    });

    it('should handle overdue goal', () => {
      const overdueGoal = {
        ...goal,
        deadline: '2023-12-31T23:59:59.000Z' // Past deadline
      };

      const details = getGoalDetails(overdueGoal, 5000);

      expect(details.isOverdue).toBe(true);
      expect(details.daysRemaining).toBe(0);
    });

    it('should handle goal without deadline', () => {
      const noDeadlineGoal = { ...goal, deadline: null };
      const details = getGoalDetails(noDeadlineGoal, 5000);

      expect(details.daysRemaining).toBeNull();
      expect(details.isOverdue).toBe(false);
    });
  });
});

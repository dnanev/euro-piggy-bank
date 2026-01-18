import { describe, it, expect } from 'vitest';
import { act } from '@testing-library/react';
import { useAppStore } from '../useAppStore';
import type { HistoryEntry, SavingsGoal } from '../types';
import { EURO_DENOMINATIONS } from '../constants';

describe('useAppStore - History Integration', () => {
  describe('History Management', () => {
    it('should add history entries', () => {
      // Reset store before test
      const store = useAppStore.getState();
      act(() => {
        store.resetAll();
      });

      const entry: HistoryEntry = {
        id: 'test-entry-1',
        timestamp: '2024-01-01T00:00:00.000Z',
        totalEur: 1000,
        totalBgn: 1954.40,
        denominations: [],
        type: 'snapshot'
      };

      act(() => {
        store.addHistoryEntry(entry);
      });

      expect(store.history).toHaveLength(1);
      expect(store.history[0]).toEqual(entry);
      expect(store.lastUpdated).toBeTruthy();
    });

    it('should update history entries', () => {
      const store = useAppStore.getState();

      const entry: HistoryEntry = {
        id: 'test-entry-1',
        timestamp: '2024-01-01T00:00:00.000Z',
        totalEur: 1000,
        totalBgn: 1954.40,
        denominations: [],
        type: 'snapshot'
      };

      act(() => {
        store.addHistoryEntry(entry);
      });

      const updatedEntry = {
        ...entry,
        totalEur: 1500,
        totalBgn: 2931.60
      };

      act(() => {
        store.updateHistoryEntry('test-entry-1', updatedEntry);
      });

      expect(store.history).toHaveLength(1);
      expect(store.history[0].totalEur).toBe(1500);
      expect(store.history[0].totalBgn).toBe(2931.60);
    });

    it('should delete history entries', () => {
      const store = useAppStore.getState();

      const entry1: HistoryEntry = {
        id: 'test-entry-1',
        timestamp: '2024-01-01T00:00:00.000Z',
        totalEur: 1000,
        totalBgn: 1954.40,
        denominations: [],
        type: 'snapshot'
      };

      const entry2: HistoryEntry = {
        id: 'test-entry-2',
        timestamp: '2024-01-02T00:00:00.000Z',
        totalEur: 1500,
        totalBgn: 2931.60,
        denominations: [],
        type: 'snapshot'
      };

      act(() => {
        store.addHistoryEntry(entry1);
        store.addHistoryEntry(entry2);
      });

      expect(store.history).toHaveLength(2);

      act(() => {
        store.deleteHistoryEntry('test-entry-1');
      });

      expect(store.history).toHaveLength(1);
      expect(store.history[0].id).toBe('test-entry-2');
    });

    it('should clear all history', () => {
      const store = useAppStore.getState();

      const entry: HistoryEntry = {
        id: 'test-entry-1',
        timestamp: '2024-01-01T00:00:00.000Z',
        totalEur: 1000,
        totalBgn: 1954.40,
        denominations: [],
        type: 'snapshot'
      };

      act(() => {
        store.addHistoryEntry(entry);
      });

      expect(store.history).toHaveLength(1);

      act(() => {
        store.clearHistory();
      });

      expect(store.history).toHaveLength(0);
    });

    it('should create automatic history entry when denomination quantity changes', () => {
      const store = useAppStore.getState();

      expect(store.history).toHaveLength(0);

      act(() => {
        store.setQuantity('1-cent', 5);
      });

      expect(store.history).toHaveLength(1);
      expect(store.history[0].type).toBe('snapshot');
      expect(store.history[0].totalEur).toBe(5); // 5 * 1 cent
      expect(store.history[0].denominations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: '1-cent', quantity: 5 })
        ])
      );
    });

    it('should not create history entry when quantity is set to 0', () => {
      const store = useAppStore.getState();

      act(() => {
        store.setQuantity('1-cent', 5);
      });

      expect(store.history).toHaveLength(1);

      act(() => {
        store.setQuantity('1-cent', 0);
      });

      // Should still have only the first entry, no new one for setting to 0
      expect(store.history).toHaveLength(1);
    });

    it('should not create history entry when quantity does not change', () => {
      const store = useAppStore.getState();

      act(() => {
        store.setQuantity('1-cent', 5);
      });

      expect(store.history).toHaveLength(1);

      act(() => {
        store.setQuantity('1-cent', 5); // Same quantity
      });

      expect(store.history).toHaveLength(1); // No new entry
    });
  });

  describe('Goal Management', () => {
    it('should add goals', () => {
      // Reset store before test
      const store = useAppStore.getState();
      act(() => {
        store.resetAll();
      });

      const goal: SavingsGoal = {
        id: 'goal-1',
        title: 'Emergency Fund',
        targetAmount: 10000,
        targetCurrency: 'EUR',
        deadline: '2024-12-31T23:59:59.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        achievedAt: null
      };

      act(() => {
        store.addGoal(goal);
      });

      expect(store.goals).toHaveLength(1);
      expect(store.goals[0]).toEqual(goal);
      expect(store.lastUpdated).toBeTruthy();
    });

    it('should update goals', () => {
      const store = useAppStore.getState();

      const goal: SavingsGoal = {
        id: 'goal-1',
        title: 'Emergency Fund',
        targetAmount: 10000,
        targetCurrency: 'EUR',
        deadline: '2024-12-31T23:59:59.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        achievedAt: null
      };

      act(() => {
        store.addGoal(goal);
      });

      act(() => {
        store.updateGoal('goal-1', { title: 'Updated Emergency Fund', targetAmount: 15000 });
      });

      expect(store.goals).toHaveLength(1);
      expect(store.goals[0].title).toBe('Updated Emergency Fund');
      expect(store.goals[0].targetAmount).toBe(15000);
      expect(store.goals[0].id).toBe('goal-1'); // ID should not change
    });

    it('should delete goals', () => {
      const store = useAppStore.getState();

      const goal1: SavingsGoal = {
        id: 'goal-1',
        title: 'Emergency Fund',
        targetAmount: 10000,
        targetCurrency: 'EUR',
        deadline: '2024-12-31T23:59:59.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        achievedAt: null
      };

      const goal2: SavingsGoal = {
        id: 'goal-2',
        title: 'Vacation Fund',
        targetAmount: 5000,
        targetCurrency: 'EUR',
        deadline: '2024-06-30T23:59:59.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        achievedAt: null
      };

      act(() => {
        store.addGoal(goal1);
        store.addGoal(goal2);
      });

      expect(store.goals).toHaveLength(2);

      act(() => {
        store.deleteGoal('goal-1');
      });

      expect(store.goals).toHaveLength(1);
      expect(store.goals[0].id).toBe('goal-2');
    });

    it('should clear all goals', () => {
      const store = useAppStore.getState();

      const goal: SavingsGoal = {
        id: 'goal-1',
        title: 'Emergency Fund',
        targetAmount: 10000,
        targetCurrency: 'EUR',
        deadline: '2024-12-31T23:59:59.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        achievedAt: null
      };

      act(() => {
        store.addGoal(goal);
      });

      expect(store.goals).toHaveLength(1);

      act(() => {
        store.clearGoals();
      });

      expect(store.goals).toHaveLength(0);
    });
  });

  describe('Statistics Management', () => {
    it('should update statistics', () => {
      // Reset store before test
      const store = useAppStore.getState();
      act(() => {
        store.resetAll();
      });

      const stats = {
        totalSnapshots: 10,
        averageDailySaving: 150.50,
        bestSavingDay: 500,
        currentStreak: 5,
        longestStreak: 8,
        totalSavedEur: 25000,
        totalSavedBgn: 48860,
        periodComparison: {
          period1: {
            startDate: '2024-01-01T00:00:00.000Z',
            endDate: '2024-01-31T23:59:59.000Z',
            totalEur: 10000,
            totalBgn: 19544,
            entryCount: 5
          },
          period2: {
            startDate: '2024-02-01T00:00:00.000Z',
            endDate: '2024-02-29T23:59:59.000Z',
            totalEur: 15000,
            totalBgn: 29316,
            entryCount: 5
          }
        }
      };

      act(() => {
        store.updateStatistics(stats);
      });

      expect(store.statistics).toEqual(stats);
      expect(store.lastUpdated).toBeTruthy();
    });
  });

  describe('Store Persistence', () => {
    it('should persist history and goals across store instances', () => {
      // Reset store before test
      const store1 = useAppStore.getState();
      act(() => {
        store1.resetAll();
      });

      const entry: HistoryEntry = {
        id: 'test-entry-1',
        timestamp: '2024-01-01T00:00:00.000Z',
        totalEur: 1000,
        totalBgn: 1954.40,
        denominations: [],
        type: 'snapshot'
      };

      const goal: SavingsGoal = {
        id: 'goal-1',
        title: 'Emergency Fund',
        targetAmount: 10000,
        targetCurrency: 'EUR',
        deadline: '2024-12-31T23:59:59.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        achievedAt: null
      };

      act(() => {
        store1.addHistoryEntry(entry);
        store1.addGoal(goal);
      });

      // Create a new store instance (simulating page reload)
      const store2 = useAppStore.getState();

      expect(store2.history).toHaveLength(1);
      expect(store2.history[0]).toEqual(entry);
      expect(store2.goals).toHaveLength(1);
      expect(store2.goals[0]).toEqual(goal);
    });

    it('should reset all data including history and goals', () => {
      const store = useAppStore.getState();

      const entry: HistoryEntry = {
        id: 'test-entry-1',
        timestamp: '2024-01-01T00:00:00.000Z',
        totalEur: 1000,
        totalBgn: 1954.40,
        denominations: [],
        type: 'snapshot'
      };

      const goal: SavingsGoal = {
        id: 'goal-1',
        title: 'Emergency Fund',
        targetAmount: 10000,
        targetCurrency: 'EUR',
        deadline: '2024-12-31T23:59:59.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        achievedAt: null
      };

      const stats = {
        totalSnapshots: 10,
        averageDailySaving: 150.50,
        bestSavingDay: 500,
        currentStreak: 5,
        longestStreak: 8,
        totalSavedEur: 25000,
        totalSavedBgn: 48860,
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

      act(() => {
        store.addHistoryEntry(entry);
        store.addGoal(goal);
        store.updateStatistics(stats);
      });

      expect(store.history).toHaveLength(1);
      expect(store.goals).toHaveLength(1);
      expect(store.statistics).toEqual(stats);

      act(() => {
        store.resetAll();
      });

      expect(store.history).toHaveLength(0);
      expect(store.goals).toHaveLength(0);
      expect(store.statistics).toBeNull();
      expect(store.denominations).toEqual(EURO_DENOMINATIONS);
      expect(store.theme).toBe('light');
      expect(store.language).toBe('bg');
      expect(store.showBgn).toBe(false);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { calculateHistoryStatistics } from '../history';
import { createHistoryEntry } from '../history';
import type { EuroDenomination } from '@/store/types';

describe('Statistics Bug Fix Verification', () => {
  it('should calculate totalSavedEur based on last entry, not sum of all entries', () => {
    // Create mock denominations for 50 cents
    const mockDenominations: EuroDenomination[] = [
      { id: '50c', label: '50¢', value: 50, type: 'coin', quantity: 1 }
    ];

    // Create history entries simulating user clicking 4 times on 50 cents
    const entries = [
      createHistoryEntry([{ ...mockDenominations[0], quantity: 1 }], 'snapshot'), // 50 cents
      createHistoryEntry([{ ...mockDenominations[0], quantity: 2 }], 'snapshot'), // 100 cents
      createHistoryEntry([{ ...mockDenominations[0], quantity: 3 }], 'snapshot'), // 150 cents
      createHistoryEntry([{ ...mockDenominations[0], quantity: 4 }], 'snapshot'), // 200 cents
    ];

    console.log('=== Statistics Bug Fix Test ===');
    entries.forEach((entry, index) => {
      console.log(`Entry ${index + 1}: ${entry.totalEur} cents = ${entry.totalEur / 100} EUR`);
    });

    const stats = calculateHistoryStatistics(entries);

    console.log('Statistics result:');
    console.log('totalSavedEur (cents):', stats.totalSavedEur);
    console.log('totalSavedEur (euros):', stats.totalSavedEur / 100);
    console.log('totalSavedBgn:', stats.totalSavedBgn);

    // The bug was that it would sum all entries: 50 + 100 + 150 + 200 = 500 cents (5.00 EUR)
    // The fix should use only the last entry: 200 cents (2.00 EUR)
    expect(stats.totalSavedEur).toBe(200); // Should be 200 cents (last entry)
    expect(stats.totalSavedEur / 100).toBe(2); // Should be 2.00 EUR
    expect(stats.totalSavedBgn).toBeCloseTo(3.91, 2); // Should be ~3.91 BGN

    // Ensure it's not the buggy behavior
    expect(stats.totalSavedEur).not.toBe(500); // Should not be 500 cents (sum of all entries)
  });

  it('should handle empty history correctly', () => {
    const stats = calculateHistoryStatistics([]);

    expect(stats.totalSavedEur).toBe(0);
    expect(stats.totalSavedBgn).toBe(0);
    expect(stats.averageDailySaving).toBe(0);
    expect(stats.bestSavingDay).toBe(0);
  });

  it('should handle single entry correctly', () => {
    const mockDenominations: EuroDenomination[] = [
      { id: '1e', label: '1€', value: 100, type: 'coin', quantity: 1 }
    ];

    const entries = [
      createHistoryEntry(mockDenominations, 'snapshot'), // 100 cents
    ];

    const stats = calculateHistoryStatistics(entries);

    expect(stats.totalSavedEur).toBe(100); // Should be 100 cents
    expect(stats.totalSavedEur / 100).toBe(1); // Should be 1.00 EUR
  });

  it('should work with mixed denominations', () => {
    const mockDenominations: EuroDenomination[] = [
      { id: '1e', label: '1€', value: 100, type: 'coin', quantity: 1 },
      { id: '50c', label: '50¢', value: 50, type: 'coin', quantity: 2 }
    ];

    const entries = [
      createHistoryEntry(mockDenominations, 'snapshot'), // 200 cents total
    ];

    const stats = calculateHistoryStatistics(entries);

    expect(stats.totalSavedEur).toBe(200); // Should be 200 cents
    expect(stats.totalSavedEur / 100).toBe(2); // Should be 2.00 EUR
  });
});

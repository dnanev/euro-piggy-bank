import { describe, it, expect } from 'vitest';
import { convertEurToBgn, calculateTotal } from '../currency';
import { createHistoryEntry, calculateHistoryStatistics } from '../history';
import type { EuroDenomination } from '@/store/types';

describe('Debug History Calculations', () => {
  it('should correctly calculate single 2 euro increment', () => {
    // Simulate adding 1 x 2€ coin
    const mockDenominations: EuroDenomination[] = [
      { id: '2e', label: '2€', value: 200, type: 'coin', quantity: 1 }
    ];

    const totalCents = calculateTotal(mockDenominations);
    const totalEuros = totalCents / 100;
    const totalBgn = convertEurToBgn(totalCents);

    console.log('=== 2€ Calculation Debug ===');
    console.log('Total cents:', totalCents);
    console.log('Total euros:', totalEuros);
    console.log('Total BGN:', totalBgn);

    expect(totalCents).toBe(200);
    expect(totalEuros).toBe(2);
    expect(totalBgn).toBeCloseTo(3.91, 2);
  });

  it('should correctly calculate history entry for 2 euros', () => {
    const mockDenominations: EuroDenomination[] = [
      { id: '2e', label: '2€', value: 200, type: 'coin', quantity: 1 }
    ];

    const entry = createHistoryEntry(mockDenominations, 'snapshot');

    console.log('=== History Entry Debug ===');
    console.log('Entry totalEur (cents):', entry.totalEur);
    console.log('Entry totalBgn:', entry.totalBgn);
    console.log('Entry totalEur in euros:', entry.totalEur / 100);

    expect(entry.totalEur).toBe(200);
    expect(entry.totalBgn).toBeCloseTo(3.91, 2);
  });

  it('should correctly calculate statistics for 2 euros', () => {
    const mockDenominations: EuroDenomination[] = [
      { id: '2e', label: '2€', value: 200, type: 'coin', quantity: 1 }
    ];

    const entry = createHistoryEntry(mockDenominations, 'snapshot');
    const stats = calculateHistoryStatistics([entry]);

    console.log('=== Statistics Debug ===');
    console.log('Stats totalSavedEur (cents):', stats.totalSavedEur);
    console.log('Stats totalSavedEur in euros:', stats.totalSavedEur / 100);
    console.log('Stats totalSavedBgn:', stats.totalSavedBgn);
    console.log('Stats averageDailySaving (cents):', stats.averageDailySaving);
    console.log('Stats averageDailySaving in euros:', stats.averageDailySaving / 100);
    console.log('Stats bestSavingDay (cents):', stats.bestSavingDay);
    console.log('Stats bestSavingDay in euros:', stats.bestSavingDay / 100);

    expect(stats.totalSavedEur).toBe(200);
    expect(stats.totalSavedBgn).toBeCloseTo(3.91, 2);
    expect(stats.averageDailySaving).toBe(200);
    expect(stats.bestSavingDay).toBe(200);
  });

  it('should correctly calculate multiple denominations', () => {
    const mockDenominations: EuroDenomination[] = [
      { id: '1e', label: '1€', value: 100, type: 'coin', quantity: 1 }, // 1 EUR
      { id: '2e', label: '2€', value: 200, type: 'coin', quantity: 1 }, // 2 EUR
      { id: '50c', label: '50¢', value: 50, type: 'coin', quantity: 2 }  // 1 EUR (50c x 2 = 100c)
    ];

    const entry = createHistoryEntry(mockDenominations, 'snapshot');
    const stats = calculateHistoryStatistics([entry]);

    console.log('=== Multiple Denominations Debug ===');
    console.log('Entry totalEur (cents):', entry.totalEur);
    console.log('Entry totalEur in euros:', entry.totalEur / 100);
    console.log('Entry totalBgn:', entry.totalBgn);

    expect(entry.totalEur).toBe(400); // 100 + 200 + 100 = 400 cents = 4 EUR
    expect(entry.totalBgn).toBeCloseTo(7.82, 2); // 4 * 1.95583 = 7.82
    expect(stats.totalSavedEur).toBe(400);
  });

  it('should test exact BGN conversion rate', () => {
    const testCases = [
      { cents: 100, expectedBgn: 1.96 }, // 1 EUR
      { cents: 200, expectedBgn: 3.91 }, // 2 EUR
      { cents: 500, expectedBgn: 9.78 }, // 5 EUR
      { cents: 1000, expectedBgn: 19.56 } // 10 EUR
    ];

    console.log('=== BGN Conversion Rate Debug ===');
    testCases.forEach(({ cents, expectedBgn }) => {
      const bgn = convertEurToBgn(cents);
      const euros = cents / 100;
      console.log(`${cents} cents (${euros} EUR) = ${bgn.toFixed(2)} BGN (expected: ${expectedBgn})`);
      expect(bgn).toBeCloseTo(expectedBgn, 2);
    });
  });
});

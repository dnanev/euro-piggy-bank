import { describe, it, expect } from 'vitest';
import { convertEurToBgn, calculateTotal } from '../currency';
import { createHistoryEntry } from '../history';
import type { EuroDenomination } from '@/store/types';

describe('Calculation Fix Verification', () => {
  it('should correctly calculate 2 euros as 200 cents', () => {
    const mockDenominations: EuroDenomination[] = [
      { id: '2e', label: '2€', value: 200, type: 'coin', quantity: 1 }
    ];

    const total = calculateTotal(mockDenominations);
    expect(total).toBe(200); // Should be 200 cents
  });

  it('should correctly create history entry for 2 euros', () => {
    const mockDenominations: EuroDenomination[] = [
      { id: '2e', label: '2€', value: 200, type: 'coin', quantity: 1 }
    ];

    const entry = createHistoryEntry(mockDenominations, 'snapshot');

    expect(entry.totalEur).toBe(200); // Should store 200 cents
    expect(entry.totalBgn).toBeCloseTo(3.91, 2); // 2 EUR * 1.95583 = 3.91 BGN
  });

  it('should correctly convert 200 cents to BGN', () => {
    const bgnAmount = convertEurToBgn(200); // 200 cents = 2 EUR
    expect(bgnAmount).toBeCloseTo(3.91, 2); // 2 * 1.95583 = 3.91
  });

  it('should correctly calculate multiple denominations', () => {
    const mockDenominations: EuroDenomination[] = [
      { id: '1e', label: '1€', value: 100, type: 'coin', quantity: 2 }, // 2 EUR
      { id: '2e', label: '2€', value: 200, type: 'coin', quantity: 1 }, // 2 EUR
      { id: '50c', label: '50¢', value: 50, type: 'coin', quantity: 2 } // 1 EUR
    ];

    const total = calculateTotal(mockDenominations);
    expect(total).toBe(500); // Should be 500 cents (5 EUR)
  });

  it('should correctly create history entry for 5 euros total', () => {
    const mockDenominations: EuroDenomination[] = [
      { id: '1e', label: '1€', value: 100, type: 'coin', quantity: 2 },
      { id: '2e', label: '2€', value: 200, type: 'coin', quantity: 1 },
      { id: '50c', label: '50¢', value: 50, type: 'coin', quantity: 2 }
    ];

    const entry = createHistoryEntry(mockDenominations, 'snapshot');

    expect(entry.totalEur).toBe(500); // Should store 500 cents
    expect(entry.totalBgn).toBeCloseTo(9.78, 2); // 5 EUR * 1.95583 = 9.78 BGN
  });
});

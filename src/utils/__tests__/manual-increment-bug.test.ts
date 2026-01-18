import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useAppStore } from '@/store/useAppStore';

describe('Manual Increment Bug Investigation', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useAppStore.getState();
    act(() => {
      store.resetAll();
    });
  });

  it('should correctly track multiple manual increments of 50 cents', () => {
    const store = useAppStore.getState();

    console.log('=== Manual Increment Bug Investigation ===');
    console.log('Initial state:');
    console.log('History count:', store.history.length);
    console.log('Initial 50c quantity:', store.denominations.find(d => d.id === '50c')?.quantity);

    // Simulate user clicking 4 times on 50 cents with 1 sec delay
    // First increment: 0 → 1
    act(() => {
      store.setQuantity('50c', 1);
    });

    let updatedStore = useAppStore.getState();
    console.log('After 1st increment (50c):');
    console.log('50c quantity:', updatedStore.denominations.find(d => d.id === '50c')?.quantity);
    console.log('History count:', updatedStore.history.length);
    if (updatedStore.history.length > 0) {
      const entry = updatedStore.history[updatedStore.history.length - 1];
      console.log('Last entry totalEur (cents):', entry.totalEur);
      console.log('Last entry totalEur (euros):', entry.totalEur / 100);
      console.log('Last entry totalBgn:', entry.totalBgn);
    }

    // Second increment: 1 → 2
    act(() => {
      store.setQuantity('50c', 2);
    });

    updatedStore = useAppStore.getState();
    console.log('After 2nd increment (50c):');
    console.log('50c quantity:', updatedStore.denominations.find(d => d.id === '50c')?.quantity);
    console.log('History count:', updatedStore.history.length);
    if (updatedStore.history.length > 0) {
      const entry = updatedStore.history[updatedStore.history.length - 1];
      console.log('Last entry totalEur (cents):', entry.totalEur);
      console.log('Last entry totalEur (euros):', entry.totalEur / 100);
      console.log('Last entry totalBgn:', entry.totalBgn);
    }

    // Third increment: 2 → 3
    act(() => {
      store.setQuantity('50c', 3);
    });

    updatedStore = useAppStore.getState();
    console.log('After 3rd increment (50c):');
    console.log('50c quantity:', updatedStore.denominations.find(d => d.id === '50c')?.quantity);
    console.log('History count:', updatedStore.history.length);
    if (updatedStore.history.length > 0) {
      const entry = updatedStore.history[updatedStore.history.length - 1];
      console.log('Last entry totalEur (cents):', entry.totalEur);
      console.log('Last entry totalEur (euros):', entry.totalEur / 100);
      console.log('Last entry totalBgn:', entry.totalBgn);
    }

    // Fourth increment: 3 → 4
    act(() => {
      store.setQuantity('50c', 4);
    });

    updatedStore = useAppStore.getState();
    console.log('After 4th increment (50c):');
    console.log('50c quantity:', updatedStore.denominations.find(d => d.id === '50c')?.quantity);
    console.log('History count:', updatedStore.history.length);
    if (updatedStore.history.length > 0) {
      const entry = updatedStore.history[updatedStore.history.length - 1];
      console.log('Last entry totalEur (cents):', entry.totalEur);
      console.log('Last entry totalEur (euros):', entry.totalEur / 100);
      console.log('Last entry totalBgn:', entry.totalBgn);
    }

    // Verify the final state
    expect(updatedStore.history).toHaveLength(4); // Should have 4 history entries
    const lastEntry = updatedStore.history[updatedStore.history.length - 1];

    // 4 x 50c = 200 cents = 2.00 EUR
    expect(lastEntry.totalEur).toBe(200); // Should be 200 cents
    expect(lastEntry.totalEur / 100).toBe(2); // Should be 2 euros
    expect(lastEntry.totalBgn).toBeCloseTo(3.91, 2); // Should be ~3.91 BGN

    console.log('=== Expected vs Actual ===');
    console.log('Expected total: 4 x 50c = 200 cents = 2.00 EUR');
    console.log('Actual total:', lastEntry.totalEur, 'cents =', lastEntry.totalEur / 100, 'EUR');
  });

  it('should correctly track mixed denomination increments', () => {
    const store = useAppStore.getState();

    console.log('=== Mixed Denomination Test ===');

    // Add 1€ coin
    act(() => {
      store.setQuantity('1e', 1);
    });

    // Add 50c coin twice
    act(() => {
      store.setQuantity('50c', 2);
    });

    // Add 2€ coin
    act(() => {
      store.setQuantity('2e', 1);
    });

    const updatedStore = useAppStore.getState();
    console.log('Final state:');
    console.log('1€ quantity:', updatedStore.denominations.find(d => d.id === '1e')?.quantity);
    console.log('50c quantity:', updatedStore.denominations.find(d => d.id === '50c')?.quantity);
    console.log('2€ quantity:', updatedStore.denominations.find(d => d.id === '2e')?.quantity);
    console.log('History count:', updatedStore.history.length);

    if (updatedStore.history.length > 0) {
      const entry = updatedStore.history[updatedStore.history.length - 1];
      console.log('Last entry totalEur (cents):', entry.totalEur);
      console.log('Last entry totalEur (euros):', entry.totalEur / 100);
      console.log('Last entry totalBgn:', entry.totalBgn);

      // Expected: 1€ (100c) + 50c x 2 (100c) + 2€ (200c) = 400c = 4.00 EUR
      const expectedCents = 100 + 100 + 200; // 400 cents
      console.log('Expected total:', expectedCents, 'cents =', expectedCents / 100, 'EUR');

      expect(entry.totalEur).toBe(expectedCents);
      expect(entry.totalEur / 100).toBe(4);
    }
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useAppStore } from '@/store/useAppStore';

describe('Store History Behavior Debug', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useAppStore.getState();
    act(() => {
      store.resetAll();
    });
  });

  it('should create correct history entry when incrementing 2 euros', () => {
    const store = useAppStore.getState();

    console.log('=== Store Behavior Debug ===');
    console.log('Initial state:');
    console.log('Denominations count:', store.denominations.length);
    console.log('History count:', store.history.length);
    console.log('Initial 2e quantity:', store.denominations.find(d => d.id === '2e')?.quantity);

    // Increment 2€ coin from 0 to 1
    act(() => {
      console.log('Before setQuantity call');
      console.log('Current 2e quantity:', store.denominations.find(d => d.id === '2e')?.quantity);
      store.setQuantity('2e', 1);
      console.log('After setQuantity call');
      console.log('New 2e quantity:', store.denominations.find(d => d.id === '2e')?.quantity);
    });

    // Get fresh store state after the act
    const updatedStore = useAppStore.getState();
    console.log('After incrementing 2€:');
    console.log('2€ quantity:', updatedStore.denominations.find(d => d.id === '2e')?.quantity);
    console.log('History count:', updatedStore.history.length);

    if (store.history.length > 0) {
      const lastEntry = store.history[store.history.length - 1];
      console.log('Last history entry:');
      console.log('  totalEur (cents):', lastEntry.totalEur);
      console.log('  totalEur (euros):', lastEntry.totalEur / 100);
      console.log('  totalBgn:', lastEntry.totalBgn);
      console.log('  type:', lastEntry.type);
      console.log('  denominations count:', lastEntry.denominations.length);

      // Check if the 2€ coin is in the denominations
      const twoEuroCoin = lastEntry.denominations.find(d => d.id === '2e');
      console.log('  2€ coin in entry:', twoEuroCoin ? 'Yes' : 'No');
      if (twoEuroCoin) {
        console.log('  2€ coin quantity:', twoEuroCoin.quantity);
        console.log('  2€ coin value:', twoEuroCoin.value);
      }
    }

    // Verify the calculations
    expect(updatedStore.history).toHaveLength(1);
    const entry = updatedStore.history[0];
    expect(entry.totalEur).toBe(200); // Should be 200 cents
    expect(entry.totalEur / 100).toBe(2); // Should be 2 euros
    expect(entry.totalBgn).toBeCloseTo(3.91, 2); // Should be ~3.91 BGN
  });

  it('should create correct history entry when incrementing multiple times', () => {
    const store = useAppStore.getState();

    console.log('=== Multiple Increments Debug ===');

    // Add 1€ coin
    act(() => {
      store.setQuantity('1e', 1);
    });

    // Add 2€ coin
    act(() => {
      store.setQuantity('2e', 1);
    });

    // Add 50¢ coins
    act(() => {
      store.setQuantity('50c', 2);
    });

    // Get fresh store state after all increments
    const updatedStore = useAppStore.getState();
    console.log('After multiple increments:');
    console.log('History count:', updatedStore.history.length);

    if (updatedStore.history.length > 0) {
      const lastEntry = updatedStore.history[updatedStore.history.length - 1];
      console.log('Last history entry:');
      console.log('  totalEur (cents):', lastEntry.totalEur);
      console.log('  totalEur (euros):', lastEntry.totalEur / 100);
      console.log('  totalBgn:', lastEntry.totalBgn);

      // Calculate expected total
      const expectedCents = 100 + 200 + 100; // 1€ + 2€ + (50¢ x 2)
      console.log('Expected total cents:', expectedCents);
      console.log('Expected total euros:', expectedCents / 100);
    }

    expect(updatedStore.history).toHaveLength(3); // Should have 3 history entries
    const lastEntry = updatedStore.history[updatedStore.history.length - 1];
    expect(lastEntry.totalEur).toBe(400); // Should be 400 cents
    expect(lastEntry.totalEur / 100).toBe(4); // Should be 4 euros
    expect(lastEntry.totalBgn).toBeCloseTo(7.82, 2); // Should be ~7.82 BGN
  });

  it('should not create history entry when quantity is set to 0', () => {
    const store = useAppStore.getState();

    // First increment
    act(() => {
      store.setQuantity('2e', 1);
    });

    const historyCountAfterIncrement = store.history.length;

    // Then set to 0
    act(() => {
      store.setQuantity('2e', 0);
    });

    console.log('=== Zero Quantity Debug ===');
    console.log('History after increment:', historyCountAfterIncrement);
    console.log('History after setting to 0:', store.history.length);
    console.log('2€ quantity:', store.denominations.find(d => d.id === '2e')?.quantity);

    // Should not have created a new history entry
    expect(store.history).toHaveLength(historyCountAfterIncrement);
  });
});

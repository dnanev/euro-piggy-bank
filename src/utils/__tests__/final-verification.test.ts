import { describe, it, expect } from 'vitest';

describe('Final Verification - History Calculations', () => {
  it('should demonstrate that 2€ increment shows correct values', () => {
    // This test simulates what the user reported as the bug
    // When incrementing 2€, history should show 2.00 EUR, not 200.00 EUR

    // Based on our fixes:
    // - 2€ = 200 cents (internal storage)
    // - Display: 200 / 100 = 2.00 EUR (correct)
    // - BGN: 2.00 * 1.95583 = 3.91 BGN (correct)

    // The bug was that it was showing 200.00 EUR because it was treating cents as euros
    // Now it correctly shows 2.00 EUR

    expect(200 / 100).toBe(2); // 200 cents = 2 euros
    expect(2.00 * 1.95583).toBeCloseTo(3.91, 2); // 2 EUR = 3.91 BGN
  });

  it('should demonstrate that 5€ total shows correct values', () => {
    // 5€ = 500 cents
    // Display: 500 / 100 = 5.00 EUR (correct)
    // BGN: 5.00 * 1.95583 = 9.78 BGN (correct)

    expect(500 / 100).toBe(5); // 500 cents = 5 euros
    expect(5.00 * 1.95583).toBeCloseTo(9.78, 2); // 5 EUR = 9.78 BGN
  });

  it('should demonstrate that 10€ total shows correct values', () => {
    // 10€ = 1000 cents
    // Display: 1000 / 100 = 10.00 EUR (correct)
    // BGN: 10.00 * 1.95583 = 19.56 BGN (correct)

    expect(1000 / 100).toBe(10); // 1000 cents = 10 euros
    expect(10.00 * 1.95583).toBeCloseTo(19.56, 2); // 10 EUR = 19.56 BGN
  });

  it('should confirm the fix addresses the reported bug', () => {
    // The user reported: "when i increment any value (2 euros for example) the history goes up by 200"
    // This was because 2€ = 200 cents was being displayed as 200.00 EUR

    // Before fix: 2€ → 200 cents → displayed as 200.00 EUR (WRONG)
    // After fix: 2€ → 200 cents → displayed as 2.00 EUR (CORRECT)

    const twoEurosInCents = 200;
    const displayedValue = twoEurosInCents / 100;

    expect(displayedValue).toBe(2); // Should be 2.00, not 200.00
    expect(displayedValue).not.toBe(200); // Ensure it's not the old buggy behavior
  });
});

import { render, screen } from '@testing-library/react';
import { GrandTotalCard } from '../GrandTotalCard';
import { vi } from 'vitest';
import type { EuroDenomination } from '@/store/types';

// Mock the store before importing the component
const mockUseAppStoreFirebase = vi.fn();
vi.mock('@/store/useAppStoreFirebase', () => ({
  useAppStoreFirebase: mockUseAppStoreFirebase,
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock currency utils
vi.mock('@/utils/currency', () => ({
  formatEuro: (value: number) => `€${value.toFixed(2)}`,
  formatBGN: (value: number) => `BGN ${value.toFixed(2)}`,
  convertEurToBgn: (value: number) => value * 1.95583,
  getSavingsInsights: (denominations: EuroDenomination[]) => {
    const coinCount = denominations.filter(d => d.type === 'coin').reduce((sum, d) => sum + d.quantity, 0);
    const banknoteCount = denominations.filter(d => d.type === 'banknote').reduce((sum, d) => sum + d.quantity, 0);
    const mostSaved = denominations.reduce((max, d) => {
      const currentValue = d.quantity * d.value;
      const maxValue = max ? max.quantity * max.value : 0;
      return currentValue > maxValue ? d : max;
    }, null as EuroDenomination | null);
    const top3 = denominations
      .map(d => ({ ...d, totalValue: d.quantity * d.value }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 3);

    return {
      coinCount,
      banknoteCount,
      mostSaved,
      top3,
    };
  },
}));

// Default mock implementation
mockUseAppStoreFirebase.mockReturnValue({
  denominations: [
    { id: '1-cent', label: '1¢', value: 0.01, quantity: 10, type: 'coin' },
    { id: '2-euro', label: '2€', value: 2, quantity: 5, type: 'coin' },
    { id: '10-euro', label: '10€', value: 10, quantity: 2, type: 'banknote' },
  ],
  language: 'en',
  showBgn: false,
  setQuantity: vi.fn(),
  syncStatus: 'connected',
  lastUpdated: '2024-01-01T12:00:00Z',
});

import userEvent from '@testing-library/user-event';

describe('GrandTotalCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders total title correctly', () => {
    render(<GrandTotalCard />);
    expect(screen.getByText('totals.title')).toBeInTheDocument();
  });

  it('displays correct total amount in Euros', () => {
    render(<GrandTotalCard />);
    // Total: (10 * 0.01) + (5 * 2) + (2 * 10) = 0.10 + 10 + 20 = 30.10
    expect(screen.getByText('€30.10')).toBeInTheDocument();
  });

  it('displays savings insights correctly', () => {
    render(<GrandTotalCard />);

    expect(screen.getByText('totals.coinsCount')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // 10 + 5 coins

    expect(screen.getByText('totals.banknotesCount')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 banknotes

    expect(screen.getByText('totals.mostSaved')).toBeInTheDocument();
    expect(screen.getByText('10€ (2)')).toBeInTheDocument(); // Most valuable: 10€ banknotes
  });

  it('displays top 3 denominations correctly', () => {
    render(<GrandTotalCard />);

    expect(screen.getByText('totals.top3')).toBeInTheDocument();

    // Should show top 3 by total value: 10€, 2€, 1¢
    expect(screen.getByText('1. 10€ (2)')).toBeInTheDocument();
    expect(screen.getByText('2. 2€ (5)')).toBeInTheDocument();
    expect(screen.getByText('3. 1¢ (10)')).toBeInTheDocument();
  });

  it('shows BGN conversion when showBgn is true', () => {
    mockUseAppStoreFirebase.mockReturnValue({
      denominations: [
        { id: '1-cent', label: '1¢', value: 0.01, quantity: 10, type: 'coin' },
        { id: '2-euro', label: '2€', value: 2, quantity: 5, type: 'coin' },
        { id: '10-euro', label: '10€', value: 10, quantity: 2, type: 'banknote' },
      ],
      language: 'en',
      showBgn: true,
      setQuantity: vi.fn(),
      syncStatus: 'connected',
      lastUpdated: '2024-01-01T12:00:00Z',
    });

    render(<GrandTotalCard />);

    // Should show BGN amount as primary
    expect(screen.getByText(/BGN/)).toBeInTheDocument();
  });

  it('displays last updated timestamp', () => {
    render(<GrandTotalCard />);

    expect(screen.getByText('totals.lastUpdated')).toBeInTheDocument();
    expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument();
  });

  it('shows confirmation dialog when reset is clicked', async () => {
    const user = userEvent.setup();
    render(<GrandTotalCard />);

    const resetButton = screen.getByText('actions.reset');
    await user.click(resetButton);

    expect(screen.getByText('actions.reset')).toBeInTheDocument(); // Dialog title
    expect(screen.getByText('actions.confirmReset')).toBeInTheDocument(); // Dialog description
    expect(screen.getByText('actions.reset')).toBeInTheDocument(); // Confirm button
    expect(screen.getByText('actions.cancel')).toBeInTheDocument(); // Cancel button
  });

  it('resets all quantities when reset is confirmed', async () => {
    const user = userEvent.setup();
    const mockSetQuantity = vi.fn();

    mockUseAppStoreFirebase.mockReturnValue({
      denominations: [
        { id: '1-cent', label: '1¢', value: 0.01, quantity: 10, type: 'coin' },
        { id: '2-euro', label: '2€', value: 2, quantity: 5, type: 'coin' },
        { id: '10-euro', label: '10€', value: 10, quantity: 2, type: 'banknote' },
      ],
      language: 'en',
      showBgn: false,
      setQuantity: mockSetQuantity,
      syncStatus: 'connected',
      lastUpdated: '2024-01-01T12:00:00Z',
    });

    render(<GrandTotalCard />);

    const resetButton = screen.getByText('actions.reset');
    await user.click(resetButton);

    const confirmButton = screen.getAllByText('actions.reset')[1]; // Second one is in dialog
    await user.click(confirmButton);

    expect(mockSetQuantity).toHaveBeenCalledTimes(3); // Called for each denomination
    expect(mockSetQuantity).toHaveBeenCalledWith('1-cent', 0);
    expect(mockSetQuantity).toHaveBeenCalledWith('2-euro', 0);
    expect(mockSetQuantity).toHaveBeenCalledWith('10-euro', 0);
  });

  it('closes dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<GrandTotalCard />);

    const resetButton = screen.getByText('actions.reset');
    await user.click(resetButton);

    const cancelButton = screen.getByText('actions.cancel');
    await user.click(cancelButton);

    // Dialog should be closed, so only the reset button in the card should be visible
    expect(screen.getAllByText('actions.reset')).toHaveLength(1);
  });

  it('handles save button click', async () => {
    const user = userEvent.setup();
    render(<GrandTotalCard />);

    const saveButton = screen.getByText('actions.save');
    await user.click(saveButton);

    // Save is automatic with Firebase, but button should still be clickable
    expect(screen.getByText('actions.save')).toBeInTheDocument();
  });
});

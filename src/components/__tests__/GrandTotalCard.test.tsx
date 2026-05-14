/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import { GrandTotalCard } from '../GrandTotalCard';
import { vi } from 'vitest';
import type { EuroDenomination } from '@/store/types';
import { useAppStoreFirebase } from '@/store/useAppStoreFirebase';

// Mock the store
vi.mock('@/store/useAppStoreFirebase');

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
    return {
      coinCount,
      banknoteCount,
      mostSaved: null,
      top3: [],
    };
  },
}));

const defaultStore = {
  denominations: [
    { id: '1-cent', label: '1¢', value: 0.01, quantity: 10, type: 'coin' },
    { id: '2-euro', label: '2€', value: 2, quantity: 5, type: 'coin' },
    { id: '10-euro', label: '10€', value: 10, quantity: 2, type: 'banknote' },
  ] as EuroDenomination[],
  language: 'en',
  showBgn: false,
  setQuantity: vi.fn(),
  syncStatus: 'connected',
  lastUpdated: '2024-01-01T12:00:00Z',
};


describe('GrandTotalCard', () => {
  beforeEach(() => {
    (useAppStoreFirebase as any).mockReturnValue(defaultStore);
    vi.clearAllMocks();
  });

  it('renders the totals card title', () => {
    render(<GrandTotalCard />);
    expect(screen.getByText(/totals\.title/i)).toBeInTheDocument();
  });

  it('displays the main euro total and the alternate BGN label', () => {
    render(<GrandTotalCard />);
    expect(screen.getByText('€30.10')).toBeInTheDocument();
    expect(screen.getByText(/totals\.totalBgn/i)).toBeInTheDocument();
  });

  it('shows coin and banknote counts', () => {
    render(<GrandTotalCard />);
    expect(screen.getByText(/totals\.coinsCount/i)).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText(/totals\.banknotesCount/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders composition percentages for coins and banknotes', () => {
    render(<GrandTotalCard />);

    expect(screen.getByText('34% value')).toBeInTheDocument();
    expect(screen.getByText('66% value')).toBeInTheDocument();
  });

  it('shows a balanced summary when there is data', () => {
    render(<GrandTotalCard />);
    expect(screen.getByText('Balanced')).toBeInTheDocument();
  });

  it('displays the insights panel and last updated timestamp', () => {
    render(<GrandTotalCard />);
    expect(screen.getByText(/totals\.lastUpdated/i)).toBeInTheDocument();
    expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/You have 15 coins and 2 banknotes contributing to your total\./)).toBeInTheDocument();
  });

  it('shows the primary BGN total when showBgn is enabled', () => {
    (useAppStoreFirebase as any).mockReturnValue({
      ...defaultStore,
      showBgn: true,
    });

    render(<GrandTotalCard />);
    expect(screen.getByText('BGN 58.87')).toBeInTheDocument();
    expect(screen.getByText(/totals\.totalEur/i)).toBeInTheDocument();
  });

  it('renders empty state text when no denominations are present', () => {
    (useAppStoreFirebase as any).mockReturnValue({
      ...defaultStore,
      denominations: [],
      lastUpdated: null,
    });

    render(<GrandTotalCard />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.getByText(/Start adding your denominations to see your savings come together\./)).toBeInTheDocument();
  });
});

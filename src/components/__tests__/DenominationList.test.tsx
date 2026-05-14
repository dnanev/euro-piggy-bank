/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DenominationList } from '../DenominationList';
import { vi } from 'vitest';
import { useAppStoreFirebase } from '@/store/useAppStoreFirebase';

// Mock the store
vi.mock('@/store/useAppStoreFirebase');

// Default mock implementation
(useAppStoreFirebase as any).mockReturnValue({
  denominations: [
    { id: '1-cent', label: '1¢', value: 0.01, quantity: 0, type: 'coin' },
    { id: '2-cent', label: '2¢', value: 0.02, quantity: 0, type: 'coin' },
    { id: '5-euro', label: '5€', value: 5, quantity: 0, type: 'banknote' },
  ],
  language: 'en',
  showBgn: false,
  setQuantity: vi.fn(),
});

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('DenominationList', () => {
  it('renders coins tab with correct heading', () => {
    render(<DenominationList />);

    expect(screen.getByRole('tab', { name: 'denominations.coin' })).toBeInTheDocument();
  });

  it('renders banknotes tab with correct heading', () => {
    render(<DenominationList />);

    expect(screen.getByRole('tab', { name: 'denominations.banknote' })).toBeInTheDocument();
  });

  it('renders correct number of coin cards', () => {
    render(<DenominationList />);

    // Should render 2 coin cards (1¢ and 2¢)
    expect(screen.getByText('1¢')).toBeInTheDocument();
    expect(screen.getByText('2¢')).toBeInTheDocument();
  });

  it('renders correct number of banknote cards after switching tabs', async () => {
    const user = userEvent.setup();
    render(<DenominationList />);

    const banknotesTab = screen.getByRole('tab', { name: 'denominations.banknote' });
    await user.click(banknotesTab);

    expect(screen.getByText('5€')).toBeInTheDocument();
  });

  it('renders denomination labels correctly', async () => {
    const user = userEvent.setup();
    render(<DenominationList />);

    expect(screen.getByText('1¢')).toBeInTheDocument();
    expect(screen.getByText('2¢')).toBeInTheDocument();

    const banknotesTab = screen.getByRole('tab', { name: 'denominations.banknote' });
    await user.click(banknotesTab);

    expect(screen.getByText('5€')).toBeInTheDocument();
  });

  it('uses grid layout for cards', () => {
    const { container } = render(<DenominationList />);

    // Check that the card grid structure is present
    const gridContainers = container.querySelectorAll('.grid');
    expect(gridContainers.length).toBeGreaterThan(0);
  });
});

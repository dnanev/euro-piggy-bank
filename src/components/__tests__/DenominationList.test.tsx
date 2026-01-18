import { render, screen } from '@testing-library/react';
import { DenominationList } from '../DenominationList';
import { vi } from 'vitest';

// Mock the store
vi.mock('@/store/useAppStore', () => ({
  useAppStore: () => ({
    denominations: [
      { id: '1-cent', label: '1¢', value: 0.01, quantity: 0, type: 'coin' },
      { id: '2-cent', label: '2¢', value: 0.02, quantity: 0, type: 'coin' },
      { id: '5-euro', label: '5€', value: 5, quantity: 0, type: 'banknote' },
    ],
    language: 'en',
    setQuantity: vi.fn(),
  }),
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('DenominationList', () => {
  it('renders coins section with correct heading', () => {
    render(<DenominationList />);

    expect(screen.getByText('denominations.title - denominations.coin')).toBeInTheDocument();
  });

  it('renders banknotes section with correct heading', () => {
    render(<DenominationList />);

    expect(screen.getByText('denominations.title - denominations.banknote')).toBeInTheDocument();
  });

  it('renders correct number of coin cards', () => {
    render(<DenominationList />);

    // Should render 2 coin cards (1¢ and 2¢)
    expect(screen.getByText('1¢')).toBeInTheDocument();
    expect(screen.getByText('2¢')).toBeInTheDocument();
  });

  it('renders correct number of banknote cards', () => {
    render(<DenominationList />);

    // Should render 1 banknote card (5€)
    expect(screen.getByText('5€')).toBeInTheDocument();
  });

  it('renders denomination labels correctly', () => {
    render(<DenominationList />);

    expect(screen.getByText('1¢')).toBeInTheDocument();
    expect(screen.getByText('2¢')).toBeInTheDocument();
    expect(screen.getByText('5€')).toBeInTheDocument();
  });

  it('uses flex layout for cards', () => {
    const { container } = render(<DenominationList />);

    // Check that the flex containers are used
    const flexContainers = container.querySelectorAll('.flex.flex-wrap');
    expect(flexContainers.length).toBeGreaterThan(0);
  });
});

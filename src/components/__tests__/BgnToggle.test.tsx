/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BgnToggle } from '../BgnToggle';
import { vi } from 'vitest';
import { useAppStoreFirebase } from '@/store/useAppStoreFirebase';

// Mock the store
vi.mock('@/store/useAppStoreFirebase');

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('BgnToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders BGN toggle switch', () => {
    (useAppStoreFirebase as any).mockReturnValue({
      showBgn: false,
      setShowBgn: vi.fn(),
    });

    render(<BgnToggle />);

    const toggle = screen.getByRole('switch', { name: /totals\.showBgn/i });
    expect(toggle).toBeInTheDocument();
  });

  it('shows hideBgn label when showBgn is true', () => {
    (useAppStoreFirebase as any).mockReturnValue({
      showBgn: true,
      setShowBgn: vi.fn(),
    });

    render(<BgnToggle />);

    expect(screen.getByText(/totals\.hideBgn/i)).toBeInTheDocument();
  });

  it('shows showBgn label when showBgn is false', () => {
    (useAppStoreFirebase as any).mockReturnValue({
      showBgn: false,
      setShowBgn: vi.fn(),
    });

    render(<BgnToggle />);

    expect(screen.getByText(/totals\.showBgn/i)).toBeInTheDocument();
  });

  it('calls setShowBgn with true when clicked in EUR mode', async () => {
    const user = userEvent.setup();
    const mockSetShowBgn = vi.fn();

    (useAppStoreFirebase as any).mockReturnValue({
      showBgn: false,
      setShowBgn: mockSetShowBgn,
    });

    render(<BgnToggle />);

    const toggle = screen.getByRole('switch', { name: /totals\.showBgn/i });
    await user.click(toggle);

    expect(mockSetShowBgn).toHaveBeenCalledWith(true);
  });

  it('calls setShowBgn with false when clicked in BGN mode', async () => {
    const user = userEvent.setup();
    const mockSetShowBgn = vi.fn();

    (useAppStoreFirebase as any).mockReturnValue({
      showBgn: true,
      setShowBgn: mockSetShowBgn,
    });

    render(<BgnToggle />);

    const toggle = screen.getByRole('switch', { name: /totals\.hideBgn/i });
    await user.click(toggle);

    expect(mockSetShowBgn).toHaveBeenCalledWith(false);
  });

  it('has proper accessibility attributes', () => {
    (useAppStoreFirebase as any).mockReturnValue({
      showBgn: false,
      setShowBgn: vi.fn(),
    });

    render(<BgnToggle />);

    const toggle = screen.getByRole('switch', { name: /totals\.showBgn/i });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });
});

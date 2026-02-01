import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BgnToggle } from '../BgnToggle';
import { vi } from 'vitest';

// Mock the store
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

describe('BgnToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders BGN toggle button', () => {
    mockUseAppStoreFirebase.mockReturnValue({
      showBgn: false,
      setShowBgn: vi.fn(),
    });

    render(<BgnToggle />);
    
    const button = screen.getByRole('button', { name: /bgn/i });
    expect(button).toBeInTheDocument();
  });

  it('shows BGN when showBgn is true', () => {
    mockUseAppStoreFirebase.mockReturnValue({
      showBgn: true,
      setShowBgn: vi.fn(),
    });

    render(<BgnToggle />);
    
    expect(screen.getByText('BGN')).toBeInTheDocument();
  });

  it('shows EUR when showBgn is false', () => {
    mockUseAppStoreFirebase.mockReturnValue({
      showBgn: false,
      setShowBgn: vi.fn(),
    });

    render(<BgnToggle />);
    
    expect(screen.getByText('EUR')).toBeInTheDocument();
  });

  it('calls setShowBgn with true when clicked in EUR mode', async () => {
    const user = userEvent.setup();
    const mockSetShowBgn = vi.fn();
    
    mockUseAppStoreFirebase.mockReturnValue({
      showBgn: false,
      setShowBgn: mockSetShowBgn,
    });

    render(<BgnToggle />);
    
    const button = screen.getByRole('button', { name: /bgn/i });
    await user.click(button);
    
    expect(mockSetShowBgn).toHaveBeenCalledWith(true);
  });

  it('calls setShowBgn with false when clicked in BGN mode', async () => {
    const user = userEvent.setup();
    const mockSetShowBgn = vi.fn();
    
    mockUseAppStoreFirebase.mockReturnValue({
      showBgn: true,
      setShowBgn: mockSetShowBgn,
    });

    render(<BgnToggle />);
    
    const button = screen.getByRole('button', { name: /bgn/i });
    await user.click(button);
    
    expect(mockSetShowBgn).toHaveBeenCalledWith(false);
  });

  it('has proper accessibility attributes', () => {
    mockUseAppStoreFirebase.mockReturnValue({
      showBgn: false,
      setShowBgn: vi.fn(),
    });

    render(<BgnToggle />);
    
    const button = screen.getByRole('button', { name: /bgn/i });
    expect(button).toHaveAttribute('aria-label');
  });
});

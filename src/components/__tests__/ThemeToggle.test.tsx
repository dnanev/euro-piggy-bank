import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../ThemeToggle';
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

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders theme toggle button', () => {
    mockUseAppStoreFirebase.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
    });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: /theme/i });
    expect(button).toBeInTheDocument();
  });

  it('shows sun icon when theme is light', () => {
    mockUseAppStoreFirebase.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
    });

    render(<ThemeToggle />);
    
    // Should show sun icon for light theme
    const button = screen.getByRole('button', { name: /theme/i });
    expect(button).toBeInTheDocument();
  });

  it('shows moon icon when theme is dark', () => {
    mockUseAppStoreFirebase.mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
    });

    render(<ThemeToggle />);
    
    // Should show moon icon for dark theme
    const button = screen.getByRole('button', { name: /theme/i });
    expect(button).toBeInTheDocument();
  });

  it('calls setTheme with "dark" when clicked in light mode', async () => {
    const user = userEvent.setup();
    const mockSetTheme = vi.fn();
    
    mockUseAppStoreFirebase.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: /theme/i });
    await user.click(button);
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with "light" when clicked in dark mode', async () => {
    const user = userEvent.setup();
    const mockSetTheme = vi.fn();
    
    mockUseAppStoreFirebase.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: /theme/i });
    await user.click(button);
    
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('has proper accessibility attributes', () => {
    mockUseAppStoreFirebase.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
    });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: /theme/i });
    expect(button).toHaveAttribute('aria-label');
  });
});

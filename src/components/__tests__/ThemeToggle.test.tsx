/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../ThemeToggle';
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

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getThemeSwitch = () =>
    screen.getByRole('switch', { name: /settings\.(light|dark)/i });

  it('renders theme toggle switch', () => {
    (useAppStoreFirebase as any).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
    });

    render(<ThemeToggle />);

    const toggle = getThemeSwitch();
    expect(toggle).toBeInTheDocument();
  });

  it('shows sun icon when theme is light', () => {
    (useAppStoreFirebase as any).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
    });

    render(<ThemeToggle />);

    const toggle = getThemeSwitch();
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('shows moon icon when theme is dark', () => {
    (useAppStoreFirebase as any).mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
    });

    render(<ThemeToggle />);

    const toggle = getThemeSwitch();
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('calls setTheme with "dark" when clicked in light mode', async () => {
    const user = userEvent.setup();
    const mockSetTheme = vi.fn();

    (useAppStoreFirebase as any).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    const toggle = getThemeSwitch();
    await user.click(toggle);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with "light" when clicked in dark mode', async () => {
    const user = userEvent.setup();
    const mockSetTheme = vi.fn();

    (useAppStoreFirebase as any).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    const toggle = getThemeSwitch();
    await user.click(toggle);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('has proper accessibility attributes', () => {
    (useAppStoreFirebase as any).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
    });

    render(<ThemeToggle />);

    const toggle = getThemeSwitch();
    expect(toggle).toHaveAttribute('role', 'switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });
});

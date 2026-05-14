/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageToggle } from '../LanguageToggle';
import { vi } from 'vitest';
import { useAppStoreFirebase } from '@/store/useAppStoreFirebase';

// Mock the store
vi.mock('@/store/useAppStoreFirebase');

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

describe('LanguageToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders language toggle buttons', () => {
    (useAppStoreFirebase as any).mockReturnValue({
      language: 'en',
      setLanguage: vi.fn(),
    });

    render(<LanguageToggle />);

    expect(screen.getByRole('button', { name: 'BG' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
  });

  it('shows EN when language is English', () => {
    (useAppStoreFirebase as any).mockReturnValue({
      language: 'en',
      setLanguage: vi.fn(),
    });

    render(<LanguageToggle />);

    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
  });

  it('shows БГ when language is Bulgarian', () => {
    (useAppStoreFirebase as any).mockReturnValue({
      language: 'bg',
      setLanguage: vi.fn(),
    });

    render(<LanguageToggle />);

    expect(screen.getByRole('button', { name: 'BG' })).toBeInTheDocument();
  });

  it('calls setLanguage with "bg" when clicked in English mode', async () => {
    const user = userEvent.setup();
    const mockSetLanguage = vi.fn();

    (useAppStoreFirebase as any).mockReturnValue({
      language: 'en',
      setLanguage: mockSetLanguage,
    });

    render(<LanguageToggle />);

    const bgButton = screen.getByRole('button', { name: 'BG' });
    await user.click(bgButton);

    expect(mockSetLanguage).toHaveBeenCalledWith('bg');
  });

  it('calls setLanguage with "en" when clicked in Bulgarian mode', async () => {
    const user = userEvent.setup();
    const mockSetLanguage = vi.fn();

    (useAppStoreFirebase as any).mockReturnValue({
      language: 'bg',
      setLanguage: mockSetLanguage,
    });

    render(<LanguageToggle />);

    const enButton = screen.getByRole('button', { name: 'EN' });
    await user.click(enButton);

    expect(mockSetLanguage).toHaveBeenCalledWith('en');
  });

  it('has proper accessibility attributes', () => {
    (useAppStoreFirebase as any).mockReturnValue({
      language: 'en',
      setLanguage: vi.fn(),
    });

    render(<LanguageToggle />);

    expect(screen.getByRole('button', { name: 'BG' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
  });
});

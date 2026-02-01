import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageToggle } from '../LanguageToggle';
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

describe('LanguageToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders language toggle button', () => {
    mockUseAppStoreFirebase.mockReturnValue({
      language: 'en',
      setLanguage: vi.fn(),
    });

    render(<LanguageToggle />);
    
    const button = screen.getByRole('button', { name: /language/i });
    expect(button).toBeInTheDocument();
  });

  it('shows EN when language is English', () => {
    mockUseAppStoreFirebase.mockReturnValue({
      language: 'en',
      setLanguage: vi.fn(),
    });

    render(<LanguageToggle />);
    
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('shows БГ when language is Bulgarian', () => {
    mockUseAppStoreFirebase.mockReturnValue({
      language: 'bg',
      setLanguage: vi.fn(),
    });

    render(<LanguageToggle />);
    
    expect(screen.getByText('БГ')).toBeInTheDocument();
  });

  it('calls setLanguage with "bg" when clicked in English mode', async () => {
    const user = userEvent.setup();
    const mockSetLanguage = vi.fn();
    
    mockUseAppStoreFirebase.mockReturnValue({
      language: 'en',
      setLanguage: mockSetLanguage,
    });

    render(<LanguageToggle />);
    
    const button = screen.getByRole('button', { name: /language/i });
    await user.click(button);
    
    expect(mockSetLanguage).toHaveBeenCalledWith('bg');
  });

  it('calls setLanguage with "en" when clicked in Bulgarian mode', async () => {
    const user = userEvent.setup();
    const mockSetLanguage = vi.fn();
    
    mockUseAppStoreFirebase.mockReturnValue({
      language: 'bg',
      setLanguage: mockSetLanguage,
    });

    render(<LanguageToggle />);
    
    const button = screen.getByRole('button', { name: /language/i });
    await user.click(button);
    
    expect(mockSetLanguage).toHaveBeenCalledWith('en');
  });

  it('has proper accessibility attributes', () => {
    mockUseAppStoreFirebase.mockReturnValue({
      language: 'en',
      setLanguage: vi.fn(),
    });

    render(<LanguageToggle />);
    
    const button = screen.getByRole('button', { name: /language/i });
    expect(button).toHaveAttribute('aria-label');
  });
});

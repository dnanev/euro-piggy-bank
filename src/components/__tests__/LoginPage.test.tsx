/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../Auth/LoginPage';
import { vi } from 'vitest';
import { useAuth } from '@/contexts/AuthContext';
import { signInWithGoogle } from '@/firebase/auth';

// Mock the auth context
vi.mock('@/contexts/AuthContext');

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Firebase auth
vi.mock('@/firebase/auth', () => ({
  signInWithGoogle: vi.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login page correctly', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(<LoginPage />);

    expect(screen.getByText('Euro Piggy Bank')).toBeInTheDocument();
    expect(screen.getByText('Track your savings across all your devices')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  it('renders login page when auth context is loading', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(<LoginPage />);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('calls signInWithGoogle when the Google button is clicked', async () => {
    const user = userEvent.setup();
    const mockSignInWithGoogle = vi.mocked(signInWithGoogle);

    (useAuth as any).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(<LoginPage />);

    const signInButton = screen.getByText('Continue with Google');
    await user.click(signInButton);

    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });

  it('displays error message when Google authentication fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Authentication failed';

    (useAuth as any).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    vi.mocked(signInWithGoogle).mockRejectedValueOnce(new Error(errorMessage));

    render(<LoginPage />);

    const signInButton = screen.getByText('Continue with Google');
    await user.click(signInButton);

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('redirects when user is authenticated', () => {
    const originalLocation = window.location;
    delete (window as any).location;
    ;(window as any).location = { href: '' };

    (useAuth as any).mockReturnValue({
      user: {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
      },
      isAuthenticated: true,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(<LoginPage />);

    expect(window.location.href).toBe('/');

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });
});

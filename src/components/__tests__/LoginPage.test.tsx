import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../Auth/LoginPage';
import { vi } from 'vitest';

// Mock the auth context
const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

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
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(<LoginPage />);
    
    expect(screen.getByText('auth.signIn.title')).toBeInTheDocument();
    expect(screen.getByText('auth.signIn.description')).toBeInTheDocument();
    expect(screen.getByText('auth.signIn.googleButton')).toBeInTheDocument();
  });

  it('shows loading state when authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(<LoginPage />);
    
    expect(screen.getByText('auth.loading')).toBeInTheDocument();
  });

  it('calls signIn when Google sign-in button is clicked', async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.fn();
    
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      signIn: mockSignIn,
      signOut: vi.fn(),
    });

    render(<LoginPage />);
    
    const signInButton = screen.getByText('auth.signIn.googleButton');
    await user.click(signInButton);
    
    expect(mockSignIn).toHaveBeenCalled();
  });

  it('displays error message when authentication fails', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      error: 'Authentication failed',
    });

    render(<LoginPage />);
    
    expect(screen.getByText('Authentication failed')).toBeInTheDocument();
  });

  it('shows app content when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
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
    
    // Should redirect to main app content, not show login form
    expect(screen.queryByText('auth.signIn.title')).not.toBeInTheDocument();
  });
});

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthProvider, AuthContext } from '../AuthContext'

// Create a custom hook for testing
const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
import { getUserProfile } from '../../firebase/auth'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'

// Mock Firebase modules
vi.mock('../../firebase/auth')
vi.mock('firebase/auth', async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {
    ...actual,
    onAuthStateChanged: vi.fn(),
    signOut: vi.fn(),
  }
})

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {
    ...actual,
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    collection: vi.fn(),
    addDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn(),
  }
})

describe('AuthContext', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true
  }

  const mockUserProfile = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    preferences: {
      theme: 'light' as const,
      currency: 'EUR' as const,
      updatedAt: new Date().toISOString()
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(onAuthStateChanged as any).mockImplementation(() => {
      return () => {}
    })
  })

  const TestComponent: React.FC = () => {
    const auth = useAuth()
    return (
      <div data-testid="auth-state">
        <div data-testid="user">{auth.user ? auth.user.email : 'No user'}</div>
        <div data-testid="loading">{auth.loading ? 'Loading' : 'Not loading'}</div>
        <div data-testid="user-profile">{auth.userProfile ? auth.userProfile.displayName : 'No profile'}</div>
      </div>
    )
  }

  it('should render initial state correctly', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent('No user')
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
    expect(screen.getByTestId('user-profile')).toHaveTextContent('No profile')
  })

  it('should update state when user logs in', async () => {
    ;(onAuthStateChanged as any).mockImplementation((_: any, callback: any) => {
      setTimeout(() => callback(mockUser), 0)
      return () => {}
    })

    ;(getUserProfile as any).mockResolvedValue(mockUserProfile)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      expect(screen.getByTestId('user-profile')).toHaveTextContent('Test User')
    })
  })

  it('should update state when user logs out', async () => {
    // Simulate user logged in first
    ;(onAuthStateChanged as any).mockImplementation((_: any, callback: any) => {
      setTimeout(() => callback(mockUser), 0)
      setTimeout(() => callback(null), 100)
      return () => {}
    })

    ;(getUserProfile as any).mockResolvedValue(mockUserProfile)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for login
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })

    // Wait for logout
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user')
    })
  })


  it('should update state when a Google user signs in', async () => {
    const mockGoogleUser = {
      uid: 'google-uid',
      email: 'google@example.com',
      displayName: 'Google User'
    }

    ;(getUserProfile as any).mockResolvedValue(mockUserProfile)

    ;(onAuthStateChanged as any).mockImplementation((_: any, callback: any) => {
      setTimeout(() => callback(mockGoogleUser), 0)
      return () => {}
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('google@example.com')
    })
  })

  it('should handle sign out', async () => {
    const mockSignOut = vi.fn().mockResolvedValue(undefined)
    ;(firebaseSignOut as any).mockImplementation(mockSignOut)

    const SignOutButton: React.FC = () => {
      const { signOut } = useAuth()
      return <button data-testid="sign-out" onClick={signOut}>Sign Out</button>
    }

    ;(onAuthStateChanged as any).mockImplementation((_: any, callback: any) => {
      setTimeout(() => callback(mockUser), 0)
      return () => {}
    })

    ;(getUserProfile as any).mockResolvedValue(mockUserProfile)

    render(
      <AuthProvider>
        <TestComponent />
        <SignOutButton />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })

    await userEvent.click(screen.getByTestId('sign-out'))

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user')
    })

    expect(mockSignOut).toHaveBeenCalled()
  })

  it('should handle loading state correctly', () => {
    ;(onAuthStateChanged as any).mockImplementation(() => {
      // Don't call callback immediately to simulate loading
      return () => {}
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
  })
})

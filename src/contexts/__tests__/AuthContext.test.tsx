/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
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
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../../firebase/auth'
import { getDoc } from 'firebase/firestore'
import { auth } from '../../firebase/config'

// Mock Firebase modules
vi.mock('../../firebase/auth')
vi.mock('../../firebase/config', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn()
  }
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn()
}))

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
    ;(auth.onAuthStateChanged as any).mockImplementation((callback: any) => {
      callback(null)
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
    ;(auth.onAuthStateChanged as any).mockImplementation((callback: any) => {
      setTimeout(() => callback(mockUser), 0)
      return () => {}
    })

    ;(getDoc as any).mockResolvedValue({
      exists: () => true,
      data: () => mockUserProfile
    })

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
    ;(auth.onAuthStateChanged as any).mockImplementation((callback: any) => {
      setTimeout(() => callback(mockUser), 0)
      setTimeout(() => callback(null), 100)
      return () => {}
    })

    ;(getDoc as any).mockResolvedValue({
      exists: () => true,
      data: () => mockUserProfile
    })

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

  it('should handle sign in with email and password', async () => {
    const mockSignInResult = {
      user: mockUser
    }
    ;(signInWithEmail as any).mockResolvedValue(mockSignInResult)

    ;(getDoc as any).mockResolvedValue({
      exists: () => true,
      data: () => mockUserProfile
    })

    ;(auth.onAuthStateChanged as any).mockImplementation((callback: any) => {
      setTimeout(() => callback(mockUser), 0)
      return () => {}
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })

    expect(signInWithEmail).toHaveBeenCalledWith('test@example.com', 'password')
  })

  it('should handle sign up with email and password', async () => {
    const mockSignUpResult = {
      user: mockUser
    }
    ;(signUpWithEmail as any).mockResolvedValue(mockSignUpResult)

    ;(getDoc as any).mockResolvedValue({
      exists: () => false,
      data: () => mockUserProfile
    })

    ;(auth.onAuthStateChanged as any).mockImplementation((callback: any) => {
      setTimeout(() => callback(mockUser), 0)
      return () => {}
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })

    expect(signUpWithEmail).toHaveBeenCalledWith('test@example.com', 'password')
  })

  it('should handle sign in with Google', async () => {
    const mockGoogleUser = {
      uid: 'google-uid',
      email: 'google@example.com',
      displayName: 'Google User'
    }
    const mockSignInResult = {
      user: mockGoogleUser
    }
    ;(signInWithGoogle as any).mockResolvedValue(mockSignInResult)

    ;(getDoc as any).mockResolvedValue({
      exists: () => false,
      data: () => ({
        ...mockUserProfile,
        uid: 'google-uid',
        email: 'google@example.com',
        displayName: 'Google User'
      })
    })

    ;(auth.onAuthStateChanged as any).mockImplementation((callback: any) => {
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

    expect(signInWithGoogle).toHaveBeenCalled()
  })

  it('should handle sign out', async () => {
    const mockSignOut = vi.fn().mockResolvedValue(undefined)

    // Mock the signOut function from auth
    vi.doMock('../../firebase/auth', () => ({
      signInWithEmailAndPassword: vi.fn(),
      createUserWithEmailAndPassword: vi.fn(),
      signInWithPopup: vi.fn(),
      GoogleAuthProvider: vi.fn(),
      sendPasswordResetEmail: vi.fn(),
      signOut: mockSignOut,
      deleteUser: vi.fn(),
      reauthenticateWithCredential: vi.fn(),
      EmailAuthProvider: vi.fn(),
      User: vi.fn(),
      UserCredential: vi.fn(),
      doc: vi.fn(),
      getDoc: vi.fn(),
      setDoc: vi.fn(),
      deleteDoc: vi.fn(),
      collection: vi.fn(),
      query: vi.fn(),
      where: vi.fn(),
      orderBy: vi.fn(),
      limit: vi.fn(),
      getDocs: vi.fn()
    }))

    // Import is used in the test
    const { signOut } = await import('../../firebase/auth')
    void signOut

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Simulate user logged in
    ;(auth.onAuthStateChanged as any).mockImplementation((callback: any) => {
      setTimeout(() => callback(mockUser), 0)
      return () => {}
    })

    ;(getDoc as any).mockResolvedValue({
      exists: () => true,
      data: () => mockUserProfile
    })

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })

    // Call signOut through the context
    const { result } = renderHook(() => useAuth())
    if (result && 'signOut' in result) {
      await result.signOut()
    }

    expect(mockSignOut).toHaveBeenCalled()
  })

  it('should handle loading state correctly', () => {
    ;(auth.onAuthStateChanged as any).mockImplementation(() => {
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

// Helper function to test hooks
function renderHook<T>(hook: () => T): { result: T } {
  return { result: hook() }
}

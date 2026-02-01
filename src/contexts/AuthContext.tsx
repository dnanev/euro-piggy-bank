import React, { createContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import { auth } from '../firebase/config'
import { getUserProfile, createUserProfile } from '../firebase/auth'
import type { UserProfile } from '../firebase/auth'

interface AuthContextType {
  user: FirebaseUser | null
  userProfile: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export { AuthContext }

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false) // Set loading false immediately

      if (firebaseUser) {
        // Fetch or create user profile from Firestore
        try {
          let profile = await getUserProfile(firebaseUser.uid)

          // If profile doesn't exist, create it
          if (!profile) {
            await createUserProfile(firebaseUser)
            profile = await getUserProfile(firebaseUser.uid)
          }

          setUserProfile(profile)
        } catch (error) {
          console.error('Failed to fetch/create user profile, continuing without profile:', error)
          setUserProfile(null) // Continue without profile if Firebase is blocked
        }
      } else {
        setUserProfile(null)
      }
    })

    return unsubscribe
  }, [])

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

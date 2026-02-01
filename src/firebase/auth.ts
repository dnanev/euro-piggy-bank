import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  deleteUser as firebaseDeleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth'
import type { User as FirebaseUser, UserCredential } from 'firebase/auth'
import { doc, setDoc, getDoc, deleteDoc, collection, query, getDocs } from 'firebase/firestore'
import { auth, db } from './config'

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  createdAt: string
  lastLoginAt: string
  preferences: {
    theme: 'light' | 'dark'
    language: 'bg' | 'en'
    currency: 'EUR' | 'BGN'
  }
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    await updateUserLastLogin(result.user.uid)
    return result
  } catch {
    throw new Error('Invalid email or password')
  }
}

// Create new user with email and password
export const signUpWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await createUserProfile(result.user)
    return result
  } catch {
    throw new Error('Failed to create account')
  }
}

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const provider = new GoogleAuthProvider()
    // Add scopes if needed
    provider.addScope('email')
    provider.addScope('profile')

    const result = await signInWithPopup(auth, provider)

    // Check if user exists, create profile if not
    const userDoc = await getDoc(doc(db, 'users', result.user.uid))
    if (!userDoc.exists()) {
      await createUserProfile(result.user)
    } else {
      await updateUserLastLogin(result.user.uid)
    }

    return result
  } catch (error) {
    console.error('Google sign-in error:', error)

    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('auth/configuration-not-found')) {
        throw new Error('Firebase Authentication is not configured. Please enable Authentication in Firebase Console and set up Google Sign-In.')
      } else if (error.message.includes('auth/popup-closed-by-user')) {
        throw new Error('Sign-in popup was closed before completion')
      } else if (error.message.includes('auth/popup-blocked')) {
        throw new Error('Sign-in popup was blocked by the browser. Please allow popups for this site.')
      } else if (error.message.includes('auth/cancelled-popup-request')) {
        throw new Error('Sign-in was cancelled')
      } else if (error.message.includes('auth/unauthorized-domain')) {
        throw new Error('This domain is not authorized for Google sign-in. Please check your Firebase configuration.')
      } else if (error.message.includes('auth/api-key-not-allowed')) {
        throw new Error('API key is not allowed. Please check your Firebase API key configuration.')
      } else {
        throw new Error(`Google sign-in failed: ${error.message}`)
      }
    }
    throw new Error('Failed to sign in with Google')
  }
}

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch {
    throw new Error('Failed to send password reset email')
  }
}

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth)
  } catch {
    throw new Error('Failed to sign out')
  }
}

// Create user profile in Firestore
export const createUserProfile = async (user: FirebaseUser): Promise<void> => {
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email!,
    displayName: user.displayName || undefined,
    photoURL: user.photoURL || undefined,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    preferences: {
      theme: 'light',
      language: 'en',
      currency: 'EUR'
    }
  }

  await setDoc(doc(db, 'users', user.uid), userProfile)
}

// Update user last login
const updateUserLastLogin = async (uid: string): Promise<void> => {
  const userRef = doc(db, 'users', uid)
  await setDoc(userRef, {
    lastLoginAt: new Date().toISOString()
  }, { merge: true })
}

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

// Delete user account and all associated data
export const deleteAccount = async (password?: string): Promise<void> => {
  const user = auth.currentUser
  if (!user) {
    throw new Error('No user is currently signed in')
  }

  try {
    // Reauthenticate if password provided (required for sensitive operations)
    if (password && user.email) {
      const credential = EmailAuthProvider.credential(user.email, password)
      await reauthenticateWithCredential(user, credential)
    }

    // Delete all user data from Firestore
    const uid = user.uid

    // Delete user profile
    await deleteDoc(doc(db, 'users', uid))

    // Delete all savings data
    const savingsQuery = query(collection(db, 'users', uid, 'savings'))
    const savingsSnapshot = await getDocs(savingsQuery)
    savingsSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref)
    })

    // Delete all history data
    const historyQuery = query(collection(db, 'users', uid, 'history'))
    const historySnapshot = await getDocs(historyQuery)
    historySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref)
    })

    // Delete the Firebase Authentication account
    await firebaseDeleteUser(user)

  } catch (error) {
    console.error('Error deleting account:', error)
    if (error instanceof Error && error.message.includes('requires recent authentication')) {
      throw new Error('Please re-enter your password to delete your account')
    }
    throw new Error('Failed to delete account')
  }
}

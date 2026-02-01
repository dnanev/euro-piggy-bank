import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, enableNetwork, disableNetwork, enableIndexedDbPersistence } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Enable offline persistence
export const enableOfflineMode = async (): Promise<void> => {
  try {
    await enableIndexedDbPersistence(db)
    console.log('Offline persistence enabled')
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('already been initialized')) {
        console.log('Offline persistence already enabled')
      } else {
        console.error('Failed to enable offline persistence:', error)
        throw error
      }
    }
  }
}

// Network management
export const goOnline = (): Promise<void> => enableNetwork(db)
export const goOffline = (): Promise<void> => disableNetwork(db)

// Initialize offline mode
enableOfflineMode().catch(console.error)

export default app

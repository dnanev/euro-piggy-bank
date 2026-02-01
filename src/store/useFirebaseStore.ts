import { create } from 'zustand'
import { doc, getDoc, setDoc, updateDoc, collection, query, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { EuroDenomination } from './types'
import { EURO_DENOMINATIONS } from './constants'
import type { HistoryEntry, SavingsGoal, HistoryStatistics } from './types'
import type { UserProfile } from '../firebase/auth'

interface FirebaseStoreState {
  // User state
  user: UserProfile | null
  userProfile: UserProfile | null
  isAuthenticated: boolean
  loading: boolean

  // App state (same as before but from Firebase)
  denominations: EuroDenomination[]
  theme: 'light' | 'dark'
  language: 'bg' | 'en'
  showBgn: boolean
  lastUpdated: string | null
  history: HistoryEntry[]
  goals: SavingsGoal[]
  statistics: HistoryStatistics | null

  // Sync state
  syncStatus: 'online' | 'offline' | 'syncing'
  lastSyncTime: string | null
}

interface FirebaseStoreActions {
  // User actions
  setUser: (user: UserProfile | null) => void
  setUserProfile: (profile: UserProfile | null) => void

  // Data loading actions
  loadUserData: (userId: string) => Promise<void>

  // Denomination actions
  setQuantity: (id: string, quantity: number) => Promise<void>

  // Theme actions
  setTheme: (theme: 'light' | 'dark') => Promise<void>

  // Language actions
  setLanguage: (language: 'bg' | 'en') => Promise<void>

  // Currency display
  setShowBgn: (showBgn: boolean) => Promise<void>

  // History actions
  addHistoryEntry: (entry: HistoryEntry) => Promise<void>
  updateHistoryEntry: (id: string, entry: HistoryEntry) => Promise<void>
  deleteHistoryEntry: (id: string) => Promise<void>
  clearHistory: () => Promise<void>

  // Goal actions
  addGoal: (goal: SavingsGoal) => Promise<void>
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  clearGoals: () => Promise<void>

  // Statistics actions
  updateStatistics: (stats: HistoryStatistics) => Promise<void>

  // Sync actions
  setSyncStatus: (status: 'online' | 'offline' | 'syncing') => void
  syncNow: () => Promise<void>

  // Reset
  resetAll: () => Promise<void>
}

type FirebaseStore = FirebaseStoreState & FirebaseStoreActions

export const useFirebaseStore = create<FirebaseStore>((set, get) => ({
  // Initial state
  user: null,
  userProfile: null,
  isAuthenticated: false,
  loading: true,

  denominations: EURO_DENOMINATIONS,
  theme: 'light',
  language: 'bg',
  showBgn: false,
  lastUpdated: null,
  history: [],
  goals: [],
  statistics: null,

  syncStatus: 'online',
  lastSyncTime: null,

  // User actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setUserProfile: (userProfile) => set({ userProfile }),

  // Load user data from Firebase
  loadUserData: async (userId: string) => {
    try {
      set({ loading: true })

      // Load user profile
      const profileDoc = await getDoc(doc(db, 'users', userId))
      if (profileDoc.exists()) {
        const profile = profileDoc.data() as UserProfile
        set({
          userProfile: profile,
          theme: profile.preferences.theme,
          language: profile.preferences.currency === 'BGN' ? 'bg' : 'en',
          showBgn: profile.preferences.currency === 'BGN'
        })
      }

      // Load denominations
      const denominationsQuery = query(collection(db, 'users', userId, 'savings'))
      const denominationsSnapshot = await getDocs(denominationsQuery)
      if (!denominationsSnapshot.empty) {
        const savingsData = denominationsSnapshot.docs[0].data()
        set({ denominations: savingsData.denominations || EURO_DENOMINATIONS })
      }

      // Load history
      const historyQuery = query(collection(db, 'users', userId, 'history'))
      const historySnapshot = await getDocs(historyQuery)
      const historyData = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HistoryEntry[]
      set({ history: historyData })

      // Load goals
      const goalsQuery = query(collection(db, 'users', userId, 'goals'))
      const goalsSnapshot = await getDocs(goalsQuery)
      const goalsData = goalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavingsGoal[]
      set({ goals: goalsData })

      set({ loading: false, lastUpdated: new Date().toISOString() })

    } catch (error) {
      console.error('Error loading user data:', error)
      set({ loading: false })
    }
  },

  // Denomination actions
  setQuantity: async (id: string, quantity: number) => {
    const { user, denominations } = get()
    if (!user) return

    const newQuantity = Math.max(0, quantity)
    const newDenominations = denominations.map(denom =>
      denom.id === id ? { ...denom, quantity: newQuantity } : denom
    )

    set({ denominations: newDenominations, syncStatus: 'syncing' })

    try {
      // Save to Firebase
      const savingsRef = doc(db, 'users', user.uid, 'savings', 'current')
      await setDoc(savingsRef, {
        denominations: newDenominations,
        updatedAt: new Date().toISOString()
      }, { merge: true })

      // Create history entry
      const totalEurCents = newDenominations.reduce((total, denom) => total + (denom.quantity * denom.value), 0)
      const totalEur = totalEurCents / 100
      const totalBgn = totalEur * 1.95583

      const historyEntry: HistoryEntry = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        timestamp: new Date().toISOString(),
        totalEur: totalEurCents,
        totalBgn,
        denominations: newDenominations,
        type: 'snapshot'
      }

      const historyRef = doc(db, 'users', user.uid, 'history', historyEntry.id)
      await setDoc(historyRef, historyEntry)

      set({
        lastUpdated: new Date().toISOString(),
        syncStatus: 'online',
        lastSyncTime: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error saving denominations:', error)
      set({ syncStatus: 'offline' })
    }
  },

  // Theme actions
  setTheme: async (theme: 'light' | 'dark') => {
    const { user } = get()
    if (!user) return

    set({ theme, syncStatus: 'syncing' })

    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        'preferences.theme': theme,
        'preferences.updatedAt': new Date().toISOString()
      })

      set({ syncStatus: 'online', lastSyncTime: new Date().toISOString() })
    } catch (error) {
      console.error('Error updating theme:', error)
      set({ syncStatus: 'offline' })
    }
  },

  // Language actions
  setLanguage: async (language: 'bg' | 'en') => {
    const { user } = get()
    if (!user) return

    set({ language, syncStatus: 'syncing' })

    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        'preferences.currency': language === 'bg' ? 'BGN' : 'EUR',
        'preferences.updatedAt': new Date().toISOString()
      })

      set({ syncStatus: 'online', lastSyncTime: new Date().toISOString() })
    } catch (error) {
      console.error('Error updating language:', error)
      set({ syncStatus: 'offline' })
    }
  },

  // Currency display
  setShowBgn: async (showBgn: boolean) => {
    const { user } = get()
    if (!user) return

    set({ showBgn, syncStatus: 'syncing' })

    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        'preferences.currency': showBgn ? 'BGN' : 'EUR',
        'preferences.updatedAt': new Date().toISOString()
      })

      set({ syncStatus: 'online', lastSyncTime: new Date().toISOString() })
    } catch (error) {
      console.error('Error updating currency display:', error)
      set({ syncStatus: 'offline' })
    }
  },

  // History actions
  addHistoryEntry: async (entry) => {
    const { user } = get()
    if (!user) return

    try {
      const historyRef = doc(db, 'users', user.uid, 'history', entry.id)
      await setDoc(historyRef, entry)

      set(state => ({
        history: [...state.history, entry],
        lastUpdated: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error adding history entry:', error)
    }
  },

  updateHistoryEntry: async (id, entry) => {
    const { user } = get()
    if (!user) return

    try {
      const historyRef = doc(db, 'users', user.uid, 'history', id)
      await updateDoc(historyRef, entry as Partial<HistoryEntry>)

      set(state => ({
        history: state.history.map(h => h.id === id ? { ...h, ...entry } : h),
        lastUpdated: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error updating history entry:', error)
    }
  },

  deleteHistoryEntry: async (id) => {
    const { user } = get()
    if (!user) return

    try {
      const historyRef = doc(db, 'users', user.uid, 'history', id)
      await deleteDoc(historyRef)

      set(state => ({
        history: state.history.filter(h => h.id !== id),
        lastUpdated: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error deleting history entry:', error)
    }
  },

  clearHistory: async () => {
    const { user } = get()
    if (!user) return

    try {
      const historyQuery = query(collection(db, 'users', user.uid, 'history'))
      const historySnapshot = await getDocs(historyQuery)

      const deletePromises = historySnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      set({ history: [], lastUpdated: new Date().toISOString() })
    } catch (error) {
      console.error('Error clearing history:', error)
    }
  },

  // Goal actions
  addGoal: async (goal) => {
    const { user } = get()
    if (!user) return

    try {
      const goalRef = doc(db, 'users', user.uid, 'goals', goal.id)
      await setDoc(goalRef, goal)

      set(state => ({
        goals: [...state.goals, goal],
        lastUpdated: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error adding goal:', error)
    }
  },

  updateGoal: async (id, goal) => {
    const { user } = get()
    if (!user) return

    try {
      const goalRef = doc(db, 'users', user.uid, 'goals', id)
      await updateDoc(goalRef, goal)

      set(state => ({
        goals: state.goals.map(g => g.id === id ? { ...g, ...goal } : g),
        lastUpdated: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  },

  deleteGoal: async (id) => {
    const { user } = get()
    if (!user) return

    try {
      const goalRef = doc(db, 'users', user.uid, 'goals', id)
      await deleteDoc(goalRef)

      set(state => ({
        goals: state.goals.filter(g => g.id !== id),
        lastUpdated: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  },

  clearGoals: async () => {
    const { user } = get()
    if (!user) return

    try {
      const goalsQuery = query(collection(db, 'users', user.uid, 'goals'))
      const goalsSnapshot = await getDocs(goalsQuery)

      const deletePromises = goalsSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      set({ goals: [], lastUpdated: new Date().toISOString() })
    } catch (error) {
      console.error('Error clearing goals:', error)
    }
  },

  // Statistics actions
  updateStatistics: async (stats) => {
    const { user } = get()
    if (!user) return

    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        statistics: stats,
        'statistics.updatedAt': new Date().toISOString()
      })

      set({ statistics: stats, lastUpdated: new Date().toISOString() })
    } catch (error) {
      console.error('Error updating statistics:', error)
    }
  },

  // Sync actions
  setSyncStatus: (status) => set({ syncStatus: status }),

  syncNow: async () => {
    const { user } = get()
    if (!user) return

    set({ syncStatus: 'syncing' })
    try {
      await get().loadUserData(user.uid)
      set({ syncStatus: 'online', lastSyncTime: new Date().toISOString() })
    } catch (error) {
      console.error('Error syncing:', error)
      set({ syncStatus: 'offline' })
    }
  },

  // Reset
  resetAll: async () => {
    const { user } = get()
    if (!user) return

    try {
      // Delete all user data
      const collections = ['savings', 'history', 'goals']
      const deletePromises = collections.map(collectionName => {
        const collectionRef = collection(db, 'users', user.uid, collectionName)
        return getDocs(collectionRef).then(snapshot => {
          return Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)))
        })
      })

      await Promise.all(deletePromises)

      set({
        denominations: EURO_DENOMINATIONS,
        theme: 'light',
        language: 'bg',
        showBgn: false,
        lastUpdated: null,
        history: [],
        goals: [],
        statistics: null
      })
    } catch (error) {
      console.error('Error resetting data:', error)
    }
  }
}))

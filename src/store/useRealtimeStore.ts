import { create } from 'zustand'
import { firestoreService } from '../firebase/firestore'
import type { EuroDenomination } from './types'
import { EURO_DENOMINATIONS } from './constants'
import type { HistoryEntry, SavingsGoal, HistoryStatistics } from './types'
import type { FirebaseUserProfile } from '../types/firebase'

interface RealtimeStoreState {
  // User state
  user: FirebaseUserProfile | null
  isAuthenticated: boolean
  loading: boolean
  dataLoaded: boolean // Add flag to track if initial data load completed

  // App state
  denominations: EuroDenomination[]
  theme: 'light' | 'dark'
  language: 'bg' | 'en'
  showBgn: boolean
  lastUpdated: string | null
  history: HistoryEntry[]
  goals: SavingsGoal[]
  statistics: HistoryStatistics | null

  // Real-time state
  isListening: boolean
  listeners: (() => void)[]
  syncStatus: 'idle' | 'syncing' | 'success' | 'error'
  lastSyncTime: string | null
  errorMessage: string | null
}

interface RealtimeStoreActions {
  // User actions
  setUser: (user: FirebaseUserProfile | null) => void
  setLoading: (loading: boolean) => void

  // Data loading actions
  loadUserData: (userId: string) => Promise<void>

  // Real-time listeners
  startListening: (userId: string) => void
  stopListening: () => void

  // Actions with optimistic updates
  setQuantity: (id: string, quantity: number, userId: string) => Promise<void>
  setTheme: (theme: 'light' | 'dark', userId: string) => Promise<void>
  setLanguage: (language: 'bg' | 'en', userId: string) => Promise<void>
  setShowBgn: (showBgn: boolean, userId: string) => Promise<void>

  // History actions
  addHistoryEntry: (entry: HistoryEntry) => Promise<void>
  updateHistoryEntry: (id: string, entry: Partial<HistoryEntry>) => Promise<void>
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
  setSyncStatus: (status: 'idle' | 'syncing' | 'success' | 'error') => void
  setError: (error: string | null) => void
  syncNow: () => Promise<void>
}

type RealtimeStore = RealtimeStoreState & RealtimeStoreActions

export const useRealtimeStore = create<RealtimeStore>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  loading: true,
  dataLoaded: false,

  denominations: EURO_DENOMINATIONS,
  theme: 'light',
  language: 'bg',
  showBgn: false,
  lastUpdated: null,
  history: [],
  goals: [],
  statistics: null,

  isListening: false,
  listeners: [],
  syncStatus: 'idle',
  lastSyncTime: null,
  errorMessage: null,

  // User actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (loading) => set({ loading }),

  // Load user data
  loadUserData: async (userId: string) => {
    try {
      set({ loading: true, errorMessage: null })

      // Load user profile
      try {
        const userProfile = await firestoreService.getUserProfile(userId)
        if (userProfile) {
          set({
            user: userProfile,
            theme: userProfile.preferences.theme,
            language: userProfile.preferences.language || 'en',
            showBgn: userProfile.preferences.currency === 'BGN'
          })
        }
      } catch (profileError) {
        console.warn('Failed to load user profile, continuing with defaults:', profileError)
        // Continue with default values if profile fetch fails
      }

      // Load denominations
      try {
        const savings = await firestoreService.getSavingsData(userId)
        if (savings) {
          set({ denominations: savings.denominations })
        }
      } catch (savingsError) {
        console.warn('Failed to load savings data, continuing with defaults:', savingsError)
        // Continue with default denominations if fetch fails
      }

      // Load history
      try {
        const history = await firestoreService.getHistoryEntries(userId)
        set({ history: history.map(h => ({
          id: h.id,
          timestamp: h.createdAt,
          totalEur: h.totalEur,
          totalBgn: h.totalBgn,
          denominations: h.denominations,
          type: h.type
        })) })
      } catch (historyError) {
        console.warn('Failed to load history, continuing with empty history:', historyError)
        // Continue with empty history if fetch fails
      }

      // Load goals
      try {
        const goals = await firestoreService.getGoals(userId)
        set({ goals: goals.map(g => ({
          id: g.id,
          title: g.title,
          targetAmount: g.targetAmount,
          targetCurrency: g.targetCurrency,
          deadline: g.deadline,
          createdAt: g.createdAt,
          achievedAt: g.achievedAt
        })) })
      } catch (goalsError) {
        console.warn('Failed to load goals, continuing with empty goals:', goalsError)
        // Continue with empty goals if fetch fails
      }

      set({
        loading: false,
        dataLoaded: true,
        lastUpdated: new Date().toISOString()
      })

    } catch (error) {
      console.error('Error loading user data:', error)
      // Don't fail completely - just mark as loaded and show error
      set({
        loading: false,
        dataLoaded: true,
        errorMessage: error instanceof Error ? error.message : 'Failed to load data'
      })
    }
  },

  // Start real-time listeners
  startListening: (userId: string) => {
    if (get().isListening) return

    const listeners: (() => void)[] = []

    // Listen to user profile changes
    const profileUnsubscribe = firestoreService.onUserProfileChange(userId, (profile) => {
      if (profile) {
        set({
          user: profile,
          theme: profile.preferences.theme,
          language: profile.preferences.language || 'en',
          showBgn: profile.preferences.currency === 'BGN'
        })
      }
    })
    listeners.push(profileUnsubscribe)

    // Listen to savings changes
    const savingsUnsubscribe = firestoreService.onSavingsChange(userId, (savings) => {
      if (savings) {
        set({ denominations: savings.denominations })
      }
    })
    listeners.push(savingsUnsubscribe)

    // Listen to history changes
    const historyUnsubscribe = firestoreService.onHistoryChange(userId, (history) => {
      set({
        history: history.map(h => ({
          id: h.id,
          timestamp: h.createdAt,
          totalEur: h.totalEur,
          totalBgn: h.totalBgn,
          denominations: h.denominations,
          type: h.type
        }))
      })
    })
    listeners.push(historyUnsubscribe)

    // Listen to goals changes
    const goalsUnsubscribe = firestoreService.onGoalsChange(userId, (goals) => {
      set({
        goals: goals.map(g => ({
          id: g.id,
          title: g.title,
          targetAmount: g.targetAmount,
          targetCurrency: g.targetCurrency,
          deadline: g.deadline,
          createdAt: g.createdAt,
          achievedAt: g.achievedAt
        }))
      })
    })
    listeners.push(goalsUnsubscribe)

    set({ isListening: true, listeners })
  },

  // Stop listening
  stopListening: () => {
    const { listeners } = get()
    listeners.forEach(unsubscribe => unsubscribe())
    set({ isListening: false, listeners: [] })
  },

  // Optimistic updates
  setQuantity: async (id: string, quantity: number, userId: string) => {
    const { denominations } = get()

    if (!userId) {
      return
    }

    const newQuantity = Math.max(0, quantity)
    const newDenominations = denominations.map(denom =>
      denom.id === id ? { ...denom, quantity: newQuantity } : denom
    )

    // Optimistic update
    set({ denominations: newDenominations, syncStatus: 'syncing' })

    try {
      // Update in background
      await firestoreService.saveSavingsData(userId, newDenominations)

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

      await firestoreService.addHistoryEntry(userId, historyEntry)

      set({
        syncStatus: 'success',
        lastSyncTime: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating denominations:', error)
      set({
        syncStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Failed to sync'
      })
    }
  },

  setTheme: async (theme: 'light' | 'dark', userId: string) => {
    if (!userId) {
      return
    }

    set({ theme, syncStatus: 'syncing' })

    try {
      const { user } = get()
      if (!user) return

      const currentProfile = await firestoreService.getUserProfile(user.uid)
      const updatedPreferences = {
        theme: theme,
        currency: (currentProfile?.preferences?.currency || 'EUR') as 'EUR' | 'BGN',
        language: currentProfile?.preferences?.language || 'en',
        updatedAt: new Date().toISOString()
      }

      await firestoreService.updateUserProfile(user.uid, {
        preferences: updatedPreferences
      })

      set({ syncStatus: 'success', lastSyncTime: new Date().toISOString() })
    } catch (error) {
      console.error('Error updating theme:', error)
      set({ syncStatus: 'error', errorMessage: error instanceof Error ? error.message : 'Failed to sync' })
    }
  },

  setLanguage: async (language: 'bg' | 'en', userId: string) => {
    if (!userId) {
      return
    }

    set({ language, syncStatus: 'syncing' })

    try {
      const { user } = get()
      if (!user) return

      const currentProfile = await firestoreService.getUserProfile(user.uid)
      const updatedPreferences = {
        theme: currentProfile?.preferences?.theme || 'light',
        currency: (currentProfile?.preferences?.currency || 'EUR') as 'EUR' | 'BGN',
        language: language,
        updatedAt: new Date().toISOString()
      }

      await firestoreService.updateUserProfile(user.uid, {
        preferences: updatedPreferences
      })

      set({ syncStatus: 'success', lastSyncTime: new Date().toISOString() })
    } catch (error) {
      console.error('Error updating language:', error)
      set({ syncStatus: 'error', errorMessage: error instanceof Error ? error.message : 'Failed to sync' })
    }
  },

  setShowBgn: async (showBgn: boolean, userId: string) => {
    if (!userId) {
      return
    }

    set({ showBgn, syncStatus: 'syncing' })

    try {
      const { user } = get()
      if (!user) return

      const currentProfile = await firestoreService.getUserProfile(user.uid)
      const updatedPreferences: {
        theme: 'light' | 'dark'
        currency: 'EUR' | 'BGN'
        language: 'bg' | 'en'
        updatedAt: string
      } = {
        theme: currentProfile?.preferences?.theme || 'light',
        currency: showBgn ? 'BGN' : 'EUR',
        language: currentProfile?.preferences?.language || 'en',
        updatedAt: new Date().toISOString()
      }

      await firestoreService.updateUserProfile(user.uid, {
        preferences: updatedPreferences
      })

      set({ syncStatus: 'success', lastSyncTime: new Date().toISOString() })
    } catch (error) {
      console.error('Error updating currency display:', error)
      set({ syncStatus: 'error', errorMessage: error instanceof Error ? error.message : 'Failed to sync' })
    }
  },

  // History actions
  addHistoryEntry: async (entry) => {
    const { user } = get()
    if (!user) return

    try {
      await firestoreService.addHistoryEntry(user.uid, entry)
      // Real-time listener will update the state
    } catch (error) {
      console.error('Error adding history entry:', error)
      set({ errorMessage: error instanceof Error ? error.message : 'Failed to add history entry' })
    }
  },

  updateHistoryEntry: async (id: string, entry) => {
    const { user } = get()
    if (!user) return

    try {
      await firestoreService.updateHistoryEntry(user.uid, id, entry)
      // Real-time listener will update the state
    } catch (error) {
      console.error('Error updating history entry:', error)
      set({ errorMessage: error instanceof Error ? error.message : 'Failed to update history entry' })
    }
  },

  deleteHistoryEntry: async (id: string) => {
    const { user } = get()
    if (!user) return

    try {
      await firestoreService.deleteHistoryEntry(user.uid, id)
      // Real-time listener will update the state
    } catch (error) {
      console.error('Error deleting history entry:', error)
      set({ errorMessage: error instanceof Error ? error.message : 'Failed to delete history entry' })
    }
  },

  clearHistory: async () => {
    const { user } = get()
    if (!user) return

    try {
      await firestoreService.clearHistory(user.uid)
      // Real-time listener will update the state
    } catch (error) {
      console.error('Error clearing history:', error)
      set({ errorMessage: error instanceof Error ? error.message : 'Failed to clear history' })
    }
  },

  // Goal actions
  addGoal: async (goal) => {
    const { user } = get()
    if (!user) return

    try {
      await firestoreService.addGoal(user.uid, goal)
      // Real-time listener will update the state
    } catch (error) {
      console.error('Error adding goal:', error)
      set({ errorMessage: error instanceof Error ? error.message : 'Failed to add goal' })
    }
  },

  updateGoal: async (id: string, goal) => {
    const { user } = get()
    if (!user) return

    try {
      await firestoreService.updateGoal(user.uid, id, goal)
      // Real-time listener will update the state
    } catch (error) {
      console.error('Error updating goal:', error)
      set({ errorMessage: error instanceof Error ? error.message : 'Failed to update goal' })
    }
  },

  deleteGoal: async (id: string) => {
    const { user } = get()
    if (!user) return

    try {
      await firestoreService.deleteGoal(user.uid, id)
      // Real-time listener will update the state
    } catch (error) {
      console.error('Error deleting goal:', error)
      set({ errorMessage: error instanceof Error ? error.message : 'Failed to delete goal' })
    }
  },

  clearGoals: async () => {
    const { user } = get()
    if (!user) return

    try {
      await firestoreService.clearGoals(user.uid)
      // Real-time listener will update the state
    } catch (error) {
      console.error('Error clearing goals:', error)
      set({ errorMessage: error instanceof Error ? error.message : 'Failed to clear goals' })
    }
  },

  // Statistics actions
  updateStatistics: async (stats) => {
    const { user } = get()
    if (!user) return

    try {
      const statsWithTimestamp = {
        ...stats,
        updatedAt: new Date().toISOString()
      }
      await firestoreService.updateUserProfile(user.uid, {
        statistics: statsWithTimestamp
      })
      set({ statistics: stats })
    } catch (error) {
      console.error('Error updating statistics:', error)
      set({ errorMessage: error instanceof Error ? error.message : 'Failed to update statistics' })
    }
  },

  // Sync actions
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  setError: (errorMessage) => set({ errorMessage }),

  syncNow: async () => {
    const { user } = get()
    if (!user) return

    set({ syncStatus: 'syncing' })
    try {
      await get().loadUserData(user.uid)
      set({ syncStatus: 'success', lastSyncTime: new Date().toISOString() })
    } catch (error) {
      console.error('Error syncing:', error)
      set({ syncStatus: 'error', errorMessage: error instanceof Error ? error.message : 'Sync failed' })
    }
  }
}))

export default useRealtimeStore

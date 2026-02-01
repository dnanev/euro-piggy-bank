import React from 'react'
import { useRealtimeStore } from './useRealtimeStore'
import { useAuth } from '../contexts/authUtils'

// Enhanced hook that combines realtime store with auth state
export const useAppStoreFirebase = () => {
  const auth = useAuth()
  const realtimeStore = useRealtimeStore()

  // Start/stop listening based on auth state
  React.useEffect(() => {
    if (auth.user && auth.isAuthenticated && !realtimeStore.isListening) {
      realtimeStore.startListening(auth.user.uid)
    } else if (!auth.isAuthenticated && realtimeStore.isListening) {
      realtimeStore.stopListening()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user, auth.isAuthenticated, realtimeStore.isListening])

  // Load user data when authenticated
  React.useEffect(() => {
    if (auth.user && auth.isAuthenticated && !realtimeStore.dataLoaded) {
      realtimeStore.loadUserData(auth.user.uid)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user, auth.isAuthenticated, realtimeStore.dataLoaded])

  return {
    // Auth state
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading || realtimeStore.loading,

    // App state from realtime store
    denominations: realtimeStore.denominations,
    theme: realtimeStore.theme,
    language: realtimeStore.language,
    showBgn: realtimeStore.showBgn,
    lastUpdated: realtimeStore.lastUpdated,
    history: realtimeStore.history,
    goals: realtimeStore.goals,
    statistics: realtimeStore.statistics,

    // Real-time state
    isListening: realtimeStore.isListening,
    syncStatus: realtimeStore.syncStatus,
    lastSyncTime: realtimeStore.lastSyncTime,
    errorMessage: realtimeStore.errorMessage,

    // Actions
    setQuantity: (id: string, quantity: number) => realtimeStore.setQuantity(id, quantity, auth.user?.uid || ''),
    setTheme: (theme: 'light' | 'dark') => realtimeStore.setTheme(theme, auth.user?.uid || ''),
    setLanguage: (language: 'bg' | 'en') => realtimeStore.setLanguage(language, auth.user?.uid || ''),
    setShowBgn: (showBgn: boolean) => realtimeStore.setShowBgn(showBgn, auth.user?.uid || ''),
    addHistoryEntry: realtimeStore.addHistoryEntry,
    updateHistoryEntry: realtimeStore.updateHistoryEntry,
    deleteHistoryEntry: realtimeStore.deleteHistoryEntry,
    clearHistory: realtimeStore.clearHistory,
    addGoal: realtimeStore.addGoal,
    updateGoal: realtimeStore.updateGoal,
    deleteGoal: realtimeStore.deleteGoal,
    clearGoals: realtimeStore.clearGoals,
    updateStatistics: realtimeStore.updateStatistics,
    syncNow: realtimeStore.syncNow,
    setError: realtimeStore.setError,
    setSyncStatus: realtimeStore.setSyncStatus,

    // Auth actions
    signOut: auth.signOut
  }
}

export default useAppStoreFirebase

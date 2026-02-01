import React, { useCallback } from 'react'
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

  // Memoize actions to prevent infinite re-renders
  const setQuantity = useCallback((id: string, quantity: number) =>
    realtimeStore.setQuantity(id, quantity, auth.user?.uid || ''), [realtimeStore.setQuantity, auth.user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  const setTheme = useCallback((theme: 'light' | 'dark') =>
    realtimeStore.setTheme(theme, auth.user?.uid || ''), [realtimeStore.setTheme, auth.user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  const setLanguage = useCallback((language: 'bg' | 'en') =>
    realtimeStore.setLanguage(language, auth.user?.uid || ''), [realtimeStore.setLanguage, auth.user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  const setShowBgn = useCallback((showBgn: boolean) =>
    realtimeStore.setShowBgn(showBgn, auth.user?.uid || ''), [realtimeStore.setShowBgn, auth.user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

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

    // Memoized actions
    setQuantity,
    setTheme,
    setLanguage,
    setShowBgn,
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

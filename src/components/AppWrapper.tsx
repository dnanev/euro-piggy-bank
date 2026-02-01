import React, { useEffect } from 'react'
import { AuthProvider } from '../contexts/AuthContext'
import { LoginPage } from './Auth/LoginPage'
import { MigrationWizard } from './MigrationWizard'
import { ConnectionStatus } from './ConnectionStatus'
import { useAuth } from '../contexts/AuthContext'
import { hasLocalStorageData } from '../utils/localStorage'
import { useAppStoreFirebase } from '../store/useAppStoreFirebase'

interface AppWrapperProps {
  children: React.ReactNode
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  return (
    <AuthProvider>
      <AppContent>
        {children}
      </AppContent>
    </AuthProvider>
  )
}

interface AppContentProps {
  children: React.ReactNode
}

const AppContent: React.FC<AppContentProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const { syncStatus, errorMessage } = useAppStoreFirebase()
  const [showMigration, setShowMigration] = React.useState(false)
  const [hasLocalData, setHasLocalData] = React.useState(false)
  const [showSyncSuccess, setShowSyncSuccess] = React.useState(false)

  // Handle sync success message timing
  React.useEffect(() => {
    if (syncStatus === 'success') {
      setShowSyncSuccess(true)
      const timer = setTimeout(() => {
        setShowSyncSuccess(false)
      }, 5000) // Clear after 5 seconds
      return () => clearTimeout(timer)
    }
  }, [syncStatus])

  useEffect(() => {
    // Check for localStorage data when component mounts
    const localDataExists = hasLocalStorageData()

    // Use setTimeout to avoid synchronous setState
    setTimeout(() => {
      setHasLocalData(localDataExists)

      // Show migration wizard if user is authenticated and has local data
      if (user && localDataExists) {
        setShowMigration(true)
      }
    }, 0)
  }, [user])

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <LoginPage />
  }

  // Show migration wizard if needed
  if (showMigration && hasLocalData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <MigrationWizard />
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowMigration(false)}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Skip migration for now
            </button>
          </div>
        </div>
        <ConnectionStatus />
      </div>
    )
  }

  // Show main app when authenticated
  return (
    <div className="min-h-screen bg-background">
      {children}
      <ConnectionStatus />

      {/* Sync status indicator */}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <span className="text-sm font-medium">Sync Error:</span>
              <span className="text-sm">{errorMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sync success indicator */}
      {showSyncSuccess && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <span className="text-sm font-medium">Sync Complete</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppWrapper

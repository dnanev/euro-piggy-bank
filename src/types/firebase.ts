import type { EuroDenomination } from '../store/types'
import type { HistoryEntry, SavingsGoal } from '../store/types'

// Firebase User Profile Document
export interface FirebaseUserProfile {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  createdAt: string
  lastLoginAt: string
  preferences: {
    theme: 'light' | 'dark'
    currency: 'EUR' | 'BGN'
    language: 'bg' | 'en'
    updatedAt: string
  }
  statistics?: {
    totalSnapshots: number
    totalSavedEur: number
    totalSavedBgn: number
    averageDailySaving: number
    bestSavingDay: number
    currentStreak: number
    longestStreak: number
    periodComparison: {
      period1: {
        startDate: string
        endDate: string
        totalEur: number
        totalBgn: number
        entryCount: number
      }
      period2: {
        startDate: string
        endDate: string
        totalEur: number
        totalBgn: number
        entryCount: number
      }
    }
    updatedAt: string
  }
}

// Firebase Savings Document
export interface FirebaseSavingsDocument {
  denominations: EuroDenomination[]
  totalEur: number
  totalBgn: number
  updatedAt: string
  createdAt: string
}

// Firebase History Document (extends HistoryEntry with Firebase metadata)
export interface FirebaseHistoryDocument extends Omit<HistoryEntry, 'id'> {
  id: string
  userId: string
  createdAt: string
  updatedAt?: string
}

// Firebase Goal Document (extends SavingsGoal with Firebase metadata)
export interface FirebaseGoalDocument extends Omit<SavingsGoal, 'id'> {
  id: string
  userId: string
  createdAt: string
  updatedAt?: string
}

// Firebase Sync Status
export interface SyncStatus {
  status: 'online' | 'offline' | 'syncing' | 'error'
  lastSyncTime: string | null
  pendingChanges: number
  errorMessage?: string
}

// Firebase Collection Names
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  SAVINGS: 'savings',
  HISTORY: 'history',
  GOALS: 'goals'
} as const

// Firebase Document Paths
export const getFirebasePaths = (userId: string) => ({
  userProfile: `users/${userId}`,
  savings: `users/${userId}/savings/current`,
  history: `users/${userId}/history`,
  goals: `users/${userId}/goals`
})

// Firebase Error Types
export interface FirebaseError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// Connection Status
export type ConnectionStatus = 'online' | 'offline' | 'connecting' | 'disconnected'

// Sync Queue Item
export interface SyncQueueItem {
  id: string
  type: 'create' | 'update' | 'delete'
  collection: string
  documentId?: string
  data?: Record<string, unknown>
  timestamp: string
  retryCount: number
  maxRetries: number
}

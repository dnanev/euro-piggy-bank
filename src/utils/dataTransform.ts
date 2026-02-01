import type { LocalStorageData } from './localStorage'
import type { EuroDenomination } from '../store/types'
import type { FirebaseUserProfile, FirebaseSavingsDocument, FirebaseHistoryDocument, FirebaseGoalDocument } from '../types/firebase'
import type { HistoryEntry, SavingsGoal } from '../store/types'
import { EURO_DENOMINATIONS } from '../store/constants'

interface TransformResult {
  userProfile: FirebaseUserProfile
  savings: {
    denominations: EuroDenomination[]
    totalEur: number
    totalBgn: number
  } | null
  history: HistoryEntry[]
  goals: SavingsGoal[]
}

export const transformLocalStorageToFirebase = (
  userId: string,
  localStorageData: LocalStorageData,
  options: {
    includeDenominations?: boolean
    includeHistory?: boolean
    includeGoals?: boolean
    includePreferences?: boolean
  } = {}
): TransformResult => {
  const now = new Date().toISOString()
  const opts = {
    includeDenominations: true,
    includeHistory: true,
    includeGoals: true,
    includePreferences: true,
    ...options
  }

  const result: TransformResult = {
    userProfile: {
      uid: userId,
      email: '', // Will be filled during migration
      displayName: '',
      photoURL: '',
      createdAt: now,
      lastLoginAt: now,
      preferences: opts.includePreferences ? {
        theme: localStorageData.theme,
        currency: localStorageData.showBgn ? 'BGN' : 'EUR',
        updatedAt: now
      } : {
        theme: 'light',
        currency: 'EUR',
        updatedAt: now
      }
    } as FirebaseUserProfile,

    savings: opts.includeDenominations ? {
      denominations: localStorageData.denominations,
      totalEur: localStorageData.denominations.reduce((total, denom) => total + (denom.quantity * denom.value), 0),
      totalBgn: localStorageData.denominations.reduce((total, denom) => total + (denom.quantity * denom.value), 0) * 1.95583,
      updatedAt: localStorageData.lastUpdated || now,
      createdAt: now
    } as FirebaseSavingsDocument : null,

    history: opts.includeHistory ? localStorageData.history.map(entry => ({
      ...entry,
      id: entry.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
      userId,
      createdAt: entry.timestamp || now
    })) as FirebaseHistoryDocument[] : [],

    goals: opts.includeGoals ? localStorageData.goals.map(goal => ({
      ...goal,
      id: goal.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
      userId,
      createdAt: goal.createdAt || now
    })) as FirebaseGoalDocument[] : []
  }

  return result
}

// Transform Firebase data back to localStorage format
export const transformFirebaseToLocalStorage = (
  userProfile: FirebaseUserProfile | null,
  savings: FirebaseSavingsDocument | null,
  history: FirebaseHistoryDocument[],
  goals: FirebaseGoalDocument[]
): LocalStorageData => {
  return {
    denominations: savings?.denominations || EURO_DENOMINATIONS,
    theme: userProfile?.preferences.theme || 'light',
    language: userProfile?.preferences.currency === 'BGN' ? 'bg' : 'en',
    showBgn: userProfile?.preferences.currency === 'BGN',
    lastUpdated: savings?.updatedAt || null,
    history: history.map(entry => ({
      id: entry.id,
      timestamp: entry.createdAt,
      totalEur: entry.totalEur,
      totalBgn: entry.totalBgn,
      denominations: entry.denominations,
      type: entry.type
    })) as HistoryEntry[],
    goals: goals.map(goal => ({
      id: goal.id,
      title: goal.title,
      targetAmount: goal.targetAmount,
      targetCurrency: goal.targetCurrency,
      deadline: goal.deadline,
      createdAt: goal.createdAt,
      achievedAt: goal.achievedAt
    })) as SavingsGoal[],
    statistics: userProfile?.statistics || null
  }
}

// Validate and clean data during transformation
export const cleanLocalStorageData = (data: LocalStorageData): LocalStorageData => {
  return {
    ...data,
    denominations: data.denominations.map(denom => ({
      ...denom,
      quantity: Math.max(0, denom.quantity || 0)
    })),
    history: data.history.filter(entry =>
      entry &&
      entry.id &&
      entry.timestamp &&
      typeof entry.totalEur === 'number' &&
      typeof entry.totalBgn === 'number'
    ),
    goals: data.goals.filter(goal =>
      goal &&
      goal.id &&
      goal.title &&
      typeof goal.targetAmount === 'number'
    )
  }
}

// Calculate migration statistics
export const getMigrationStats = (localStorageData: LocalStorageData) => {
  return {
    totalDenominations: localStorageData.denominations.length,
    totalCoins: localStorageData.denominations.filter(d => d.type === 'coin').reduce((sum, d) => sum + d.quantity, 0),
    totalBanknotes: localStorageData.denominations.filter(d => d.type === 'banknote').reduce((sum, d) => sum + d.quantity, 0),
    totalValueEur: localStorageData.denominations.reduce((sum, d) => sum + (d.quantity * d.value), 0),
    totalValueBgn: localStorageData.denominations.reduce((sum, d) => sum + (d.quantity * d.value), 0) * 1.95583,
    historyEntries: localStorageData.history.length,
    goals: localStorageData.goals.length,
    hasData: localStorageData.history.length > 0 || localStorageData.goals.length > 0
  }
}

// Generate migration summary
export const generateMigrationSummary = (localStorageData: LocalStorageData) => {
  const stats = getMigrationStats(localStorageData)

  return {
    itemsToMigrate: [
      ...(stats.totalDenominations > 0 ? ['Denominations'] : []),
      ...(stats.historyEntries > 0 ? ['History Entries'] : []),
      ...(stats.goals > 0 ? ['Savings Goals'] : []),
      ['User Preferences']
    ],
    totalItems: stats.totalDenominations + stats.historyEntries + stats.goals + 1,
    estimatedSize: JSON.stringify(localStorageData).length,
    lastUpdated: localStorageData.lastUpdated
  }
}

export default {
  transformLocalStorageToFirebase,
  transformFirebaseToLocalStorage,
  cleanLocalStorageData,
  getMigrationStats,
  generateMigrationSummary
}

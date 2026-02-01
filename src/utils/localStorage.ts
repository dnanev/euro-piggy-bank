import type { EuroDenomination } from '../store/types'
import type { HistoryEntry, SavingsGoal, HistoryStatistics } from '../store/types'
import { EURO_DENOMINATIONS } from '../store/constants'

export interface LocalStorageData {
  denominations: EuroDenomination[]
  theme: 'light' | 'dark'
  language: 'bg' | 'en'
  showBgn: boolean
  lastUpdated: string | null
  history: HistoryEntry[]
  goals: SavingsGoal[]
  statistics: HistoryStatistics | null
}

export const localStorageKeys = {
  DENOMINATIONS: 'euro-piggy-bank-denominations',
  THEME: 'euro-piggy-bank-theme',
  LANGUAGE: 'euro-piggy-bank-language',
  SHOW_BGN: 'euro-piggy-bank-show-bgn',
  LAST_UPDATED: 'euro-piggy-bank-last-updated',
  HISTORY: 'euro-piggy-bank-history',
  GOALS: 'euro-piggy-bank-goals',
  STATISTICS: 'euro-piggy-bank-statistics'
} as const

// Check if localStorage has any data from the app
export const hasLocalStorageData = (): boolean => {
  try {
    const keys = Object.values(localStorageKeys)
    return keys.some(key => {
      const value = localStorage.getItem(key)
      return value !== null && value !== undefined && value !== ''
    })
  } catch (error) {
    console.error('Error checking localStorage:', error)
    return false
  }
}

// Get all localStorage data
export const getLocalStorageData = (): LocalStorageData => {
  try {
    return {
      denominations: JSON.parse(localStorage.getItem(localStorageKeys.DENOMINATIONS) || 'null') || EURO_DENOMINATIONS,
      theme: (localStorage.getItem(localStorageKeys.THEME) as 'light' | 'dark') || 'light',
      language: (localStorage.getItem(localStorageKeys.LANGUAGE) as 'bg' | 'en') || 'bg',
      showBgn: localStorage.getItem(localStorageKeys.SHOW_BGN) === 'true',
      lastUpdated: localStorage.getItem(localStorageKeys.LAST_UPDATED),
      history: JSON.parse(localStorage.getItem(localStorageKeys.HISTORY) || '[]'),
      goals: JSON.parse(localStorage.getItem(localStorageKeys.GOALS) || '[]'),
      statistics: JSON.parse(localStorage.getItem(localStorageKeys.STATISTICS) || 'null')
    }
  } catch (error) {
    console.error('Error reading localStorage data:', error)
    return {
      denominations: EURO_DENOMINATIONS,
      theme: 'light',
      language: 'bg',
      showBgn: false,
      lastUpdated: null,
      history: [],
      goals: [],
      statistics: null
    }
  }
}

// Clear all localStorage data
export const clearLocalStorageData = (): void => {
  try {
    Object.values(localStorageKeys).forEach(key => {
      localStorage.removeItem(key)
    })
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

// Get localStorage data size (in bytes)
export const getLocalStorageSize = (): number => {
  try {
    let total = 0
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += localStorage[key].length + key.length
      }
    }
    return total
  } catch (error) {
    console.error('Error calculating localStorage size:', error)
    return 0
  }
}

// Validate localStorage data integrity
export const validateLocalStorageData = (data: LocalStorageData): boolean => {
  try {
    // Check if denominations is valid
    if (!Array.isArray(data.denominations)) return false

    // Check if each denomination has required properties
    const hasValidDenominations = data.denominations.every(denom =>
      denom &&
      typeof denom.id === 'string' &&
      typeof denom.label === 'string' &&
      typeof denom.value === 'number' &&
      typeof denom.quantity === 'number' &&
      typeof denom.type === 'string'
    )

    if (!hasValidDenominations) return false

    // Check if history is valid array
    if (!Array.isArray(data.history)) return false

    // Check if goals is valid array
    if (!Array.isArray(data.goals)) return false

    // Check if theme is valid
    if (!['light', 'dark'].includes(data.theme)) return false

    // Check if language is valid
    if (!['bg', 'en'].includes(data.language)) return false

    // Check if showBgn is boolean
    if (typeof data.showBgn !== 'boolean') return false

    return true
  } catch (error) {
    console.error('Error validating localStorage data:', error)
    return false
  }
}

export default {
  hasLocalStorageData,
  getLocalStorageData,
  clearLocalStorageData,
  getLocalStorageSize,
  validateLocalStorageData
}

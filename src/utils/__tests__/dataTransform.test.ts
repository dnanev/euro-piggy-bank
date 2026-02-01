import { describe, it, expect } from 'vitest'
import {
  transformLocalStorageToFirebase,
  transformFirebaseToLocalStorage,
  cleanLocalStorageData,
  getMigrationStats,
  generateMigrationSummary
} from '../dataTransform'
import type { LocalStorageData } from '../localStorage'
import type { EuroDenomination } from '../../store/types'
import { EURO_DENOMINATIONS } from '../../store/constants'

describe('Data Transform Utilities', () => {
  const mockDenominations: EuroDenomination[] = [
    { id: '1c', label: '1 cent', value: 1, quantity: 5, type: 'coin' as const },
    { id: '2c', label: '2 cents', value: 2, quantity: 3, type: 'coin' as const },
    { id: '5c', label: '5 cents', value: 5, quantity: 2, type: 'coin' as const },
    { id: '10c', label: '10 cents', value: 10, quantity: 1, type: 'coin' as const },
    { id: '20c', label: '20 cents', value: 20, quantity: 0, type: 'coin' as const },
    { id: '50c', label: '50 cents', value: 50, quantity: 1, type: 'coin' as const },
    { id: '1e', label: '1 euro', value: 100, quantity: 2, type: 'banknote' as const },
    { id: '2e', label: '2 euros', value: 200, quantity: 1, type: 'banknote' as const },
    { id: '5e', label: '5 euros', value: 500, quantity: 0, type: 'banknote' as const },
    { id: '10e', label: '10 euros', value: 1000, quantity: 1, type: 'banknote' as const },
    { id: '20e', label: '20 euros', value: 2000, quantity: 0, type: 'banknote' as const },
    { id: '50e', label: '50 euros', value: 5000, quantity: 0, type: 'banknote' as const }
  ]

  const mockLocalStorageData: LocalStorageData = {
    denominations: mockDenominations,
    theme: 'light',
    language: 'bg',
    showBgn: true,
    lastUpdated: '2024-01-15T10:30:00Z',
    history: [
      {
        id: 'h1',
        timestamp: '2024-01-15T10:00:00Z',
        totalEur: 500,
        totalBgn: 977.92,
        denominations: mockDenominations,
        type: 'snapshot'
      }
    ],
    goals: [
      {
        id: 'g1',
        title: 'Vacation Fund',
        targetAmount: 1000,
        targetCurrency: 'EUR',
        deadline: '2024-06-15T00:00:00Z',
        createdAt: '2024-01-15T10:00:00Z',
        achievedAt: null
      }
    ],
    statistics: null
  }

  describe('transformLocalStorageToFirebase', () => {
    it('should transform localStorage data to Firebase format', () => {
      const userId = 'test-user-id'
      const result = transformLocalStorageToFirebase(userId, mockLocalStorageData)

      expect(result.userProfile.uid).toBe(userId)
      expect(result.userProfile.email).toBe('')
      expect(result.userProfile.preferences.theme).toBe('light')
      expect(result.userProfile.preferences.currency).toBe('BGN')
      expect(result.savings?.denominations).toEqual(mockLocalStorageData.denominations)
      expect(result.savings?.totalEur).toBe(500) // 5*1 + 3*2 + 2*5 + 1*10 + 1*50 + 2*100 + 1*1000
      expect(result.savings?.totalBgn).toBe(977.92)
      expect(result.history).toHaveLength(1)
      expect(result.goals).toHaveLength(1)
    })

    it('should handle selective migration options', () => {
      const userId = 'test-user-id'
      const result = transformLocalStorageToFirebase(userId, mockLocalStorageData, {
        includeDenominations: false,
        includeHistory: false,
        includeGoals: false,
        includePreferences: false
      })

      expect(result.savings).toBeNull()
      expect(result.history).toHaveLength(0)
      expect(result.goals).toHaveLength(0)
      expect(result.userProfile.preferences.theme).toBe('light')
      expect(result.userProfile.preferences.currency).toBe('EUR')
    })
  })

  describe('transformFirebaseToLocalStorage', () => {
    it('should transform Firebase data back to localStorage format', () => {
      const userProfile = {
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: '2024-01-15T10:00:00Z',
        lastLoginAt: '2024-01-15T10:00:00Z',
        preferences: {
          theme: 'dark' as const,
          currency: 'EUR' as const,
          language: 'en' as const,
          updatedAt: '2024-01-15T10:00:00Z'
        },
        statistics: {
          totalSnapshots: 10,
          totalSavedEur: 500,
          totalSavedBgn: 977.92,
          averageDailySaving: 50,
          bestSavingDay: 100,
          currentStreak: 5,
          longestStreak: 10,
          periodComparison: {
            period1: {
              startDate: '2024-01-01',
              endDate: '2024-01-15',
              totalEur: 500,
              totalBgn: 977.92,
              entryCount: 10
            },
            period2: {
              startDate: '2023-12-01',
              endDate: '2023-12-15',
              totalEur: 300,
              totalBgn: 586.75,
              entryCount: 8
            }
          },
          updatedAt: '2024-01-15T10:00:00Z'
        }
      }

      const savings = {
        denominations: mockLocalStorageData.denominations,
        totalEur: 500,
        totalBgn: 977.92,
        updatedAt: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-15T10:00:00Z'
      }

      const history = [
        {
          id: 'h1',
          timestamp: '2024-01-15T10:00:00Z',
          userId: 'test-user-id',
          createdAt: '2024-01-15T10:00:00Z',
          totalEur: 500,
          totalBgn: 977.92,
          denominations: mockLocalStorageData.denominations,
          type: 'snapshot' as const
        }
      ]

      const goals = [
        {
          id: 'g1',
          userId: 'test-user-id',
          title: 'Vacation Fund',
          targetAmount: 1000,
          targetCurrency: 'EUR' as const,
          deadline: '2024-06-15T00:00:00Z',
          createdAt: '2024-01-15T10:00:00Z',
          achievedAt: null
        }
      ]

      const result = transformFirebaseToLocalStorage(userProfile, savings, history, goals)

      expect(result.theme).toBe('dark')
      expect(result.language).toBe('en')
      expect(result.showBgn).toBe(false)
      expect(result.denominations).toEqual(mockLocalStorageData.denominations)
      expect(result.history).toHaveLength(1)
      expect(result.goals).toHaveLength(1)
      expect(result.statistics).toEqual(userProfile.statistics)
    })
  })

  describe('cleanLocalStorageData', () => {
    it('should clean invalid data', () => {
      const dirtyData: LocalStorageData = {
        ...mockLocalStorageData,
        denominations: [
          { id: '1c', label: '1 cent', value: 1, quantity: -5, type: 'coin' as const }, // Negative quantity
          { id: '2c', label: '2 cents', value: 2, quantity: 3, type: 'coin' as const }
        ],
        history: [
          {
            id: 'h1',
            timestamp: '2024-01-15T10:00:00Z',
            totalEur: 500,
            totalBgn: 977.92,
            denominations: mockLocalStorageData.denominations,
            type: 'snapshot' as const
          },
          {
            id: 'h2',
            timestamp: '2024-01-15T10:00:00Z',
            totalEur: 300,
            totalBgn: 586.75,
            denominations: mockLocalStorageData.denominations,
            type: 'snapshot' as const
          }
        ],
        goals: [
          {
            id: 'g1',
            title: 'Vacation Fund',
            targetAmount: 1000,
            targetCurrency: 'EUR',
            deadline: '2024-06-15T00:00:00Z',
            createdAt: '2024-01-15T10:00:00Z',
            achievedAt: null
          }
        ]
      }

      const cleaned = cleanLocalStorageData(dirtyData)

      expect(cleaned.denominations[0].quantity).toBe(0) // Negative values become 0
      expect(cleaned.denominations[1].quantity).toBe(3) // Valid values remain
      expect(cleaned.history).toHaveLength(1) // Only valid entries remain
      expect(cleaned.goals).toHaveLength(1) // Only valid entries remain
    })
  })

  describe('getMigrationStats', () => {
    it('should calculate migration statistics correctly', () => {
      const stats = getMigrationStats(mockLocalStorageData)

      expect(stats.totalDenominations).toBe(12)
      expect(stats.totalCoins).toBe(11) // 5+3+2+1 = 11
      expect(stats.totalBanknotes).toBe(4) // 2+1+1+0+0 = 4
      expect(stats.totalValueEur).toBe(500)
      expect(stats.totalValueBgn).toBe(977.92)
      expect(stats.historyEntries).toBe(1)
      expect(stats.goals).toBe(1)
      expect(stats.hasData).toBe(true)
    })

    it('should handle empty data', () => {
      const emptyData: LocalStorageData = {
        denominations: EURO_DENOMINATIONS,
        theme: 'light',
        language: 'bg',
        showBgn: false,
        lastUpdated: null,
        history: [],
        goals: [],
        statistics: null
      }

      const stats = getMigrationStats(emptyData)

      expect(stats.totalDenominations).toBe(12)
      expect(stats.totalCoins).toBe(0)
      expect(stats.totalBanknotes).toBe(0)
      expect(stats.totalValueEur).toBe(0)
      expect(stats.totalValueBgn).toBe(0)
      expect(stats.historyEntries).toBe(0)
      expect(stats.goals).toBe(0)
      expect(stats.hasData).toBe(false)
    })
  })

  describe('generateMigrationSummary', () => {
    it('should generate migration summary', () => {
      const summary = generateMigrationSummary(mockLocalStorageData)

      expect(summary.itemsToMigrate).toContain('Denominations')
      expect(summary.itemsToMigrate).toContain('History Entries')
      expect(summary.itemsToMigrate).toContain('Savings Goals')
      expect(summary.itemsToMigrate).toContain('User Preferences')
      expect(summary.totalItems).toBe(4)
      expect(summary.estimatedSize).toBeGreaterThan(0)
      expect(summary.lastUpdated).toBe('2024-01-15T10:30:00Z')
    })

    it('should handle empty data summary', () => {
      const emptyData: LocalStorageData = {
        denominations: EURO_DENOMINATIONS,
        theme: 'light',
        language: 'bg',
        showBgn: false,
        lastUpdated: null,
        history: [],
        goals: [],
        statistics: null
      }

      const summary = generateMigrationSummary(emptyData)

      expect(summary.itemsToMigrate).toEqual(['User Preferences'])
      expect(summary.totalItems).toBe(1)
    })
  })
})

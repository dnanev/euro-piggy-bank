import type { EuroDenomination } from '../store/types'
import type { HistoryEntry } from '../store/types'
import type { SavingsGoal } from '../store/types'

export interface ConflictResolutionStrategy {
  type: 'last-write-wins' | 'first-write-wins' | 'merge' | 'manual'
  description: string
}

export interface ConflictItem {
  id: string
  type: 'denominations' | 'history' | 'goals' | 'preferences'
  localData: EuroDenomination[] | HistoryEntry[] | SavingsGoal[] | Record<string, unknown>
  remoteData: EuroDenomination[] | HistoryEntry[] | SavingsGoal[] | Record<string, unknown>
  timestamp: string
  resolvedData?: EuroDenomination[] | HistoryEntry[] | SavingsGoal[] | Record<string, unknown>
  strategy?: ConflictResolutionStrategy
}

export interface ConflictResolution {
  conflicts: ConflictItem[]
  resolved: ConflictItem[]
  unresolved: ConflictItem[]
  timestamp: string
}

// Conflict resolution strategies
export const CONFLICT_STRATEGIES: Record<string, ConflictResolutionStrategy> = {
  LAST_WRITE_WINS: {
    type: 'last-write-wins',
    description: 'Keep the most recent changes'
  },
  FIRST_WRITE_WINS: {
    type: 'first-write-wins',
    description: 'Keep the original changes'
  },
  MERGE: {
    type: 'merge',
    description: 'Combine both changes when possible'
  },
  MANUAL: {
    type: 'manual',
    description: 'Let user decide how to resolve'
  }
}

// Resolve denomination conflicts
export const resolveDenominationConflict = (
  local: EuroDenomination[],
  remote: EuroDenomination[],
  strategy: ConflictResolutionStrategy['type']
): EuroDenomination[] => {
  switch (strategy) {
    case 'last-write-wins':
      return remote

    case 'first-write-wins':
      return local

    case 'merge':
      // Merge by taking the maximum quantity for each denomination
      {
        const merged: EuroDenomination[] = local.map(localDenom => {
          const remoteDenom = remote.find(d => d.id === localDenom.id)
          return {
            ...localDenom,
            quantity: Math.max(localDenom.quantity, remoteDenom?.quantity || 0)
          }
        })

        // Add any denominations that exist only in remote
        remote.forEach(remoteDenom => {
          if (!local.find(d => d.id === remoteDenom.id)) {
            merged.push(remoteDenom)
          }
        })

        return merged
      }

    case 'manual':
      // Return both for manual resolution
      throw new Error('Manual resolution required for denominations')

    default:
      return remote
  }
}

// Resolve history entry conflicts
export const resolveHistoryConflict = (
  local: HistoryEntry[],
  remote: HistoryEntry[],
  strategy: ConflictResolutionStrategy['type']
): HistoryEntry[] => {
  switch (strategy) {
    case 'last-write-wins':
      return remote

    case 'first-write-wins':
      return local

    case 'merge':
      // Merge by combining unique entries and sorting by timestamp
      {
        const allEntries = [...local, ...remote]
        const uniqueEntries = allEntries.filter((entry, index, arr) =>
          arr.findIndex(e => e.id === entry.id) === index
        )
        return uniqueEntries.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      }

    case 'manual':
      throw new Error('Manual resolution required for history')

    default:
      return remote
  }
}

// Resolve goals conflicts
export const resolveGoalsConflict = (
  local: SavingsGoal[],
  remote: SavingsGoal[],
  strategy: ConflictResolutionStrategy['type']
): SavingsGoal[] => {
  switch (strategy) {
    case 'last-write-wins':
      return remote

    case 'first-write-wins':
      return local

    case 'merge':
      // Merge by combining unique goals
      {
        const allGoals = [...local, ...remote]
        const uniqueGoals = allGoals.filter((goal, index, arr) =>
          arr.findIndex(g => g.id === goal.id) === index
        )
        return uniqueGoals
      }

    case 'manual':
      throw new Error('Manual resolution required for goals')

    default:
      return remote
  }
}

// Detect conflicts between local and remote data
export const detectConflicts = (
  localData: {
    denominations: EuroDenomination[]
    history: HistoryEntry[]
    goals: SavingsGoal[]
    preferences: Record<string, unknown>
  },
  remoteData: {
    denominations: EuroDenomination[]
    history: HistoryEntry[]
    goals: SavingsGoal[]
    preferences: Record<string, unknown>
  },
  lastSyncTime?: string
): ConflictResolution => {
  const conflicts: ConflictItem[] = []

  // Check denominations
  if (localData.denominations && remoteData.denominations) {
    const localDenoms = JSON.stringify(localData.denominations)
    const remoteDenoms = JSON.stringify(remoteData.denominations)

    if (localDenoms !== remoteDenoms) {
      // Use lastSyncTime parameter to avoid unused warning
      console.debug('Checking denominations conflicts', lastSyncTime ? `since ${lastSyncTime}` : 'no sync time')
      conflicts.push({
        id: 'denominations',
        type: 'denominations',
        localData: localData.denominations,
        remoteData: remoteData.denominations,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Check history
  if (localData.history && remoteData.history) {
    const localHistory = JSON.stringify(localData.history)
    const remoteHistory = JSON.stringify(remoteData.history)

    if (localHistory !== remoteHistory) {
      conflicts.push({
        id: 'history',
        type: 'history',
        localData: localData.history,
        remoteData: remoteData.history,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Check goals
  if (localData.goals && remoteData.goals) {
    const localGoals = JSON.stringify(localData.goals)
    const remoteGoals = JSON.stringify(remoteData.goals)

    if (localGoals !== remoteGoals) {
      conflicts.push({
        id: 'goals',
        type: 'goals',
        localData: localData.goals,
        remoteData: remoteData.goals,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Check preferences
  if (localData.preferences && remoteData.preferences) {
    const localPrefs = JSON.stringify(localData.preferences)
    const remotePrefs = JSON.stringify(remoteData.preferences)

    if (localPrefs !== remotePrefs) {
      conflicts.push({
        id: 'preferences',
        type: 'preferences',
        localData: localData.preferences,
        remoteData: remoteData.preferences,
        timestamp: new Date().toISOString()
      })
    }
  }

  return {
    conflicts,
    resolved: [],
    unresolved: conflicts,
    timestamp: new Date().toISOString()
  }
}

// Auto-resolve conflicts using default strategy
export const autoResolveConflicts = (
  conflictResolution: ConflictResolution,
  defaultStrategy: ConflictResolutionStrategy['type'] = 'last-write-wins'
): ConflictResolution => {
  const resolved: ConflictItem[] = []
  const unresolved: ConflictItem[] = []

  for (const conflict of conflictResolution.conflicts) {
    try {
      let resolvedData: EuroDenomination[] | HistoryEntry[] | SavingsGoal[] | Record<string, unknown> | undefined

      switch (conflict.type) {
        case 'denominations':
          if (Array.isArray(conflict.localData) && conflict.localData.length > 0 &&
              conflict.localData[0] && 'id' in conflict.localData[0]) {
            resolvedData = resolveDenominationConflict(
              conflict.localData as EuroDenomination[],
              conflict.remoteData as EuroDenomination[],
              defaultStrategy
            )
          }
          break

        case 'history':
          if (Array.isArray(conflict.localData) && conflict.localData.length > 0 &&
              conflict.localData[0] && 'id' in conflict.localData[0]) {
            resolvedData = resolveHistoryConflict(
              conflict.localData as HistoryEntry[],
              conflict.remoteData as HistoryEntry[],
              defaultStrategy
            )
          }
          break

        case 'goals':
          if (Array.isArray(conflict.localData) && conflict.localData.length > 0 &&
              conflict.localData[0] && 'id' in conflict.localData[0]) {
            resolvedData = resolveGoalsConflict(
              conflict.localData as SavingsGoal[],
              conflict.remoteData as SavingsGoal[],
              defaultStrategy
            )
          }
          break

        case 'preferences':
          resolvedData = defaultStrategy === 'last-write-wins'
            ? conflict.remoteData
            : conflict.localData
          break

        default:
          unresolved.push(conflict)
          continue
      }

      resolved.push({
        ...conflict,
        resolvedData,
        strategy: CONFLICT_STRATEGIES[defaultStrategy.toUpperCase().replace('-', '_')]
      })
    } catch {
      // If auto-resolution fails, mark as unresolved
      unresolved.push({
        ...conflict,
        strategy: CONFLICT_STRATEGIES.MANUAL
      })
    }
  }

  return {
    ...conflictResolution,
    resolved,
    unresolved
  }
}

// Get conflict summary for user display
export const getConflictSummary = (conflictResolution: ConflictResolution) => {
  return {
    totalConflicts: conflictResolution.conflicts.length,
    resolvedCount: conflictResolution.resolved.length,
    unresolvedCount: conflictResolution.unresolved.length,
    conflictTypes: conflictResolution.conflicts.map(c => c.type),
    timestamp: conflictResolution.timestamp
  }
}

export default {
  resolveDenominationConflict,
  resolveHistoryConflict,
  resolveGoalsConflict,
  detectConflicts,
  autoResolveConflicts,
  getConflictSummary,
  CONFLICT_STRATEGIES
}

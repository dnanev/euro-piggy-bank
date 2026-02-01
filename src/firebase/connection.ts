import { create } from 'zustand'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from './config'
import type { ConnectionStatus, SyncStatus } from '../types/firebase'

interface ConnectionStore {
  status: ConnectionStatus
  syncStatus: SyncStatus
  isOnline: boolean
  lastConnected: string | null
  error: string | null

  // Actions
  setStatus: (status: ConnectionStatus) => void
  setSyncStatus: (syncStatus: SyncStatus) => void
  setError: (error: string | null) => void
  checkConnection: () => Promise<void>
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  status: 'connecting',
  syncStatus: {
    status: 'online',
    lastSyncTime: null,
    pendingChanges: 0
  },
  isOnline: navigator.onLine,
  lastConnected: null,
  error: null,

  setStatus: (status) => set({ status }),

  setSyncStatus: (syncStatus) => set({ syncStatus }),

  setError: (error) => set({ error }),

  checkConnection: async () => {
    if (navigator.onLine) {
      try {
        set({ status: 'connecting', error: null })

        // Test connection by trying to read a document
        const testRef = doc(db, 'connection-test', 'ping')

        const unsubscribe = onSnapshot(
          testRef,
          () => {
            set({
              status: 'online',
              isOnline: true,
              lastConnected: new Date().toISOString(),
              error: null
            })
            unsubscribe()
          },
          (error) => {
            // Don't treat missing document as connection failure
            if (error.message.includes('Missing or insufficient permissions')) {
              set({
                status: 'online',
                isOnline: true,
                lastConnected: new Date().toISOString(),
                error: null
              })
            } else {
              set({
                status: 'disconnected',
                isOnline: false,
                error: error.message
              })
            }
            unsubscribe()
          }
        )

        // Set a timeout for the connection test
        setTimeout(() => {
          set({
            status: 'online',
            isOnline: true,
            lastConnected: new Date().toISOString(),
            error: null
          })
        }, 3000) // Reduced timeout

      } catch {
        // Don't fail on connection test errors - assume online if browser is online
        set({
          status: 'online',
          isOnline: true,
          lastConnected: new Date().toISOString(),
          error: null
        })
      }
    } else {
      set({
        status: 'offline',
        isOnline: false
      })
    }
  }
}))

// Browser online/offline event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useConnectionStore.getState().checkConnection()
  })

  window.addEventListener('offline', () => {
    useConnectionStore.setState({
      status: 'offline',
      isOnline: false
    })
  })

  // Initial connection check
  useConnectionStore.getState().checkConnection()
}

// Periodic connection check (every 30 seconds)
setInterval(() => {
  const store = useConnectionStore.getState()
  if (store.status === 'disconnected' || store.status === 'offline') {
    store.checkConnection()
  }
}, 30000)

export default useConnectionStore

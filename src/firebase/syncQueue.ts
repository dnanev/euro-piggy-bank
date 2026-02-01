import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from './config'
import { useConnectionStore } from './connection'
import type { SyncQueueItem } from '../types/firebase'

interface SyncQueueStore {
  queue: SyncQueueItem[]
  isProcessing: boolean

  // Actions
  addToQueue: (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>) => void
  removeFromQueue: (id: string) => void
  processQueue: () => Promise<void>
  clearQueue: () => void
  getPendingCount: () => number
}

export const useSyncQueueStore = create<SyncQueueStore>()(
  persist(
    (set, get) => ({
      queue: [],
      isProcessing: false,

      addToQueue: (item) => {
        const queueItem: SyncQueueItem = {
          ...item,
          id: Date.now().toString(36) + Math.random().toString(36).substr(2),
          timestamp: new Date().toISOString(),
          retryCount: 0
        }

        set((state) => ({
          queue: [...state.queue, queueItem]
        }))

        // Try to process immediately if online
        const { status } = useConnectionStore.getState()
        if (status === 'online' && !get().isProcessing) {
          get().processQueue()
        }
      },

      removeFromQueue: (id) => {
        set((state) => ({
          queue: state.queue.filter(item => item.id !== id)
        }))
      },

      processQueue: async () => {
        const { queue, isProcessing } = get()
        const { status } = useConnectionStore.getState()

        if (isProcessing || status !== 'online' || queue.length === 0) {
          return
        }

        set({ isProcessing: true })

        try {
          const itemsToProcess = [...queue]

          for (const item of itemsToProcess) {
            try {
              await processSyncItem(item)
              get().removeFromQueue(item.id)
            } catch (error) {
              console.error('Failed to process sync item:', item, error)

              // Update retry count
              const updatedQueue = get().queue.map(queueItem =>
                queueItem.id === item.id
                  ? { ...queueItem, retryCount: queueItem.retryCount + 1 }
                  : queueItem
              )

              // Remove item if max retries exceeded
              const maxRetries = item.maxRetries || 3
              const failedItem = updatedQueue.find(qi => qi.id === item.id)

              if (failedItem && failedItem.retryCount >= maxRetries) {
                console.error('Max retries exceeded for item:', item)
                get().removeFromQueue(item.id)
              } else {
                set({ queue: updatedQueue })
              }
            }
          }
        } finally {
          set({ isProcessing: false })
        }
      },

      clearQueue: () => {
        set({ queue: [] })
      },

      getPendingCount: () => {
        return get().queue.length
      }
    }),
    {
      name: 'sync-queue',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        queue: state.queue
      })
    }
  )
)

// Process individual sync item
async function processSyncItem(item: SyncQueueItem): Promise<void> {
  const { collection, documentId, data, type } = item

  switch (type) {
    case 'create':
    case 'update':
      if (documentId) {
        const docRef = doc(db, collection, documentId)
        if (type === 'create') {
          await setDoc(docRef, data)
        } else if (data) {
          await updateDoc(docRef, data)
        }
      }
      break

    case 'delete':
      if (documentId) {
        const docRef = doc(db, collection, documentId)
        await deleteDoc(docRef)
      }
      break

    default:
      throw new Error(`Unknown sync item type: ${type}`)
  }
}

// Auto-process queue when connection is restored
useConnectionStore.subscribe(
  (state) => {
    if (state.status === 'online') {
      const syncQueue = useSyncQueueStore.getState()
      if (!syncQueue.isProcessing && syncQueue.queue.length > 0) {
        syncQueue.processQueue()
      }
    }
  }
)

export default useSyncQueueStore

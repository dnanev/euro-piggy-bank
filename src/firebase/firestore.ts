import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './config'
import type {
  FirebaseUserProfile,
  FirebaseSavingsDocument,
  FirebaseHistoryDocument,
  FirebaseGoalDocument
} from '../types/firebase'
import type { EuroDenomination } from '../store/types'
import { FIREBASE_COLLECTIONS } from '../types/firebase'

// Firestore Service Class
export class FirestoreService {
  private static instance: FirestoreService
  private unsubscribeFunctions: (() => void)[] = []

  private constructor() {}

  static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService()
    }
    return FirestoreService.instance
  }

  // User Profile Operations
  async createUserProfile(userProfile: FirebaseUserProfile): Promise<void> {
    const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, userProfile.uid)
    await setDoc(userRef, {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  }

  async getUserProfile(uid: string): Promise<FirebaseUserProfile | null> {
    const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, uid)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      return userDoc.data() as FirebaseUserProfile
    }
    return null
  }

  async updateUserProfile(uid: string, updates: Partial<FirebaseUserProfile>): Promise<void> {
    const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, uid)
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }

  async deleteUserProfile(uid: string): Promise<void> {
    const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, uid)
    await deleteDoc(userRef)
  }

  // Savings Operations
  async saveSavingsData(uid: string, denominations: EuroDenomination[]): Promise<void> {
    const totalEur = denominations.reduce((total: number, denom: EuroDenomination) =>
      total + (denom.quantity * denom.value), 0)
    const totalBgn = totalEur * 1.95583

    const savingsData: FirebaseSavingsDocument = {
      denominations,
      totalEur,
      totalBgn,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    const savingsRef = doc(db, FIREBASE_COLLECTIONS.USERS, uid, FIREBASE_COLLECTIONS.SAVINGS, 'current')
    await setDoc(savingsRef, {
      ...savingsData,
      updatedAt: serverTimestamp()
    }, { merge: true })
  }

  async getSavingsData(uid: string): Promise<FirebaseSavingsDocument | null> {
    const savingsRef = doc(db, FIREBASE_COLLECTIONS.USERS, uid, FIREBASE_COLLECTIONS.SAVINGS, 'current')
    const savingsDoc = await getDoc(savingsRef)

    if (savingsDoc.exists()) {
      return savingsDoc.data() as FirebaseSavingsDocument
    }
    return null
  }

  // History Operations
  async addHistoryEntry(uid: string, entry: Omit<FirebaseHistoryDocument, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    const historyRef = doc(collection(db, FIREBASE_COLLECTIONS.USERS, uid, FIREBASE_COLLECTIONS.HISTORY))
    const historyEntry: FirebaseHistoryDocument = {
      ...entry,
      id: historyRef.id,
      userId: uid,
      createdAt: new Date().toISOString()
    }

    await setDoc(historyRef, {
      ...historyEntry,
      createdAt: serverTimestamp()
    })

    return historyRef.id
  }

  async getHistoryEntries(uid: string, limitCount = 100): Promise<FirebaseHistoryDocument[]> {
    const historyQuery = query(
      collection(db, FIREBASE_COLLECTIONS.USERS, uid, FIREBASE_COLLECTIONS.HISTORY),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const historySnapshot = await getDocs(historyQuery)
    return historySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseHistoryDocument[]
  }

  async updateHistoryEntry(uid: string, entryId: string, updates: Partial<FirebaseHistoryDocument>): Promise<void> {
    const historyRef = doc(db, FIREBASE_COLLECTIONS.USERS, uid, FIREBASE_COLLECTIONS.HISTORY, entryId)
    await updateDoc(historyRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }

  async deleteHistoryEntry(uid: string, entryId: string): Promise<void> {
    const historyRef = doc(db, FIREBASE_COLLECTIONS.USERS, uid, FIREBASE_COLLECTIONS.HISTORY, entryId)
    await deleteDoc(historyRef)
  }

  async clearHistory(uid: string): Promise<void> {
    const historyQuery = query(collection(db, FIREBASE_COLLECTIONS.USERS, uid, FIREBASE_COLLECTIONS.HISTORY))
    const historySnapshot = await getDocs(historyQuery)

    const deletePromises = historySnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
  }

  // Goals Operations
  async addGoal(uid: string, goal: Omit<FirebaseGoalDocument, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    const goalRef = doc(collection(db, FIREBASE_COLLECTIONS.USERS, uid, FIREBASE_COLLECTIONS.GOALS))
    const goalDocument: FirebaseGoalDocument = {
      ...goal,
      id: goalRef.id,
      userId: uid,
      createdAt: new Date().toISOString()
    }

    await setDoc(goalRef, {
      ...goalDocument,
      createdAt: serverTimestamp()
    })

    return goalRef.id
  }

  async getGoals(uid: string): Promise<FirebaseGoalDocument[]> {
    const goalsQuery = query(
      collection(db, FIREBASE_COLLECTIONS.USERS, uid, FIREBASE_COLLECTIONS.GOALS),
      orderBy('createdAt', 'desc')
    )

    const goalsSnapshot = await getDocs(goalsQuery)
    return goalsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseGoalDocument[]
  }

  async updateGoal(uid: string, goalId: string, updates: Partial<FirebaseGoalDocument>): Promise<void> {
    const goalRef = doc(db, FIREBASE_COLLECTIONS.USERS, uid, FIREBASE_COLLECTIONS.GOALS, goalId)
    await updateDoc(goalRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }

  async deleteGoal(uid: string, goalId: string): Promise<void> {
    const goalRef = doc(db, FIREBASE_COLLECTIONS.USERS, uid, FIREBASE_COLLECTIONS.GOALS, goalId)
    await deleteDoc(goalRef)
  }

  async clearGoals(uid: string): Promise<void> {
    const goalsQuery = query(collection(db, FIREBASE_COLLECTIONS.USERS, uid, FIREBASE_COLLECTIONS.GOALS))
    const goalsSnapshot = await getDocs(goalsQuery)

    const deletePromises = goalsSnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
  }

  // Real-time Listeners
  onUserProfileChange(uid: string, callback: (profile: FirebaseUserProfile | null) => void): () => void {
    const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, uid)
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as FirebaseUserProfile)
      } else {
        callback(null)
      }
    })

    this.unsubscribeFunctions.push(unsubscribe)
    return unsubscribe
  }

  onSavingsChange(uid: string, callback: (savings: FirebaseSavingsDocument | null) => void): () => void {
    const savingsRef = doc(db, FIREBASE_COLLECTIONS.USERS, uid, FIREBASE_COLLECTIONS.SAVINGS, 'current')
    const unsubscribe = onSnapshot(savingsRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as FirebaseSavingsDocument)
      } else {
        callback(null)
      }
    })

    this.unsubscribeFunctions.push(unsubscribe)
    return unsubscribe
  }

  onHistoryChange(uid: string, callback: (history: FirebaseHistoryDocument[]) => void): () => void {
    const historyQuery = query(
      collection(db, FIREBASE_COLLECTIONS.USERS, uid, FIREBASE_COLLECTIONS.HISTORY),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseHistoryDocument[]
      callback(history)
    })

    this.unsubscribeFunctions.push(unsubscribe)
    return unsubscribe
  }

  onGoalsChange(uid: string, callback: (goals: FirebaseGoalDocument[]) => void): () => void {
    const goalsQuery = query(
      collection(db, FIREBASE_COLLECTIONS.USERS, uid, FIREBASE_COLLECTIONS.GOALS),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(goalsQuery, (snapshot) => {
      const goals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseGoalDocument[]
      callback(goals)
    })

    this.unsubscribeFunctions.push(unsubscribe)
    return unsubscribe
  }

  // Cleanup
  cleanup(): void {
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe())
    this.unsubscribeFunctions = []
  }

  // Utility Functions
  convertTimestampToDate(timestamp: Timestamp | string): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate()
    }
    return new Date(timestamp)
  }

  convertDateToTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date)
  }
}

// Export singleton instance
export const firestoreService = FirestoreService.getInstance()

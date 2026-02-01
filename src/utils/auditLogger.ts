import { collection, addDoc, query, where, orderBy, getDocs, limit as limitFn } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

export interface AuditLogEntry {
  id: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  timestamp: string
  userAgent?: string
  ipAddress?: string
  details?: Record<string, unknown>
  success: boolean
  errorMessage?: string
}

export interface AuditLogOptions {
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, unknown>
  success?: boolean
  errorMessage?: string
}

class AuditLogger {
  private static instance: AuditLogger

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  // Log an audit event
  async log(options: AuditLogOptions): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      console.warn('Cannot log audit event: No authenticated user')
      return
    }

    try {
      const auditEntry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'userId'> = {
        action: options.action,
        resource: options.resource,
        resourceId: options.resourceId,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        ipAddress: await this.getClientIP(),
        details: options.details,
        success: options.success ?? true,
        errorMessage: options.errorMessage
      }

      // Add to audit log collection
      const auditRef = collection(db, 'auditLogs')
      await addDoc(auditRef, {
        ...auditEntry,
        userId: user.uid,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Failed to log audit event:', error)
      // Don't throw error to avoid breaking the main flow
    }
  }

  // Log authentication events
  async logAuth(action: 'login' | 'logout' | 'register' | 'password_reset', success: boolean, errorMessage?: string): Promise<void> {
    await this.log({
      action: `auth_${action}`,
      resource: 'authentication',
      success,
      errorMessage
    })
  }

  // Log data access events
  async logDataAccess(resource: string, resourceId?: string, details?: Record<string, unknown>): Promise<void> {
    await this.log({
      action: 'data_access',
      resource,
      resourceId,
      details
    })
  }

  // Log data modification events
  async logDataModification(action: 'create' | 'update' | 'delete', resource: string, resourceId?: string, details?: Record<string, unknown>): Promise<void> {
    await this.log({
      action: `data_${action}`,
      resource,
      resourceId,
      details
    })
  }

  // Log user profile changes
  async logProfileChange(changes: Record<string, unknown>): Promise<void> {
    await this.log({
      action: 'profile_update',
      resource: 'user_profile',
      details: { changes }
    })
  }

  // Log security events
  async logSecurityEvent(event: string, details?: Record<string, unknown>, success: boolean = true): Promise<void> {
    await this.log({
      action: `security_${event}`,
      resource: 'security',
      details,
      success
    })
  }

  // Log migration events
  async logMigration(action: 'start' | 'complete' | 'error', details?: Record<string, unknown>): Promise<void> {
    await this.log({
      action: `migration_${action}`,
      resource: 'data_migration',
      details
    })
  }

  // Get client IP address (simplified - in production, use a proper IP detection service)
  private async getClientIP(): Promise<string | undefined> {
    try {
      // This is a simplified approach. In production, you might want to use a proper IP detection service
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return undefined
    }
  }

  // Get recent audit logs for a user (admin function)
  async getUserAuditLogs(userId: string, limit = 100): Promise<AuditLogEntry[]> {
    try {
      const auditQuery = query(
        collection(db, 'auditLogs'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limitFn(limit)
      )

      const snapshot = await getDocs(auditQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLogEntry[]
    } catch (error) {
      console.error('Failed to get audit logs:', error)
      return []
    }
  }

  // Get security events (admin function)
  async getSecurityEvents(limit = 100): Promise<AuditLogEntry[]> {
    try {
      const auditQuery = query(
        collection(db, 'auditLogs'),
        where('resource', '==', 'security'),
        orderBy('timestamp', 'desc'),
        limitFn(limit)
      )

      const snapshot = await getDocs(auditQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLogEntry[]
    } catch (error) {
      console.error('Failed to get security events:', error)
      return []
    }
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance()

// Export convenience functions
export const logAuth = (action: 'login' | 'logout' | 'register' | 'password_reset', success: boolean, errorMessage?: string) => {
  return auditLogger.logAuth(action, success, errorMessage)
}

export const logDataAccess = (resource: string, resourceId?: string, details?: Record<string, unknown>) => {
  return auditLogger.logDataAccess(resource, resourceId, details)
}

export const logDataModification = (action: 'create' | 'update' | 'delete', resource: string, resourceId?: string, details?: Record<string, unknown>) => {
  return auditLogger.logDataModification(action, resource, resourceId, details)
}

export const logProfileChange = (changes: Record<string, unknown>) => {
  return auditLogger.logProfileChange(changes)
}

export const logSecurityEvent = (event: string, details?: Record<string, unknown>, success?: boolean) => {
  return auditLogger.logSecurityEvent(event, details, success)
}

export const logMigration = (action: 'start' | 'complete' | 'error', details?: Record<string, unknown>) => {
  return auditLogger.logMigration(action, details)
}

export default auditLogger

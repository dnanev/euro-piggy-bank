interface RateLimitEntry {
  attempts: number
  firstAttempt: number
  lastAttempt: number
  blockedUntil?: number
}

class RateLimiter {
  private static instance: RateLimiter
  private attempts: Map<string, RateLimitEntry> = new Map()
  
  // Rate limiting configuration
  private readonly MAX_ATTEMPTS = 5
  private readonly BLOCK_DURATION = 15 * 60 * 1000 // 15 minutes
  private readonly WINDOW_DURATION = 60 * 60 * 1000 // 1 hour
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 minutes

  private constructor() {
    // Clean up old entries periodically
    setInterval(() => {
      this.cleanup()
    }, this.CLEANUP_INTERVAL)
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  // Check if an action is allowed
  isAllowed(identifier: string): { allowed: boolean; remainingAttempts?: number; retryAfter?: number } {
    const now = Date.now()
    const entry = this.attempts.get(identifier)

    if (!entry) {
      return { allowed: true, remainingAttempts: this.MAX_ATTEMPTS - 1 }
    }

    // Check if currently blocked
    if (entry.blockedUntil && entry.blockedUntil > now) {
      return { 
        allowed: false, 
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000)
      }
    }

    // Check if attempts window has expired
    if (now - entry.firstAttempt > this.WINDOW_DURATION) {
      this.attempts.delete(identifier)
      return { allowed: true, remainingAttempts: this.MAX_ATTEMPTS - 1 }
    }

    // Check if max attempts reached
    if (entry.attempts >= this.MAX_ATTEMPTS) {
      // Block the user
      entry.blockedUntil = now + this.BLOCK_DURATION
      this.attempts.set(identifier, entry)
      return { 
        allowed: false, 
        retryAfter: this.BLOCK_DURATION / 1000
      }
    }

    return { 
      allowed: true, 
      remainingAttempts: this.MAX_ATTEMPTS - entry.attempts
    }
  }

  // Record an attempt
  recordAttempt(identifier: string): void {
    const now = Date.now()
    const entry = this.attempts.get(identifier)

    if (!entry) {
      this.attempts.set(identifier, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      })
    } else {
      entry.attempts += 1
      entry.lastAttempt = now
      
      // Block if max attempts reached
      if (entry.attempts >= this.MAX_ATTEMPTS) {
        entry.blockedUntil = now + this.BLOCK_DURATION
      }
      
      this.attempts.set(identifier, entry)
    }
  }

  // Reset attempts for an identifier
  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }

  // Get current status
  getStatus(identifier: string): {
    attempts: number
    remainingAttempts: number
    blocked: boolean
    retryAfter?: number
  } {
    const now = Date.now()
    const entry = this.attempts.get(identifier)

    if (!entry) {
      return {
        attempts: 0,
        remainingAttempts: this.MAX_ATTEMPTS,
        blocked: false
      }
    }

    const blocked = entry.blockedUntil ? entry.blockedUntil > now : false
    const retryAfter = blocked ? Math.ceil((entry.blockedUntil! - now) / 1000) : undefined

    return {
      attempts: entry.attempts,
      remainingAttempts: Math.max(0, this.MAX_ATTEMPTS - entry.attempts),
      blocked,
      retryAfter
    }
  }

  // Clean up old entries
  private cleanup(): void {
    const now = Date.now()
    for (const [identifier, entry] of this.attempts.entries()) {
      // Remove entries that are older than the window and not blocked
      if (now - entry.firstAttempt > this.WINDOW_DURATION && 
          (!entry.blockedUntil || entry.blockedUntil <= now)) {
        this.attempts.delete(identifier)
      }
    }
  }

  // Get all current entries (for debugging/admin)
  getAllEntries(): Array<{ identifier: string; status: ReturnType<RateLimiter['getStatus']> }> {
    const entries: Array<{ identifier: string; status: ReturnType<RateLimiter['getStatus']> }> = []
    
    for (const [identifier] of this.attempts.keys()) {
      entries.push({
        identifier,
        status: this.getStatus(identifier)
      })
    }
    
    return entries
  }
}

// Specific rate limiters for different actions
export const authRateLimiter = RateLimiter.getInstance()
export const passwordResetRateLimiter = RateLimiter.getInstance()
export const dataExportRateLimiter = RateLimiter.getInstance()

// Convenience functions
export const checkAuthRateLimit = (email: string) => {
  return authRateLimiter.isAllowed(email)
}

export const recordAuthAttempt = (email: string) => {
  authRateLimiter.recordAttempt(email)
}

export const checkPasswordResetRateLimit = (email: string) => {
  return passwordResetRateLimiter.isAllowed(email)
}

export const recordPasswordResetAttempt = (email: string) => {
  passwordResetRateLimiter.recordAttempt(email)
}

export const checkDataExportRateLimit = (userId: string) => {
  return dataExportRateLimiter.isAllowed(userId)
}

export const recordDataExportAttempt = (userId: string) => {
  dataExportRateLimiter.recordAttempt(userId)
}

export const resetRateLimit = (identifier: string) => {
  authRateLimiter.reset(identifier)
  passwordResetRateLimiter.reset(identifier)
  dataExportRateLimiter.reset(identifier)
}

export default RateLimiter

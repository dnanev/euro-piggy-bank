import CryptoJS from 'crypto-js'

// Simple encryption utilities for sensitive data
// Note: In production, use more robust encryption methods

export interface EncryptionResult {
  encrypted: string
  iv: string
  salt: string
}

export interface DecryptionResult {
  decrypted: unknown
  success: boolean
  error?: string
}

// Generate a random salt
export const generateSalt = (): string => {
  return CryptoJS.lib.WordArray.random(128/8).toString()
}

// Encrypt data with AES
export const encryptData = (data: unknown, secretKey: string): EncryptionResult => {
  try {
    const salt = generateSalt()
    const key = CryptoJS.PBKDF2(secretKey, salt, {
      keySize: 256/32,
      iterations: 10000
    })

    const iv = CryptoJS.lib.WordArray.random(128/8)
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    return {
      encrypted: encrypted.toString(),
      iv: iv.toString(),
      salt: salt
    }
  } catch {
    throw new Error('Encryption failed')
  }
}

// Decrypt data with AES
export const decryptData = (
  encryptedData: string,
  iv: string,
  salt: string,
  secretKey: string
): DecryptionResult => {
  try {
    const key = CryptoJS.PBKDF2(secretKey, salt, {
      keySize: 256/32,
      iterations: 10000
    })

    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)
    const decryptedData = JSON.parse(decryptedString)

    return {
      decrypted: decryptedData,
      success: true
    }
  } catch {
    return {
      decrypted: null,
      success: false,
      error: 'Decryption failed'
    }
  }
}

// Hash sensitive data for storage
export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString()
}

// Verify data integrity
export const verifyDataIntegrity = (
  data: unknown,
  originalHash: string
): boolean => {
  const currentHash = hashData(JSON.stringify(data))
  return currentHash === originalHash
}

// Encrypt user email for storage
export const encryptEmail = (email: string): string => {
  // Simple obfuscation for email (not true encryption)
  const encoded = btoa(email)
  return encoded.split('').reverse().join('')
}

// Decrypt user email
export const decryptEmail = (encryptedEmail: string): string => {
  try {
    const reversed = encryptedEmail.split('').reverse().join('')
    return atob(reversed)
  } catch {
    return ''
  }
}

// Sanitize and validate user input
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove potential JS injection
    .substring(0, 1000) // Limit length
}

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export const validatePassword = (password: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Generate secure random token
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default {
  encryptData,
  decryptData,
  hashData,
  verifyDataIntegrity,
  encryptEmail,
  decryptEmail,
  sanitizeInput,
  validateEmail,
  validatePassword,
  generateSecureToken,
  generateSalt
}

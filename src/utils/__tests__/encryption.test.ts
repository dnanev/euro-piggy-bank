import { describe, it, expect } from 'vitest'
import {
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
} from '../encryption'

describe('Encryption Utilities', () => {
  const testSecretKey = 'test-secret-key-123'

  describe('Data Encryption/Decryption', () => {
    it('should encrypt and decrypt data correctly', () => {
      const testData = {
        message: 'Hello World',
        number: 42,
        array: [1, 2, 3]
      }

      const encrypted = encryptData(testData, testSecretKey)
      expect(encrypted.encrypted).toBeDefined()
      expect(encrypted.iv).toBeDefined()
      expect(encrypted.salt).toBeDefined()

      const decrypted = decryptData(encrypted.encrypted, encrypted.iv, encrypted.salt, testSecretKey)
      expect(decrypted.success).toBe(true)
      expect(decrypted.decrypted).toEqual(testData)
    })

    it('should fail to decrypt with wrong key', () => {
      const testData = { message: 'Hello World' }
      const encrypted = encryptData(testData, testSecretKey)

      const decrypted = decryptData(encrypted.encrypted, encrypted.iv, encrypted.salt, 'wrong-key')
      expect(decrypted.success).toBe(false)
      expect(decrypted.error).toBe('Decryption failed')
    })

    it('should generate unique salts', () => {
      const salt1 = generateSalt()
      const salt2 = generateSalt()

      expect(salt1).toBeDefined()
      expect(salt2).toBeDefined()
      expect(salt1).not.toBe(salt2)
    })
  })

  describe('Data Hashing', () => {
    it('should generate consistent hashes for same data', () => {
      const data = 'test data'
      const hash1 = hashData(data)
      const hash2 = hashData(data)

      expect(hash1).toBe(hash2)
    })

    it('should generate different hashes for different data', () => {
      const hash1 = hashData('data1')
      const hash2 = hashData('data2')

      expect(hash1).not.toBe(hash2)
    })

    it('should verify data integrity correctly', () => {
      const data = { test: 'value' }
      const hash = hashData(JSON.stringify(data))

      expect(verifyDataIntegrity(data, hash)).toBe(true)
      expect(verifyDataIntegrity({ test: 'different' }, hash)).toBe(false)
    })
  })

  describe('Email Encryption', () => {
    it('should encrypt and decrypt email correctly', () => {
      const email = 'test@example.com'
      const encrypted = encryptEmail(email)
      const decrypted = decryptEmail(encrypted)

      expect(decrypted).toBe(email)
    })

    it('should handle empty email', () => {
      const email = ''
      const encrypted = encryptEmail(email)
      const decrypted = decryptEmail(encrypted)

      expect(decrypted).toBe('')
    })
  })

  describe('Input Sanitization', () => {
    it('should sanitize HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello'
      const sanitized = sanitizeInput(input)

      expect(sanitized).toBe('alert("xss")Hello')
    })

    it('should remove JavaScript protocols', () => {
      const input = 'javascript:alert("xss")Hello'
      const sanitized = sanitizeInput(input)

      expect(sanitized).toBe('alert("xss")Hello')
    })

    it('should trim whitespace', () => {
      const input = '  test  '
      const sanitized = sanitizeInput(input)

      expect(sanitized).toBe('test')
    })

    it('should limit length', () => {
      const longInput = 'a'.repeat(2000)
      const sanitized = sanitizeInput(longInput)

      expect(sanitized.length).toBeLessThanOrEqual(1000)
    })
  })

  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
    })
  })

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject weak passwords', () => {
      const result = validatePassword('weak')
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors).toContain('Password must be at least 6 characters long')
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
      expect(result.errors).toContain('Password must contain at least one number')
    })
  })

  describe('Token Generation', () => {
    it('should generate tokens of specified length', () => {
      const token = generateSecureToken(16)
      expect(token).toHaveLength(16)
      expect(token).toMatch(/^[A-Za-z0-9]+$/)
    })

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken()
      const token2 = generateSecureToken()

      expect(token1).not.toBe(token2)
    })

    it('should generate default length tokens', () => {
      const token = generateSecureToken()
      expect(token).toHaveLength(32)
    })
  })
})

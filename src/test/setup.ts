import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = vi.fn(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: vi.fn(),
}))

// Mock window methods
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:5173',
    assign: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
})

// Global vi mock
vi.stubGlobal('localStorage', localStorageMock)

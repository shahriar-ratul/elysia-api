import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { db } from '../src/utils/db'

// Set test environment - DATABASE_URL loaded from .env by Bun
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key'
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'
process.env.LOG_LEVEL = 'error'

// Global test hooks
beforeAll(async () => {
  // Setup test database connection
  console.log('🧪 Starting test suite...')
})

afterAll(async () => {
  // Cleanup and disconnect
  console.log('✅ Test suite completed')
})

beforeEach(async () => {
  // Clear test data before each test
})

afterEach(async () => {
  // Cleanup after each test
})

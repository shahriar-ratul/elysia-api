import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { ApiClient } from '../helpers/api-client'
import { TestDB } from '../helpers/test-db'

describe('User Authentication E2E', () => {
  let client: ApiClient

  beforeAll(() => {
    client = new ApiClient()
  })

  beforeEach(async () => {
    await TestDB.cleanup()
  })

  afterAll(async () => {
    await TestDB.cleanup()
  })

  describe('POST /api/v1/auth/sign-up', () => {
    it('should register new user successfully', async () => {
      // Act
      const response = await client.userSignUp({
        email: 'newuser@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      })

      // Assert
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('id')
      expect(response.data.email).toBe('newuser@test.com')
      expect(response.data.firstName).toBe('John')
      expect(response.data.lastName).toBe('Doe')
    })

    it('should return 400 for duplicate email', async () => {
      // Arrange
      await TestDB.createTestUser({ email: 'existing@test.com' })

      // Act
      const response = await client.userSignUp({
        email: 'existing@test.com',
        password: 'password123'
      })

      // Assert
      expect(response.status).not.toBe(200)
      expect(response.data).toHaveProperty('error')
    })

    it('should require valid email format', async () => {
      // Act
      const response = await client.userSignUp({
        email: 'invalid-email',
        password: 'password123'
      })

      // Assert
      expect(response.status).not.toBe(200)
    })

    it('should require minimum password length', async () => {
      // Act
      const response = await client.userSignUp({
        email: 'user@test.com',
        password: '123' // Too short
      })

      // Assert
      expect(response.status).not.toBe(200)
    })
  })

  describe('POST /api/v1/auth/sign-in', () => {
    it('should sign in user with valid credentials', async () => {
      // Arrange
      await TestDB.createTestUser({
        email: 'user@test.com',
        password: 'password123'
      })

      // Act
      const response = await client.userSignIn({
        email: 'user@test.com',
        password: 'password123'
      })

      // Assert
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('user')
      expect(response.data).toHaveProperty('token')
      expect(response.data).toHaveProperty('refreshToken')
      expect(response.data).toHaveProperty('expiresAt')
      expect(response.data.user.email).toBe('user@test.com')
    })

    it('should return error for invalid email', async () => {
      // Act
      const response = await client.userSignIn({
        email: 'nonexistent@test.com',
        password: 'password123'
      })

      // Assert
      expect(response.status).not.toBe(200)
      expect(response.data).toHaveProperty('error')
    })

    it('should return error for wrong password', async () => {
      // Arrange
      await TestDB.createTestUser({
        email: 'user@test.com',
        password: 'password123'
      })

      // Act
      const response = await client.userSignIn({
        email: 'user@test.com',
        password: 'wrongpassword'
      })

      // Assert
      expect(response.status).not.toBe(200)
      expect(response.data).toHaveProperty('error')
    })
  })

  describe('GET /api/v1/auth/me', () => {
    it('should return user profile when authenticated', async () => {
      // Arrange
      const user = await TestDB.createTestUser({
        email: 'user@test.com',
        password: 'password123'
      })
      
      const signInResponse = await client.userSignIn({
        email: 'user@test.com',
        password: 'password123'
      })
      
      client.setToken(signInResponse.data.token)

      // Act
      const response = await client.getUserProfile()

      // Assert
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('id')
      expect(response.data.email).toBe('user@test.com')
    })

    it('should return 401 without token', async () => {
      // Arrange
      client.clearToken()

      // Act
      const response = await client.getUserProfile()

      // Assert
      expect(response.status).toBe(401)
    })

    it('should return 401 with invalid token', async () => {
      // Arrange
      client.setToken('invalid-token')

      // Act
      const response = await client.getUserProfile()

      // Assert
      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/v1/auth/sign-out', () => {
    it('should sign out user successfully', async () => {
      // Arrange
      await TestDB.createTestUser({
        email: 'user@test.com',
        password: 'password123'
      })
      
      const signInResponse = await client.userSignIn({
        email: 'user@test.com',
        password: 'password123'
      })
      
      client.setToken(signInResponse.data.token)

      // Act
      const response = await client.userSignOut()

      // Assert
      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
    })

    it('should invalidate token after sign out', async () => {
      // Arrange
      await TestDB.createTestUser({
        email: 'user@test.com',
        password: 'password123'
      })
      
      const signInResponse = await client.userSignIn({
        email: 'user@test.com',
        password: 'password123'
      })
      
      client.setToken(signInResponse.data.token)
      await client.userSignOut()

      // Act - Try to use the same token
      const response = await client.getUserProfile()

      // Assert
      expect(response.status).not.toBe(200)
    })
  })
})

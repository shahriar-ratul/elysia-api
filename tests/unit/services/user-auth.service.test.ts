import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { UserAuthService } from '../../../src/modules/user-auth/service'
import { TestDB } from '../../helpers/test-db'
import { db } from '../../../src/utils/db'

describe('UserAuthService', () => {
  beforeEach(async () => {
    await TestDB.cleanup()
  })

  afterEach(async () => {
    await TestDB.cleanup()
  })

  describe('signUp', () => {
    it('should create new user', async () => {
      // Act
      const result = await UserAuthService.signUp({
        email: 'user@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })

      // Assert
      expect(result).toHaveProperty('id')
      expect(result.email).toBe('user@test.com')
      expect(result.firstName).toBe('Test')
      expect(result.lastName).toBe('User')
    })

    it('should throw error for duplicate email', async () => {
      // Arrange
      await TestDB.createTestUser({
        email: 'user@test.com'
      })

      // Act & Assert
      await expect(
        UserAuthService.signUp({
          email: 'user@test.com',
          password: 'password123'
        })
      ).rejects.toThrow('Email already in use')
    })

    it('should hash password', async () => {
      // Act
      const result = await UserAuthService.signUp({
        email: 'user@test.com',
        password: 'password123'
      })

      // Assert
      const user = await db.user.findUnique({
        where: { id: BigInt(result.id) }
      })
      expect(user?.password).not.toBe('password123')
      expect(user?.password).toMatch(/^\$2[ayb]\$.{56}$/)
    })
  })

  describe('signIn', () => {
    it('should sign in user with valid credentials', async () => {
      // Arrange
      await TestDB.createTestUser({
        email: 'user@test.com',
        password: 'password123'
      })

      // Act
      const result = await UserAuthService.signIn({
        email: 'user@test.com',
        password: 'password123'
      })

      // Assert
      expect(result).toHaveProperty('user')
      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('refreshToken')
      expect(result).toHaveProperty('expiresAt')
      expect(result.user.email).toBe('user@test.com')
    })

    it('should throw error for invalid credentials', async () => {
      // Act & Assert
      await expect(
        UserAuthService.signIn({
          email: 'nonexistent@test.com',
          password: 'password123'
        })
      ).rejects.toThrow('Invalid credentials')
    })

    it('should throw error for inactive user', async () => {
      // Arrange
      const user = await TestDB.createTestUser({
        email: 'user@test.com',
        password: 'password123'
      })
      
      await db.user.update({
        where: { id: user.id },
        data: { isActive: false }
      })

      // Act & Assert
      await expect(
        UserAuthService.signIn({
          email: 'user@test.com',
          password: 'password123'
        })
      ).rejects.toThrow('Account is not active')
    })
  })

  describe('getProfile', () => {
    it('should return user profile', async () => {
      // Arrange
      const user = await TestDB.createTestUser({
        email: 'user@test.com'
      })

      // Act
      const profile = await UserAuthService.getProfile(user.id)

      // Assert
      expect(profile).toHaveProperty('id')
      expect(profile).toHaveProperty('email')
      expect(profile.email).toBe('user@test.com')
    })

    it('should throw error for non-existent user', async () => {
      // Act & Assert
      await expect(
        UserAuthService.getProfile(BigInt(99999))
      ).rejects.toThrow('User not found')
    })
  })
})

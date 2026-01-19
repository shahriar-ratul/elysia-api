import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { ApiClient } from '../helpers/api-client'
import { TestDB } from '../helpers/test-db'

describe('Admin Authentication E2E', () => {
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

  describe('POST /api/v1/admin/auth/sign-in', () => {
    it('should sign in admin with valid credentials', async () => {
      // Arrange
      await TestDB.createTestAdmin({
        email: 'admin@test.com',
        password: 'admin123'
      })

      // Act
      const response = await client.adminSignIn({
        email: 'admin@test.com',
        password: 'admin123'
      })

      // Assert
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('admin')
      expect(response.data).toHaveProperty('token')
      expect(response.data).toHaveProperty('refreshToken')
      expect(response.data.admin.email).toBe('admin@test.com')
      expect(response.data.admin).toHaveProperty('roles')
    })

    it('should return error for invalid credentials', async () => {
      // Act
      const response = await client.adminSignIn({
        email: 'nonexistent@test.com',
        password: 'password123'
      })

      // Assert
      expect(response.status).not.toBe(200)
      expect(response.data).toHaveProperty('error')
    })

    it('should return roles in response', async () => {
      // Arrange
      await TestDB.createSuperAdmin({
        email: 'superadmin@test.com',
        password: 'admin123'
      })

      // Act
      const response = await client.adminSignIn({
        email: 'superadmin@test.com',
        password: 'admin123'
      })

      // Assert
      expect(response.status).toBe(200)
      expect(response.data.admin.roles).toBeInstanceOf(Array)
      expect(response.data.admin.roles.length).toBeGreaterThan(0)
    })
  })

  describe('GET /api/v1/admin/auth/me', () => {
    it('should return admin profile with permissions', async () => {
      // Arrange
      const admin = await TestDB.createSuperAdmin({
        email: 'admin@test.com',
        password: 'admin123'
      })
      
      const signInResponse = await client.adminSignIn({
        email: 'admin@test.com',
        password: 'admin123'
      })
      
      client.setToken(signInResponse.data.token)

      // Act
      const response = await client.getAdminProfile()

      // Assert
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('id')
      expect(response.data).toHaveProperty('email')
      expect(response.data).toHaveProperty('roles')
      expect(response.data).toHaveProperty('permissions')
    })

    it('should require authentication', async () => {
      // Arrange
      client.clearToken()

      // Act
      const response = await client.getAdminProfile()

      // Assert
      expect(response.status).not.toBe(200)
    })
  })

  describe('POST /api/v1/admin/auth/sign-out', () => {
    it('should sign out admin successfully', async () => {
      // Arrange
      await TestDB.createTestAdmin({
        email: 'admin@test.com',
        password: 'admin123'
      })
      
      const signInResponse = await client.adminSignIn({
        email: 'admin@test.com',
        password: 'admin123'
      })
      
      client.setToken(signInResponse.data.token)

      // Act
      const response = await client.adminSignOut()

      // Assert
      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
    })

    it('should invalidate token after sign out', async () => {
      // Arrange
      await TestDB.createTestAdmin({
        email: 'admin@test.com',
        password: 'admin123'
      })
      
      const signInResponse = await client.adminSignIn({
        email: 'admin@test.com',
        password: 'admin123'
      })
      
      const token = signInResponse.data.token
      client.setToken(token)
      await client.adminSignOut()

      // Act - Try to use the same token
      const response = await client.getAdminProfile()

      // Assert
      expect(response.status).not.toBe(200)
    })
  })
})

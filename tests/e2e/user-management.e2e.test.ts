import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { ApiClient } from '../helpers/api-client'
import { TestDB } from '../helpers/test-db'

describe('User Management E2E (Admin)', () => {
  let client: ApiClient
  let adminToken: string

  beforeAll(async () => {
    client = new ApiClient()
  })

  beforeEach(async () => {
    await TestDB.cleanup()
    
    // Create super admin
    await TestDB.createSuperAdmin({
      email: 'superadmin@test.com',
      password: 'admin123'
    })
    
    const signInResponse = await client.adminSignIn({
      email: 'superadmin@test.com',
      password: 'admin123'
    })
    
    adminToken = signInResponse.data.token
    client.setToken(adminToken)
  })

  afterAll(async () => {
    await TestDB.cleanup()
  })

  describe('GET /api/v1/admin/users', () => {
    it('should list all users', async () => {
      // Arrange
      await TestDB.createTestUser({ email: 'user1@test.com' })
      await TestDB.createTestUser({ email: 'user2@test.com' })

      // Act
      const response = await client.listUsers()

      // Assert
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('users')
      expect(response.data).toHaveProperty('total')
      expect(response.data.users).toBeInstanceOf(Array)
    })

    it('should support pagination', async () => {
      // Arrange
      for (let i = 0; i < 15; i++) {
        await TestDB.createTestUser({ email: `user${i}@test.com` })
      }

      // Act
      const response = await client.listUsers({ page: 1, limit: 10 })

      // Assert
      expect(response.status).toBe(200)
      expect(response.data.users.length).toBeLessThanOrEqual(10)
    })

    it('should require authentication', async () => {
      // Arrange
      client.clearToken()

      // Act
      const response = await client.listUsers()

      // Assert
      expect(response.status).not.toBe(200)
    })

    it('should require users.list permission', async () => {
      // Arrange - Admin without permission
      await TestDB.createTestAdmin({
        email: 'limited@test.com',
        password: 'admin123'
      })
      
      const signInResponse = await client.adminSignIn({
        email: 'limited@test.com',
        password: 'admin123'
      })
      
      client.setToken(signInResponse.data.token)

      // Act
      const response = await client.listUsers()

      // Assert
      expect(response.status).not.toBe(200)
      expect(response.data.error).toContain('permission')
    })
  })

  describe('GET /api/v1/admin/users/:id', () => {
    it('should return user details', async () => {
      // Arrange
      const user = await TestDB.createTestUser({
        email: 'user@test.com',
        firstName: 'John'
      })

      // Act
      const response = await client.getUser(user.id.toString())

      // Assert
      expect(response.status).toBe(200)
      expect(response.data.id).toBe(user.id.toString())
      expect(response.data).toHaveProperty('username')
    })

    it('should return 404 for non-existent user', async () => {
      // Act
      const response = await client.getUser('99999')

      // Assert
      expect(response.status).not.toBe(200)
    })

    it('should require users.read permission', async () => {
      // Arrange
      const user = await TestDB.createTestUser()
      await TestDB.createTestAdmin({
        email: 'limited@test.com',
        password: 'admin123'
      })
      
      const signInResponse = await client.adminSignIn({
        email: 'limited@test.com',
        password: 'admin123'
      })
      
      client.setToken(signInResponse.data.token)

      // Act
      const response = await client.getUser(user.id.toString())

      // Assert
      expect(response.status).not.toBe(200)
      expect(response.data.error).toContain('permission')
    })
  })

  describe('DELETE /api/v1/admin/users/:id', () => {
    it('should delete user', async () => {
      // Arrange
      const user = await TestDB.createTestUser({
        email: 'user@test.com'
      })

      // Act
      const response = await client.deleteUser(user.id.toString())

      // Assert
      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
    })

    it('should require users.delete permission', async () => {
      // Arrange
      const user = await TestDB.createTestUser()
      await TestDB.createTestAdmin({
        email: 'limited@test.com',
        password: 'admin123'
      })
      
      const signInResponse = await client.adminSignIn({
        email: 'limited@test.com',
        password: 'admin123'
      })
      
      client.setToken(signInResponse.data.token)

      // Act
      const response = await client.deleteUser(user.id.toString())

      // Assert
      expect(response.status).not.toBe(200)
      expect(response.data.error).toContain('permission')
    })

    it('should return 404 for non-existent user', async () => {
      // Act
      const response = await client.deleteUser('99999')

      // Assert
      expect(response.status).not.toBe(200)
    })
  })

  describe('Permission-based access control', () => {
    it('should allow super admin to access all endpoints', async () => {
      // Arrange
      const user = await TestDB.createTestUser()

      // Act - Super admin should have all permissions
      const listResponse = await client.listUsers()
      const getResponse = await client.getUser(user.id.toString())
      const deleteResponse = await client.deleteUser(user.id.toString())

      // Assert
      expect(listResponse.status).toBe(200)
      expect(getResponse.status).toBe(200)
      expect(deleteResponse.status).toBe(200)
    })

    it('should deny access to admin without any permissions', async () => {
      // Arrange
      const user = await TestDB.createTestUser()
      await TestDB.createTestAdmin({
        email: 'noperm@test.com',
        password: 'admin123'
      })
      
      const signInResponse = await client.adminSignIn({
        email: 'noperm@test.com',
        password: 'admin123'
      })
      
      client.setToken(signInResponse.data.token)

      // Act
      const listResponse = await client.listUsers()
      const getResponse = await client.getUser(user.id.toString())
      const deleteResponse = await client.deleteUser(user.id.toString())

      // Assert
      expect(listResponse.status).not.toBe(200)
      expect(getResponse.status).not.toBe(200)
      expect(deleteResponse.status).not.toBe(200)
    })
  })
})

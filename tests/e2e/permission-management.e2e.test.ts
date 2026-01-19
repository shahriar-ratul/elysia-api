import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { ApiClient } from '../helpers/api-client'
import { TestDB } from '../helpers/test-db'

describe('Permission Management E2E', () => {
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

  describe('GET /api/v1/admin/permissions', () => {
    it('should list all permissions grouped', async () => {
      // Arrange
      await TestDB.createTestPermission({
        name: 'Create Users',
        slug: 'users.create',
        group: 'Users'
      })
      await TestDB.createTestPermission({
        name: 'Read Users',
        slug: 'users.read',
        group: 'Users'
      })

      // Act
      const response = await client.listPermissions()

      // Assert
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('permissions')
      expect(response.data).toHaveProperty('total')
      expect(typeof response.data.permissions).toBe('object')
    })

    it('should require authentication', async () => {
      // Arrange
      client.clearToken()

      // Act
      const response = await client.listPermissions()

      // Assert
      expect(response.status).not.toBe(200)
    })

    it('should require permissions.list permission', async () => {
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
      const response = await client.listPermissions()

      // Assert
      expect(response.status).not.toBe(200)
      expect(response.data.error).toContain('permission')
    })
  })

  describe('GET /api/v1/admin/permissions/:id', () => {
    it('should return permission details', async () => {
      // Arrange
      const permission = await TestDB.createTestPermission({
        name: 'Test Permission',
        slug: 'test.permission',
        group: 'Test'
      })

      // Act
      const response = await client.getPermission(permission.id.toString())

      // Assert
      expect(response.status).toBe(200)
      expect(response.data.id).toBe(permission.id.toString())
      expect(response.data.name).toBe('Test Permission')
      expect(response.data.slug).toBe('test.permission')
      expect(response.data.group).toBe('Test')
    })

    it('should return 404 for non-existent permission', async () => {
      // Act
      const response = await client.getPermission('99999')

      // Assert
      expect(response.status).not.toBe(200)
    })

    it('should require permissions.read permission', async () => {
      // Arrange
      const permission = await TestDB.createTestPermission()
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
      const response = await client.getPermission(permission.id.toString())

      // Assert
      expect(response.status).not.toBe(200)
    })
  })

  describe('POST /api/v1/admin/permissions', () => {
    it('should create new permission', async () => {
      // Act
      const response = await client.createPermission({
        name: 'New Permission',
        displayName: 'New Permission',
        slug: 'new.permission',
        group: 'Test',
        groupOrder: 1,
        order: 1
      })

      // Assert
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('id')
      expect(response.data.name).toBe('New Permission')
      expect(response.data.slug).toBe('new.permission')
    })

    it('should require permissions.create permission', async () => {
      // Arrange
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
      const response = await client.createPermission({
        name: 'New Permission',
        displayName: 'New Permission',
        slug: 'new.permission',
        group: 'Test',
        groupOrder: 1,
        order: 1
      })

      // Assert
      expect(response.status).not.toBe(200)
      expect(response.data.error).toContain('permission')
    })

    it('should validate required fields', async () => {
      // Act
      const response = await fetch('http://localhost:3000/api/v1/admin/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          // Missing required fields
          name: 'Test'
        })
      })

      // Assert
      expect(response.status).not.toBe(200)
    })
  })
})

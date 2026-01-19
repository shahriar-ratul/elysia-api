import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { ApiClient } from '../helpers/api-client'
import { TestDB } from '../helpers/test-db'

describe('Role Management E2E', () => {
  let client: ApiClient
  let adminToken: string

  beforeAll(async () => {
    client = new ApiClient()
  })

  beforeEach(async () => {
    await TestDB.cleanup()
    
    // Create super admin and sign in
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

  describe('GET /api/v1/admin/roles', () => {
    it('should list all roles', async () => {
      // Arrange
      await TestDB.createTestRole({ name: 'moderator' })
      await TestDB.createTestRole({ name: 'editor' })

      // Act
      const response = await client.listRoles()

      // Assert
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('roles')
      expect(response.data).toHaveProperty('total')
      expect(response.data.roles).toBeInstanceOf(Array)
    })

    it('should require authentication', async () => {
      // Arrange
      client.clearToken()

      // Act
      const response = await client.listRoles()

      // Assert
      expect(response.status).not.toBe(200)
    })

    it('should require roles.list permission', async () => {
      // Arrange - Create admin without permissions
      const limitedAdmin = await TestDB.createTestAdmin({
        email: 'limited@test.com',
        password: 'admin123'
      })
      
      const signInResponse = await client.adminSignIn({
        email: 'limited@test.com',
        password: 'admin123'
      })
      
      client.setToken(signInResponse.data.token)

      // Act
      const response = await client.listRoles()

      // Assert
      expect(response.status).not.toBe(200)
      expect(response.data.error).toContain('permission')
    })
  })

  describe('GET /api/v1/admin/roles/:id', () => {
    it('should return role details with permissions', async () => {
      // Arrange
      const permission = await TestDB.createTestPermission()
      const role = await TestDB.createTestRole({
        name: 'moderator',
        permissions: [permission.id]
      })

      // Act
      const response = await client.getRole(role.id.toString())

      // Assert
      expect(response.status).toBe(200)
      expect(response.data.id).toBe(role.id.toString())
      expect(response.data.name).toBe('moderator')
      expect(response.data.permissions).toBeInstanceOf(Array)
      expect(response.data.permissions.length).toBeGreaterThan(0)
    })

    it('should return 404 for non-existent role', async () => {
      // Act
      const response = await client.getRole('99999')

      // Assert
      expect(response.status).not.toBe(200)
    })
  })

  describe('POST /api/v1/admin/roles', () => {
    it('should create new role', async () => {
      // Act
      const response = await client.createRole({
        name: 'new-role',
        displayName: 'New Role',
        slug: 'new-role',
        description: 'A new role'
      })

      // Assert
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('id')
      expect(response.data.name).toBe('new-role')
      expect(response.data.displayName).toBe('New Role')
    })

    it('should require roles.create permission', async () => {
      // Arrange - Create admin without create permission
      const limitedAdmin = await TestDB.createTestAdmin({
        email: 'limited@test.com',
        password: 'admin123'
      })
      
      const signInResponse = await client.adminSignIn({
        email: 'limited@test.com',
        password: 'admin123'
      })
      
      client.setToken(signInResponse.data.token)

      // Act
      const response = await client.createRole({
        name: 'new-role',
        displayName: 'New Role',
        slug: 'new-role'
      })

      // Assert
      expect(response.status).not.toBe(200)
      expect(response.data.error).toContain('permission')
    })

    it('should validate required fields', async () => {
      // Act
      const response = await fetch('http://localhost:3000/api/v1/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          // Missing required fields
        })
      })

      // Assert
      expect(response.status).not.toBe(200)
    })
  })

  describe('PATCH /api/v1/admin/roles/:id', () => {
    it('should update role', async () => {
      // Arrange
      const role = await TestDB.createTestRole({
        displayName: 'Old Name'
      })

      // Act
      const response = await client.updateRole(role.id.toString(), {
        displayName: 'Updated Name',
        description: 'Updated description'
      })

      // Assert
      expect(response.status).toBe(200)
      expect(response.data.displayName).toBe('Updated Name')
      expect(response.data.description).toBe('Updated description')
    })

    it('should require roles.update permission', async () => {
      // Arrange
      const role = await TestDB.createTestRole()
      const limitedAdmin = await TestDB.createTestAdmin({
        email: 'limited@test.com',
        password: 'admin123'
      })
      
      const signInResponse = await client.adminSignIn({
        email: 'limited@test.com',
        password: 'admin123'
      })
      
      client.setToken(signInResponse.data.token)

      // Act
      const response = await client.updateRole(role.id.toString(), {
        displayName: 'New Name'
      })

      // Assert
      expect(response.status).not.toBe(200)
    })
  })

  describe('POST /api/v1/admin/roles/:id/permissions', () => {
    it('should assign permissions to role', async () => {
      // Arrange
      const role = await TestDB.createTestRole()
      const perm1 = await TestDB.createTestPermission()
      const perm2 = await TestDB.createTestPermission()

      // Act
      const response = await client.assignPermissionsToRole(
        role.id.toString(),
        [perm1.id.toString(), perm2.id.toString()]
      )

      // Assert
      expect(response.status).toBe(200)
      expect(response.data.permissions).toHaveLength(2)
    })

    it('should replace existing permissions', async () => {
      // Arrange
      const perm1 = await TestDB.createTestPermission()
      const perm2 = await TestDB.createTestPermission()
      const role = await TestDB.createTestRole({
        permissions: [perm1.id]
      })

      // Act
      const response = await client.assignPermissionsToRole(
        role.id.toString(),
        [perm2.id.toString()]
      )

      // Assert
      expect(response.status).toBe(200)
      expect(response.data.permissions).toHaveLength(1)
      expect(response.data.permissions[0].id).toBe(perm2.id.toString())
    })
  })

  describe('DELETE /api/v1/admin/roles/:id', () => {
    it('should delete role', async () => {
      // Arrange
      const role = await TestDB.createTestRole()

      // Act
      const response = await client.deleteRole(role.id.toString())

      // Assert
      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
    })

    it('should require roles.delete permission', async () => {
      // Arrange
      const role = await TestDB.createTestRole()
      const limitedAdmin = await TestDB.createTestAdmin({
        email: 'limited@test.com',
        password: 'admin123'
      })
      
      const signInResponse = await client.adminSignIn({
        email: 'limited@test.com',
        password: 'admin123'
      })
      
      client.setToken(signInResponse.data.token)

      // Act
      const response = await client.deleteRole(role.id.toString())

      // Assert
      expect(response.status).not.toBe(200)
    })
  })
})

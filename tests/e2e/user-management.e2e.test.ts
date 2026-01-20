import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { request, TestDB } from '../helpers'

describe('User Management E2E (Admin)', () => {
  let adminToken: string

  beforeEach(async () => {
    await TestDB.cleanup()

    // Create super admin
    await TestDB.createSuperAdmin({
      email: 'superadmin@test.com',
      password: 'admin123'
    })

    const signInResponse = await request()
      .post('/api/v1/admin/auth/sign-in')
      .send({ email: 'superadmin@test.com', password: 'admin123' })

    adminToken = signInResponse.body.token
  })

  afterAll(async () => {
    await TestDB.cleanup()
  })

  describe('GET /api/v1/admin/users', () => {
    it('should list all users', async () => {
      // Arrange
      await TestDB.createTestUser({ email: 'test-user1@test.com' })
      await TestDB.createTestUser({ email: 'test-user2@test.com' })

      // Act
      const response = await request()
        .get('/api/v1/admin/users')
        .auth(adminToken)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('users')
      expect(response.body).toHaveProperty('total')
      expect(response.body.users).toBeInstanceOf(Array)
    })

    it('should support pagination', async () => {
      // Arrange
      for (let i = 0; i < 15; i++) {
        await TestDB.createTestUser({ email: `test-user${i}@test.com` })
      }

      // Act
      const response = await request()
        .get('/api/v1/admin/users?page=1&limit=10')
        .auth(adminToken)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.users.length).toBeLessThanOrEqual(10)
    })

    it('should require authentication', async () => {
      // Act
      const response = await request().get('/api/v1/admin/users')

      // Assert
      expect(response.status).not.toBe(200)
    })

    it('should require users.list permission', async () => {
      // Arrange - Admin without permission
      await TestDB.createTestAdmin({
        email: 'limited@test.com',
        password: 'admin123'
      })

      const signInResponse = await request()
        .post('/api/v1/admin/auth/sign-in')
        .send({ email: 'limited@test.com', password: 'admin123' })

      // Act
      const response = await request()
        .get('/api/v1/admin/users')
        .auth(signInResponse.body.token)

      // Assert
      expect(response.status).not.toBe(200)
      expect(response.body.error).toContain('permission')
    })
  })

  describe('GET /api/v1/admin/users/:id', () => {
    it('should return user details', async () => {
      // Arrange
      const user = await TestDB.createTestUser({
        email: 'test-user@test.com',
        firstName: 'John'
      })

      // Act
      const response = await request()
        .get(`/api/v1/admin/users/${user.id}`)
        .auth(adminToken)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.id).toBe(user.id.toString())
      expect(response.body).toHaveProperty('email')
    })

    it('should return 404 for non-existent user', async () => {
      // Act
      const response = await request()
        .get('/api/v1/admin/users/99999')
        .auth(adminToken)

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

      const signInResponse = await request()
        .post('/api/v1/admin/auth/sign-in')
        .send({ email: 'limited@test.com', password: 'admin123' })

      // Act
      const response = await request()
        .get(`/api/v1/admin/users/${user.id}`)
        .auth(signInResponse.body.token)

      // Assert
      expect(response.status).not.toBe(200)
      expect(response.body.error).toContain('permission')
    })
  })

  describe('DELETE /api/v1/admin/users/:id', () => {
    it('should delete user', async () => {
      // Arrange
      const user = await TestDB.createTestUser({
        email: 'test-user@test.com'
      })

      // Act
      const response = await request()
        .delete(`/api/v1/admin/users/${user.id}`)
        .auth(adminToken)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should require users.delete permission', async () => {
      // Arrange
      const user = await TestDB.createTestUser()
      await TestDB.createTestAdmin({
        email: 'limited@test.com',
        password: 'admin123'
      })

      const signInResponse = await request()
        .post('/api/v1/admin/auth/sign-in')
        .send({ email: 'limited@test.com', password: 'admin123' })

      // Act
      const response = await request()
        .delete(`/api/v1/admin/users/${user.id}`)
        .auth(signInResponse.body.token)

      // Assert
      expect(response.status).not.toBe(200)
      expect(response.body.error).toContain('permission')
    })

    it('should return 404 for non-existent user', async () => {
      // Act
      const response = await request()
        .delete('/api/v1/admin/users/99999')
        .auth(adminToken)

      // Assert
      expect(response.status).not.toBe(200)
    })
  })

  describe('Permission-based access control', () => {
    it('should allow super admin to access all endpoints', async () => {
      // Arrange
      const user = await TestDB.createTestUser()

      // Act - Super admin should have all permissions
      const listResponse = await request()
        .get('/api/v1/admin/users')
        .auth(adminToken)
      const getResponse = await request()
        .get(`/api/v1/admin/users/${user.id}`)
        .auth(adminToken)
      const deleteResponse = await request()
        .delete(`/api/v1/admin/users/${user.id}`)
        .auth(adminToken)

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

      const signInResponse = await request()
        .post('/api/v1/admin/auth/sign-in')
        .send({ email: 'noperm@test.com', password: 'admin123' })

      const token = signInResponse.body.token

      // Act
      const listResponse = await request()
        .get('/api/v1/admin/users')
        .auth(token)
      const getResponse = await request()
        .get(`/api/v1/admin/users/${user.id}`)
        .auth(token)
      const deleteResponse = await request()
        .delete(`/api/v1/admin/users/${user.id}`)
        .auth(token)

      // Assert
      expect(listResponse.status).not.toBe(200)
      expect(getResponse.status).not.toBe(200)
      expect(deleteResponse.status).not.toBe(200)
    })
  })
})

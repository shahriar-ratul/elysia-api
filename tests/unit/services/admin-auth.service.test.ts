import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AdminAuthService } from '../../../src/modules/admin-auth/service'
import { TestDB } from '../../helpers/test-db'
import { db } from '../../../src/utils/db'

describe('AdminAuthService', () => {
  beforeEach(async () => {
    await TestDB.cleanup()
  })

  afterEach(async () => {
    await TestDB.cleanup()
  })

  describe('signIn', () => {
    it('should sign in admin with valid credentials', async () => {
      // Arrange
      const testAdmin = await TestDB.createTestAdmin({
        email: 'admin@test.com',
        password: 'password123'
      })

      // Act
      const result = await AdminAuthService.signIn({
        email: 'admin@test.com',
        password: 'password123'
      })

      // Assert
      expect(result).toHaveProperty('admin')
      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('refreshToken')
      expect(result).toHaveProperty('expiresAt')
      expect(result.admin.email).toBe('admin@test.com')
    })

    it('should throw error for invalid email', async () => {
      // Act & Assert
      await expect(
        AdminAuthService.signIn({
          email: 'nonexistent@test.com',
          password: 'password123'
        })
      ).rejects.toThrow('Invalid credentials')
    })

    it('should throw error for invalid password', async () => {
      // Arrange
      await TestDB.createTestAdmin({
        email: 'admin@test.com',
        password: 'password123'
      })

      // Act & Assert
      await expect(
        AdminAuthService.signIn({
          email: 'admin@test.com',
          password: 'wrongpassword'
        })
      ).rejects.toThrow('Invalid credentials')
    })

    it('should throw error for inactive admin', async () => {
      // Arrange
      const admin = await TestDB.createTestAdmin({
        email: 'admin@test.com',
        password: 'password123'
      })
      
      // Deactivate admin
      await db.admin.update({
        where: { id: admin.id },
        data: { isActive: false }
      })

      // Act & Assert
      await expect(
        AdminAuthService.signIn({
          email: 'admin@test.com',
          password: 'password123'
        })
      ).rejects.toThrow('Account is not active')
    })

    it('should throw error for deleted admin', async () => {
      // Arrange
      const admin = await TestDB.createTestAdmin({
        email: 'admin@test.com',
        password: 'password123'
      })
      
      // Mark as deleted
      await db.admin.update({
        where: { id: admin.id },
        data: { isDeleted: true }
      })

      // Act & Assert
      await expect(
        AdminAuthService.signIn({
          email: 'admin@test.com',
          password: 'password123'
        })
      ).rejects.toThrow('Account has been deleted')
    })
  })

  describe('register', () => {
    it('should register new admin', async () => {
      // Act
      const result = await AdminAuthService.register({
        email: 'newadmin@test.com',
        password: 'password123',
        firstName: 'New',
      })

      // Assert
      expect(result).toHaveProperty('id')
      expect(result.email).toBe('newadmin@test.com')
      expect(result.firstName).toBe('New')
    })

    it('should throw error for duplicate email', async () => {
      // Arrange
      await TestDB.createTestAdmin({
        email: 'admin@test.com'
      })

      // Act & Assert
      await expect(
        AdminAuthService.register({
          email: 'admin@test.com',
          password: 'password123'
        })
      ).rejects.toThrow('Email already in use')
    })

    it('should hash password when creating admin', async () => {
      // Act
      const result = await AdminAuthService.register({
        email: 'admin@test.com',
        password: 'password123'
      })

      // Assert - verify password is hashed
      const admin = await db.admin.findUnique({
        where: { id: BigInt(result.id) }
      })
      expect(admin?.password).not.toBe('password123')
      expect(admin?.password).toMatch(/^\$2[ayb]\$.{56}$/) // bcrypt hash pattern
    })
  })

  describe('getProfile', () => {
    it('should return admin profile with roles and permissions', async () => {
      // Arrange
      const admin = await TestDB.createSuperAdmin({
        email: 'admin@test.com'
      })

      // Act
      const profile = await AdminAuthService.getProfile(admin.id)

      // Assert
      expect(profile).toHaveProperty('id')
      expect(profile).toHaveProperty('email')
      expect(profile).toHaveProperty('roles')
      expect(profile).toHaveProperty('permissions')
      expect(profile.email).toBe('admin@test.com')
    })

    it('should throw error for non-existent admin', async () => {
      // Act & Assert
      await expect(
        AdminAuthService.getProfile(BigInt(99999))
      ).rejects.toThrow('Admin not found')
    })
  })
})

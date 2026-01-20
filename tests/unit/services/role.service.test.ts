import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { RoleService } from '../../../src/modules/role/service'
import { TestDB } from '../../helpers/test-db'
import { db } from '../../../src/utils/db'

describe('RoleService', () => {
  beforeEach(async () => {
    await TestDB.cleanup()
  })

  afterEach(async () => {
    await TestDB.cleanup()
  })

  describe('createRole', () => {
    it('should create new role', async () => {
      // Act
      const uniqueId = Date.now()
      const role = await RoleService.createRole({
        name: `test-moderator-${uniqueId}`,
        displayName: 'Moderator',
        slug: `test-moderator-${uniqueId}`,
        description: 'Moderator role'
      })

      // Assert
      expect(role).toHaveProperty('id')
      expect(role.name).toBe(`test-moderator-${uniqueId}`)
      expect(role.displayName).toBe('Moderator')
    })
  })

  describe('getAllRoles', () => {
    it('should return all active roles', async () => {
      // Arrange
      const uniqueId = Date.now()
      await TestDB.createTestRole({ name: `test-role1-${uniqueId}` })
      await TestDB.createTestRole({ name: `test-role2-${uniqueId}` })

      // Act
      const roles = await RoleService.getAllRoles()

      // Assert
      expect(roles.length).toBeGreaterThanOrEqual(2)
    })

    it('should not return deleted roles', async () => {
      // Arrange
      const uniqueId = Date.now()
      const role = await TestDB.createTestRole({ name: `test-deleted-role-${uniqueId}` })
      await db.role.update({
        where: { id: role.id },
        data: { isDeleted: true }
      })

      // Act
      const roles = await RoleService.getAllRoles()

      // Assert
      const deletedRole = roles.find(r => r.name === `test-deleted-role-${uniqueId}`)
      expect(deletedRole).toBeUndefined()
    })
  })

  describe('getRoleById', () => {
    it('should return role with permissions', async () => {
      // Arrange
      const permission = await TestDB.createTestPermission()
      const role = await TestDB.createTestRole({
        permissions: [permission.id]
      })

      // Act
      const result = await RoleService.getRoleById(role.id)

      // Assert
      expect(result).not.toBeNull()
      expect(result?.id).toBe(role.id)
      expect(result?.permissions).toHaveLength(1)
    })

    it('should return null for deleted role', async () => {
      // Arrange
      const role = await TestDB.createTestRole()
      await db.role.update({
        where: { id: role.id },
        data: { isDeleted: true }
      })

      // Act
      const result = await RoleService.getRoleById(role.id)

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('assignPermissions', () => {
    it('should assign permissions to role', async () => {
      // Arrange
      const role = await TestDB.createTestRole()
      const perm1 = await TestDB.createTestPermission()
      const perm2 = await TestDB.createTestPermission()

      // Act
      const result = await RoleService.assignPermissions(
        role.id,
        [perm1.id, perm2.id]
      )

      // Assert
      expect(result?.permissions).toHaveLength(2)
    })

    it('should replace existing permissions', async () => {
      // Arrange
      const perm1 = await TestDB.createTestPermission()
      const perm2 = await TestDB.createTestPermission()
      const perm3 = await TestDB.createTestPermission()
      
      const role = await TestDB.createTestRole({
        permissions: [perm1.id]
      })

      // Act
      const result = await RoleService.assignPermissions(
        role.id,
        [perm2.id, perm3.id]
      )

      // Assert
      expect(result?.permissions).toHaveLength(2)
      const permIds = result?.permissions.map(p => p.permission.id)
      expect(permIds).toContain(perm2.id)
      expect(permIds).toContain(perm3.id)
      expect(permIds).not.toContain(perm1.id)
    })
  })

  describe('updateRole', () => {
    it('should update role details', async () => {
      // Arrange
      const role = await TestDB.createTestRole({
        displayName: 'Old Name'
      })

      // Act
      const updated = await RoleService.updateRole(role.id, {
        displayName: 'New Name',
        description: 'Updated description'
      })

      // Assert
      expect(updated.displayName).toBe('New Name')
      expect(updated.description).toBe('Updated description')
    })
  })

  describe('deleteRole', () => {
    it('should soft delete role', async () => {
      // Arrange
      const role = await TestDB.createTestRole()

      // Act
      await RoleService.deleteRole(role.id)

      // Assert
      const deleted = await db.role.findUnique({
        where: { id: role.id }
      })
      expect(deleted?.isDeleted).toBe(true)
      expect(deleted?.deletedAt).not.toBeNull()
    })
  })
})

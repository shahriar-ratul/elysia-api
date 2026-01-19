import { db } from '../../src/utils/db'
import bcrypt from 'bcryptjs'

/**
 * Test database helpers
 */

export class TestDB {
  /**
   * Create test admin
   */
  static async createTestAdmin(data?: {
    email?: string
    password?: string
    firstName?: string
    roles?: string[]
  }) {
    const hashedPassword = await bcrypt.hash(data?.password || 'test123', 10)
    
    const admin = await db.admin.create({
      data: {
        email: data?.email || `test-admin-${Date.now()}@example.com`,
        password: hashedPassword,
        firstName: data?.firstName || 'Test',
        lastName: 'Admin',
        isActive: true,
        isDeleted: false,
      }
    })

    // Assign roles if provided
    if (data?.roles && data.roles.length > 0) {
      for (const roleName of data.roles) {
        const role = await db.role.findFirst({
          where: { name: roleName }
        })
        
        if (role) {
          await db.adminRole.create({
            data: {
              adminId: admin.id,
              roleId: role.id,
            }
          })
        }
      }
    }

    return admin
  }

  /**
   * Create test user
   */
  static async createTestUser(data?: {
    email?: string
    password?: string
    firstName?: string
  }) {
    const hashedPassword = await bcrypt.hash(data?.password || 'test123', 10)
    
    return await db.user.create({
      data: {
        email: data?.email || `test-user-${Date.now()}@example.com`,
        password: hashedPassword,
        firstName: data?.firstName || 'Test',
        lastName: 'User',
        isActive: true,
        isDeleted: false,
      }
    })
  }

  /**
   * Create test role
   */
  static async createTestRole(data?: {
    name?: string
    displayName?: string
    permissions?: bigint[]
  }) {
    const roleName = data?.name || `test-role-${Date.now()}`
    
    const role = await db.role.create({
      data: {
        name: roleName,
        displayName: data?.displayName || roleName,
        slug: roleName.toLowerCase().replace(/\s+/g, '-'),
        isActive: true,
        isDeleted: false,
      }
    })

    // Assign permissions if provided
    if (data?.permissions && data.permissions.length > 0) {
      await db.permissionRole.createMany({
        data: data.permissions.map(permId => ({
          roleId: role.id,
          permissionId: permId,
        }))
      })
    }

    return role
  }

  /**
   * Create test permission
   */
  static async createTestPermission(data?: {
    name?: string
    slug?: string
    group?: string
  }) {
    const permName = data?.name || `test-permission-${Date.now()}`
    
    return await db.permission.create({
      data: {
        name: permName,
        displayName: permName,
        slug: data?.slug || `test.permission`,
        group: data?.group || 'Test',
        groupOrder: 1,
        order: 1,
        isActive: true,
        isDeleted: false,
      }
    })
  }

  /**
   * Create super admin with all permissions
   */
  static async createSuperAdmin(data?: {
    email?: string
    password?: string
  }) {
    // Create super_admin role if doesn't exist
    let superAdminRole = await db.role.findFirst({
      where: { name: 'super_admin' }
    })

    if (!superAdminRole) {
      superAdminRole = await db.role.create({
        data: {
          name: 'super_admin',
          displayName: 'Super Admin',
          slug: 'super_admin',
          isActive: true,
          isDeleted: false,
        }
      })
    }

    return await this.createTestAdmin({
      ...data,
      roles: ['super_admin']
    })
  }

  /**
   * Clean up test data
   */
  static async cleanup() {
    // Delete in correct order to respect foreign key constraints
    await db.adminSession.deleteMany({})
    await db.userSession.deleteMany({})
    await db.adminRole.deleteMany({})
    await db.adminPermission.deleteMany({})
    await db.permissionRole.deleteMany({})
    await db.admin.deleteMany({
      where: {
        email: {
          contains: 'test-'
        }
      }
    })
    await db.user.deleteMany({
      where: {
        email: {
          contains: 'test-'
        }
      }
    })
    await db.role.deleteMany({
      where: {
        name: {
          contains: 'test-'
        }
      }
    })
    await db.permission.deleteMany({
      where: {
        name: {
          contains: 'test-'
        }
      }
    })
  }
}

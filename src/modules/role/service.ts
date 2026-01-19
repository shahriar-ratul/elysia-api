import { db } from '../../utils/db'

export class RoleService {
  /**
   * Get role by ID with permissions
   */
  static async getRoleById(id: bigint) {
    return await db.role.findUnique({
      where: { id, isDeleted: false },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })
  }

  /**
   * Get role by name
   */
  static async getRoleByName(name: string) {
    return await db.role.findUnique({
      where: { name, isDeleted: false },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })
  }

  /**
   * Get all roles
   */
  static async getAllRoles() {
    return await db.role.findMany({
      where: { isDeleted: false, isActive: true },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: { order: 'asc' }
    })
  }

  /**
   * Create a new role
   */
  static async createRole(data: {
    name: string
    displayName: string
    slug: string
    description?: string
    isDefault?: boolean
    order?: number
    createdBy?: bigint
  }) {
    return await db.role.create({
      data: {
        ...data,
        isActive: true,
        isDeleted: false
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })
  }

  /**
   * Update role
   */
  static async updateRole(
    id: bigint,
    data: {
      displayName?: string
      description?: string
      order?: number
      isActive?: boolean
      updatedBy?: bigint
    }
  ) {
    return await db.role.update({
      where: { id },
      data,
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })
  }

  /**
   * Assign permissions to role
   */
  static async assignPermissions(roleId: bigint, permissionIds: bigint[]) {
    // Remove existing permissions
    await db.permissionRole.deleteMany({
      where: { roleId }
    })

    // Add new permissions
    const data = permissionIds.map(permissionId => ({
      roleId,
      permissionId
    }))

    await db.permissionRole.createMany({ data })

    return await this.getRoleById(roleId)
  }

  /**
   * Soft delete role
   */
  static async deleteRole(id: bigint, deletedBy?: bigint) {
    return await db.role.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy
      }
    })
  }
}

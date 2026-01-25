import { db } from "../../utils/db";

export class PermissionService {
  /**
   * Get permission by ID
   */
  static async getPermissionById(id: bigint) {
    return await db.permission.findUnique({
      where: { id, isDeleted: false },
    });
  }

  /**
   * Get all permissions grouped
   */
  static async getAllPermissions() {
    return await db.permission.findMany({
      where: { isDeleted: false, isActive: true },
      orderBy: [{ group: "asc" }, { groupOrder: "asc" }, { order: "asc" }],
    });
  }

  /**
   * Get permissions by group
   */
  static async getPermissionsByGroup(group: string) {
    return await db.permission.findMany({
      where: {
        group,
        isDeleted: false,
        isActive: true,
      },
      orderBy: { order: "asc" },
    });
  }

  /**
   * Create a new permission
   */
  static async createPermission(data: {
    name: string;
    displayName: string;
    slug: string;
    group: string;
    groupOrder: number;
    order: number;
    createdBy?: bigint;
  }) {
    return await db.permission.create({
      data: {
        ...data,
        isActive: true,
        isDeleted: false,
      },
    });
  }

  /**
   * Update permission
   */
  static async updatePermission(
    id: bigint,
    data: {
      displayName?: string;
      order?: number;
      groupOrder?: number;
      isActive?: boolean;
      updatedBy?: bigint;
    }
  ) {
    return await db.permission.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft delete permission
   */
  static async deletePermission(id: bigint, deletedBy?: bigint) {
    return await db.permission.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  /**
   * Get permissions for admin (role-based + direct permissions)
   */
  static async getAdminPermissions(adminId: bigint) {
    const admin = await db.admin.findUnique({
      where: { id: adminId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!admin) return [];

    // Collect all permissions (from roles + direct permissions)
    const permissionsSet = new Set<bigint>();
    const permissions: {
      id: bigint;
      name: string;
      slug: string;
      group: string;
    }[] = [];

    // Add permissions from roles
    admin.roles.forEach((adminRole) => {
      adminRole.role.permissions.forEach((permRole) => {
        if (!permissionsSet.has(permRole.permission.id)) {
          permissionsSet.add(permRole.permission.id);
          permissions.push(permRole.permission);
        }
      });
    });

    // Add direct permissions
    admin.permissions.forEach((adminPerm) => {
      if (!permissionsSet.has(adminPerm.permission.id)) {
        permissionsSet.add(adminPerm.permission.id);
        permissions.push(adminPerm.permission);
      }
    });

    return permissions;
  }
}

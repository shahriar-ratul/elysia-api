import { Elysia, t } from 'elysia'
import { adminAuth, requirePermission } from '../../middleware/auth'
import { Action, Subject } from '../../utils/permissions'
import { RoleService } from './service'

export const roleRoutes = new Elysia({ 
  prefix: '/admin/roles',
  tags: ['Roles']
})
  .use(adminAuth)
  .use(requirePermission(Action.List, Subject.Role))
  .get(
    '/',
    async ({ logger, requestId, admin }) => {
      logger.info({ requestId, adminId: admin.id }, 'Fetching roles list')
      
      const roles = await RoleService.getAllRoles()
      
      return { 
        roles: roles.map(role => ({
          id: role.id.toString(),
          name: role.name,
          displayName: role.displayName,
          slug: role.slug,
          description: role.description,
          isDefault: role.isDefault,
          order: role.order,
          isActive: role.isActive,
          permissions: role.permissions.map(p => ({
            id: p.permission.id.toString(),
            name: p.permission.name,
            slug: p.permission.slug,
          }))
        })),
        total: roles.length
      }
    },
    {
      detail: {
        summary: 'List all roles',
        description: 'Get all roles with their permissions (requires roles.list permission)',
        tags: ['Roles'],
        security: [{ bearerAuth: [] }]
      }
    }
  )
  
  .use(requirePermission(Action.Read, Subject.Role))
  .get(
    '/:id',
    async ({ logger, requestId, params, admin }) => {
      logger.info({ requestId, adminId: admin.id, roleId: params.id }, 'Fetching role details')
      
      const role = await RoleService.getRoleById(BigInt(params.id))
      
      if (!role) {
        throw new Error('Role not found')
      }
      
      return {
        id: role.id.toString(),
        name: role.name,
        displayName: role.displayName,
        slug: role.slug,
        description: role.description,
        isDefault: role.isDefault,
        order: role.order,
        isActive: role.isActive,
        permissions: role.permissions.map(p => ({
          id: p.permission.id.toString(),
          name: p.permission.name,
          displayName: p.permission.displayName,
          slug: p.permission.slug,
          group: p.permission.group,
        }))
      }
    },
    {
      params: t.Object({
        id: t.String()
      }),
      detail: {
        summary: 'Get role by ID',
        description: 'Get detailed information about a specific role (requires roles.read permission)',
        tags: ['Roles'],
        security: [{ bearerAuth: [] }]
      }
    }
  )
  
  .use(requirePermission(Action.Create, Subject.Role))
  .post(
    '/',
    async ({ logger, requestId, body, admin }) => {
      logger.info({ requestId, adminId: admin.id, roleName: body.name }, 'Creating new role')
      
      const role = await RoleService.createRole({
        ...body,
        createdBy: admin.id,
      })
      
      return {
        id: role.id.toString(),
        name: role.name,
        displayName: role.displayName,
        slug: role.slug,
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        displayName: t.String({ minLength: 1 }),
        slug: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        isDefault: t.Optional(t.Boolean()),
        order: t.Optional(t.Number()),
      }),
      detail: {
        summary: 'Create new role',
        description: 'Create a new role (requires roles.create permission)',
        tags: ['Roles'],
        security: [{ bearerAuth: [] }]
      }
    }
  )
  
  .use(requirePermission(Action.Update, Subject.Role))
  .patch(
    '/:id',
    async ({ logger, requestId, params, body, admin }) => {
      logger.info({ requestId, adminId: admin.id, roleId: params.id }, 'Updating role')
      
      const role = await RoleService.updateRole(BigInt(params.id), {
        ...body,
        updatedBy: admin.id,
      })
      
      return {
        id: role.id.toString(),
        name: role.name,
        displayName: role.displayName,
        description: role.description,
      }
    },
    {
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        displayName: t.Optional(t.String({ minLength: 1 })),
        description: t.Optional(t.String()),
        order: t.Optional(t.Number()),
        isActive: t.Optional(t.Boolean()),
      }),
      detail: {
        summary: 'Update role',
        description: 'Update an existing role (requires roles.update permission)',
        tags: ['Roles'],
        security: [{ bearerAuth: [] }]
      }
    }
  )
  
  .use(requirePermission(Action.Update, Subject.Role))
  .post(
    '/:id/permissions',
    async ({ logger, requestId, params, body, admin }) => {
      logger.info({ requestId, adminId: admin.id, roleId: params.id }, 'Assigning permissions to role')
      
      const permissionIds = body.permissionIds.map(id => BigInt(id))
      const role = await RoleService.assignPermissions(BigInt(params.id), permissionIds)
      
      return {
        id: role!.id.toString(),
        name: role!.name,
        permissions: role!.permissions.map(p => ({
          id: p.permission.id.toString(),
          name: p.permission.name,
          slug: p.permission.slug,
        }))
      }
    },
    {
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        permissionIds: t.Array(t.String())
      }),
      detail: {
        summary: 'Assign permissions to role',
        description: 'Assign permissions to a role (requires roles.update permission)',
        tags: ['Roles'],
        security: [{ bearerAuth: [] }]
      }
    }
  )
  
  .use(requirePermission(Action.Delete, Subject.Role))
  .delete(
    '/:id',
    async ({ logger, requestId, params, admin }) => {
      logger.info({ requestId, adminId: admin.id, roleId: params.id }, 'Deleting role')
      
      await RoleService.deleteRole(BigInt(params.id), admin.id)
      
      return { success: true }
    },
    {
      params: t.Object({
        id: t.String()
      }),
      detail: {
        summary: 'Delete role',
        description: 'Soft delete a role (requires roles.delete permission)',
        tags: ['Roles'],
        security: [{ bearerAuth: [] }]
      }
    }
  )

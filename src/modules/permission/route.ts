import { Elysia, t } from 'elysia'
import { adminAuth, requirePermission } from '../../middleware/auth'
import { Action, Subject } from '../../utils/permissions'
import { PermissionService } from './service'

export const permissionRoutes = new Elysia({ 
  prefix: '/admin/permissions',
  tags: ['Permissions']
})
  .use(adminAuth)
  .use(requirePermission(Action.List, Subject.Permission))
  .get(
    '/',
    async ({ logger, requestId, admin }) => {
      logger.info({ requestId, adminId: admin.id }, 'Fetching permissions list')
      
      const permissions = await PermissionService.getAllPermissions()
      
      // Group permissions by group
      const grouped = permissions.reduce((acc, perm) => {
        if (!acc[perm.group]) {
          acc[perm.group] = []
        }
        acc[perm.group].push({
          id: perm.id.toString(),
          name: perm.name,
          displayName: perm.displayName,
          slug: perm.slug,
          order: perm.order,
          groupOrder: perm.groupOrder,
          isActive: perm.isActive,
        })
        return acc
      }, {} as Record<string, any[]>)
      
      return { 
        permissions: grouped,
        total: permissions.length
      }
    },
    {
      detail: {
        summary: 'List all permissions',
        description: 'Get all permissions grouped by category (requires permissions.list permission)',
        tags: ['Permissions'],
        security: [{ bearerAuth: [] }]
      }
    }
  )
  
  .use(requirePermission(Action.Read, Subject.Permission))
  .get(
    '/:id',
    async ({ logger, requestId, params, admin }) => {
      logger.info({ requestId, adminId: admin.id, permissionId: params.id }, 'Fetching permission details')
      
      const permission = await PermissionService.getPermissionById(BigInt(params.id))
      
      if (!permission) {
        throw new Error('Permission not found')
      }
      
      return {
        id: permission.id.toString(),
        name: permission.name,
        displayName: permission.displayName,
        slug: permission.slug,
        group: permission.group,
        groupOrder: permission.groupOrder,
        order: permission.order,
        isActive: permission.isActive,
      }
    },
    {
      params: t.Object({
        id: t.String()
      }),
      detail: {
        summary: 'Get permission by ID',
        description: 'Get detailed information about a specific permission (requires permissions.read permission)',
        tags: ['Permissions'],
        security: [{ bearerAuth: [] }]
      }
    }
  )
  
  .use(requirePermission(Action.Create, Subject.Permission))
  .post(
    '/',
    async ({ logger, requestId, body, admin }) => {
      logger.info({ requestId, adminId: admin.id, permissionName: body.name }, 'Creating new permission')
      
      const permission = await PermissionService.createPermission({
        ...body,
        createdBy: admin.id,
      })
      
      return {
        id: permission.id.toString(),
        name: permission.name,
        displayName: permission.displayName,
        slug: permission.slug,
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        displayName: t.String({ minLength: 1 }),
        slug: t.String({ minLength: 1 }),
        group: t.String({ minLength: 1 }),
        groupOrder: t.Number(),
        order: t.Number(),
      }),
      detail: {
        summary: 'Create new permission',
        description: 'Create a new permission (requires permissions.create permission)',
        tags: ['Permissions'],
        security: [{ bearerAuth: [] }]
      }
    }
  )

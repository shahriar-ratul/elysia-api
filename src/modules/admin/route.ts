// Route file for admin module - all admin endpoints defined here
import { Elysia, t } from 'elysia'
import { adminAuth, requirePermission } from '../../middleware/auth'
import { Action, Subject } from '../../utils/permissions'

export const adminRoutes = new Elysia({ 
  prefix: '/admin',
  tags: ['Admin'] // For OpenAPI grouping
})
  .use(adminAuth)
  .use(requirePermission(Action.List, Subject.User))
  .get(
    '/users',
    async ({ logger, requestId, query, admin }) => {
      logger.info({ requestId, adminId: admin.id, query }, 'Fetching users list')
      // Add your logic here
      return { 
        users: [],
        total: 0 
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.Number({ minimum: 1, default: 1 })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
      }),
      detail: {
        summary: 'List all users',
        description: 'Get a paginated list of all users (requires users.list permission)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }]
      }
    }
  )
  .use(requirePermission(Action.Read, Subject.User))
  .get(
    '/users/:id',
    async ({ logger, requestId, params, admin }) => {
      logger.info({ requestId, adminId: admin.id, userId: params.id }, 'Fetching user details')
      // Add your logic here
      return { 
        id: params.id,
        username: 'example' 
      }
    },
    {
      params: t.Object({
        id: t.String()
      }),
      detail: {
        summary: 'Get user by ID',
        description: 'Get detailed information about a specific user (requires users.read permission)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }]
      }
    }
  )
  .use(requirePermission(Action.Delete, Subject.User))
  .delete(
    '/users/:id',
    async ({ logger, requestId, params, admin }) => {
      logger.info({ requestId, adminId: admin.id, userId: params.id }, 'Deleting user')
      // Add your logic here
      return { success: true }
    },
    {
      params: t.Object({
        id: t.String()
      }),
      response: {
        200: t.Object({
          success: t.Boolean()
        })
      },
      detail: {
        summary: 'Delete user',
        description: 'Delete a user account (requires users.delete permission)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }]
      }
    }
  )

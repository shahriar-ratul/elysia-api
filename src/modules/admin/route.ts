import { Elysia, t } from 'elysia'
import { adminGuard } from '../../middleware/ability.guard'
import { db } from '../../utils/db'

/**
 * Admin User Management Routes
 * All routes require admin auth + specific permissions
 */
export const adminRoutes = new Elysia({
  prefix: '/admin',
  tags: ['Admin']
})
  .use(adminGuard)

  // GET /users - List all users
  .get(
    '/users',
    async ({ logger, requestId, query, admin }) => {
      logger.info({ requestId, adminId: admin.id, query }, 'Fetching users list')
      return {
        users: [],
        total: 0
      }
    },
    {
      permissions: ['users.list'],
      query: t.Object({
        page: t.Optional(t.Number({ minimum: 1, default: 1 })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 }))
      }),
      detail: {
        summary: 'List all users',
        description: 'Get a paginated list of all users',
        security: [{ bearerAuth: [] }]
      }
    }
  )

  // GET /users/:id - Get user by ID
  .get(
    '/users/:id',
    async ({ logger, requestId, params, admin, set }) => {
      logger.info({ requestId, adminId: admin.id, userId: params.id }, 'Fetching user details')

      const user = await db.user.findUnique({
        where: { id: BigInt(params.id) }
      })

      if (!user) {
        set.status = 404
        return { error: 'User not found' }
      }

      return {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive
      }
    },
    {
      permissions: ['users.read'],
      params: t.Object({ id: t.String() }),
      detail: {
        summary: 'Get user by ID',
        description: 'Get detailed information about a specific user',
        security: [{ bearerAuth: [] }]
      }
    }
  )

  // DELETE /users/:id - Delete user
  .delete(
    '/users/:id',
    async ({ logger, requestId, params, admin, set }) => {
      logger.info({ requestId, adminId: admin.id, userId: params.id }, 'Deleting user')

      const user = await db.user.findUnique({
        where: { id: BigInt(params.id) }
      })

      if (!user) {
        set.status = 404
        return { error: 'User not found' }
      }

      await db.user.update({
        where: { id: BigInt(params.id) },
        data: { isDeleted: true }
      })

      return { success: true }
    },
    {
      permissions: ['users.delete'],
      params: t.Object({ id: t.String() }),
      detail: {
        summary: 'Delete user',
        description: 'Delete a user account',
        security: [{ bearerAuth: [] }]
      }
    }
  )

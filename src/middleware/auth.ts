import { Elysia } from 'elysia'
import { validateAdminSession, validateUserSession } from '../utils/session'
import { defineAbilityFor, Action, Subject, AppAbility } from '../utils/permissions'
import { PermissionService } from '../modules/permission/service'

/**
 * Admin authentication middleware
 * Validates admin session and attaches admin data to context
 */
export const adminAuth = new Elysia({ name: 'admin-auth' })
  .derive(async (context) => {
    const { request, logger } = context as unknown as {
      request: Request
      logger: import('../utils/logger').Logger
    }
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header')
    }

    const token = authHeader.substring(7)

    try {
      const session = await validateAdminSession(token)
      
      // Get admin permissions
      const permissions = await PermissionService.getAdminPermissions(session.admin.id)
      
      // Create CASL ability for the admin
      const roles = session.admin.roles.map(
        (roleLink: { role: { name: string } }) => roleLink.role
      )
      const ability = defineAbilityFor(roles, permissions)

      return {
        admin: session.admin,
        ability,
        session: {
          id: session.id,
          token: session.token,
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      logger.error({ error: errorMessage }, 'Admin authentication failed')
      throw new Error(errorMessage)
    }
  })

/**
 * User authentication middleware
 * Validates user session and attaches user data to context
 */
export const userAuth = new Elysia({ name: 'user-auth' })
  .derive(async (context) => {
    const { request, logger } = context as unknown as {
      request: Request
      logger: import('../utils/logger').Logger
    }
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header')
    }

    const token = authHeader.substring(7)

    try {
      const session = await validateUserSession(token)

      return {
        user: session.user,
        session: {
          id: session.id,
          token: session.token,
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      logger.error({ error: errorMessage }, 'User authentication failed')
      throw new Error(errorMessage)
    }
  })

/**
 * Permission check middleware factory
 * Similar to NestJS @Permissions decorator
 */
export function requirePermission(action: Action, subject: Subject) {
  return new Elysia({ name: `permission-${action}-${subject}` })
    .derive(async (context) => {
      const { ability, logger, admin } = context as unknown as {
        ability?: AppAbility
        logger: import('../utils/logger').Logger
        admin?: { id: bigint }
      }
      if (!ability) {
        throw new Error('Permission check requires admin authentication')
      }

      if (!ability.can(action, subject)) {
        logger.warn(
          {
            adminId: admin?.id,
            action,
            subject,
          },
          'Permission denied'
        )
        throw new Error(`You do not have permission to ${action} ${subject}`)
      }

      return {}
    })
}

/**
 * Multiple permissions check
 * Checks if admin has ALL specified permissions
 */
export function requirePermissions(permissions: Array<{ action: Action; subject: Subject }>) {
  return new Elysia({ name: `permissions-check` })
    .derive(async (context) => {
      const { ability, logger, admin } = context as unknown as {
        ability?: AppAbility
        logger: import('../utils/logger').Logger
        admin?: { id: bigint }
      }
      if (!ability) {
        throw new Error('Permission check requires admin authentication')
      }

      for (const { action, subject } of permissions) {
        if (!ability.can(action, subject)) {
          logger.warn(
            {
              adminId: admin?.id,
              requiredPermissions: permissions,
              failedOn: { action, subject },
            },
            'Permission denied'
          )
          throw new Error(`You do not have permission to ${action} ${subject}`)
        }
      }

      return {}
    })
}

/**
 * Optional authentication - doesn't throw error if not authenticated
 */
export const optionalAdminAuth = new Elysia({ name: 'optional-admin-auth' })
  .derive(async ({ request }) => {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        admin: null,
        ability: null,
        session: null,
      }
    }

    const token = authHeader.substring(7)

    try {
      const session = await validateAdminSession(token)
      const permissions = await PermissionService.getAdminPermissions(session.admin.id)
      const roles = session.admin.roles.map(
        (roleLink: { role: { name: string } }) => roleLink.role
      )
      const ability = defineAbilityFor(roles, permissions)

      return {
        admin: session.admin,
        ability,
        session: {
          id: session.id,
          token: session.token,
        }
      }
    } catch {
      return {
        admin: null,
        ability: null,
        session: null,
      }
    }
  })

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Elysia } from 'elysia'
import { randomUUID } from 'crypto'
import { adminResolver, userResolver } from './auth'
import { AppAbility, canPerform } from '../utils/permissions'
import { logger } from '../utils/logger'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if ability allows all required permissions
 */
function checkPermissions(
  ability: AppAbility,
  permissions: string[]
): { allowed: boolean; error?: string } {
  for (const permission of permissions) {
    if (!canPerform(ability, permission)) {
      return {
        allowed: false,
        error: `Missing permission: ${permission}`
      }
    }
  }
  return { allowed: true }
}

/**
 * Check if request has valid auth header
 */
function hasValidAuthHeader(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  return !!(authHeader && authHeader.startsWith('Bearer '))
}

// ============================================================================
// PUBLIC GUARD - No authentication required
// ============================================================================

/**
 * Public Guard - No authentication required
 * Use for routes accessible to everyone (login, register, public API)
 */
export const publicGuard = new Elysia({ name: 'public-guard' }).derive(
  { as: 'scoped' },
  ({ request }) => {
    const requestId = request.headers.get('x-request-id') || randomUUID()
    return { requestId, logger }
  }
)

// ============================================================================
// USER GUARD - User authentication only (no permissions)
// ============================================================================

/**
 * User Guard - Requires user to be logged in
 * No permission system - just authentication
 */
export const userGuard = new Elysia({ name: 'user-guard' })
  .derive({ as: 'scoped' }, async ({ request, set }) => {
    if (!hasValidAuthHeader(request)) {
      set.status = 401
      return {
        user: null as any,
        session: null as any,
        requestId: randomUUID(),
        logger,
        authError: 'Missing or invalid authorization header' as string | null
      }
    }

    try {
      const userData = await userResolver(request)
      const requestId = request.headers.get('x-request-id') || randomUUID()
      return { ...userData, requestId, logger, authError: null as string | null }
    } catch (err) {
      set.status = 401
      return {
        user: null as any,
        session: null as any,
        requestId: randomUUID(),
        logger,
        authError: (err instanceof Error ? err.message : 'Authentication failed') as string | null
      }
    }
  })
  .guard({
    beforeHandle({ authError, set }: any) {
      if (authError) {
        set.status = 401
        return { error: authError }
      }
    }
  })

// ============================================================================
// ADMIN GUARD - Admin authentication + permission checking
// ============================================================================

/**
 * Create admin guard with optional permission requirements
 * Only admins have the ability/permission system
 */
export const adminGuard = new Elysia({ name: 'admin-guard' })
  .derive({ as: 'scoped' }, async ({ request, set }) => {
    if (!hasValidAuthHeader(request)) {
      set.status = 401
      return {
        admin: null as any,
        ability: null as any,
        session: null as any,
        requestId: randomUUID(),
        logger,
        authError: 'Missing or invalid authorization header' as string | null
      }
    }

    try {
      const adminData = await adminResolver(request)
      const requestId = request.headers.get('x-request-id') || randomUUID()
      return { ...adminData, requestId, logger, authError: null as string | null }
    } catch (err) {
      set.status = 401
      return {
        admin: null as any,
        ability: null as any,
        session: null as any,
        requestId: randomUUID(),
        logger,
        authError: (err instanceof Error ? err.message : 'Authentication failed') as string | null
      }
    }
  })
  .guard({
    beforeHandle({ authError, set }: any) {
      if (authError) {
        set.status = 401
        return { error: authError }
      }
    }
  })
  .macro({
    permissions(permissions: string[]) {
      if (!permissions || permissions.length === 0) {
        return {}
      }

      return {
        beforeHandle({ ability, set }: any) {
          const result = checkPermissions(ability, permissions)
          if (!result.allowed) {
            set.status = 403
            return { error: result.error }
          }
        }
      }
    }
  })

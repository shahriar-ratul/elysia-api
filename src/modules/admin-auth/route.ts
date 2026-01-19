import { Elysia, t } from 'elysia'
import { AdminAuthService } from './service'
import { adminAuth } from '../../middleware/auth'

export const adminAuthRoutes = new Elysia({ 
  prefix: '/admin/auth',
  tags: ['Admin Auth']
})
  .post(
    '/sign-in',
    async ({ body, logger, requestId, request }) => {
      logger.info({ requestId, email: body.email }, 'Admin sign-in attempt')
      
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      const userAgent = request.headers.get('user-agent')

      try {
        const result = await AdminAuthService.signIn(body, {
          ipAddress: ipAddress || undefined,
          userAgent: userAgent || undefined,
        })
        
        logger.info({ requestId, email: body.email }, 'Admin signed in successfully')
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
        logger.error({ requestId, email: body.email, error: errorMessage }, 'Admin sign-in failed')
        throw new Error(errorMessage)
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 6 })
      }),
      response: {
        200: t.Object({
          admin: t.Object({
            id: t.String(),
            email: t.String(),
            firstName: t.Nullable(t.String()),
            lastName: t.Nullable(t.String()),
            roles: t.Array(t.Object({
              id: t.String(),
              name: t.String(),
              displayName: t.String(),
            }))
          }),
          token: t.String(),
          refreshToken: t.String(),
          expiresAt: t.Date(),
        })
      },
      detail: {
        summary: 'Admin sign in',
        description: 'Authenticate admin with email and password',
        tags: ['Admin Auth']
      }
    }
  )
  
  .use(adminAuth)
  .post(
    '/sign-out',
    async ({ logger, requestId, session, admin }) => {
      logger.info({ requestId, adminId: admin.id }, 'Admin sign-out')
      
      const result = await AdminAuthService.signOut(session.token, admin.id)
      
      logger.info({ requestId, adminId: admin.id }, 'Admin signed out successfully')
      return result
    },
    {
      response: {
        200: t.Object({
          success: t.Boolean()
        })
      },
      detail: {
        summary: 'Admin sign out',
        description: 'Sign out admin and revoke session',
        tags: ['Admin Auth'],
        security: [{ bearerAuth: [] }]
      }
    }
  )
  
  .get(
    '/me',
    async ({ logger, requestId, admin }) => {
      logger.info({ requestId, adminId: admin.id }, 'Get admin profile')
      
      const profile = await AdminAuthService.getProfile(admin.id)
      
      return profile
    },
    {
      detail: {
        summary: 'Get current admin',
        description: 'Get the currently authenticated admin profile',
        tags: ['Admin Auth'],
        security: [{ bearerAuth: [] }]
      }
    }
  )

import { Elysia, t } from 'elysia'
import { UserAuthService } from './service'
import { userAuth } from '../../middleware/auth'

export const userAuthRoutes = new Elysia({ 
  prefix: '/auth',
  tags: ['User Auth']
})
  .post(
    '/sign-in',
    async ({ body, logger, requestId, request }) => {
      logger.info({ requestId, email: body.email }, 'User sign-in attempt')
      
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      const userAgent = request.headers.get('user-agent')

      try {
        const result = await UserAuthService.signIn(body, {
          ipAddress: ipAddress || undefined,
          userAgent: userAgent || undefined,
        })
        
        logger.info({ requestId, email: body.email }, 'User signed in successfully')
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
        logger.error({ requestId, email: body.email, error: errorMessage }, 'User sign-in failed')
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
          user: t.Object({
            id: t.String(),
            email: t.String(),
            firstName: t.Nullable(t.String()),
            lastName: t.Nullable(t.String()),
            photo: t.Nullable(t.String()),
          }),
          token: t.String(),
          refreshToken: t.String(),
          expiresAt: t.Date(),
        })
      },
      detail: {
        summary: 'User sign in',
        description: 'Authenticate user with email and password',
        tags: ['User Auth']
      }
    }
  )
  
  .post(
    '/sign-up',
    async ({ body, logger, requestId }) => {
      logger.info({ requestId, email: body.email }, 'User sign-up attempt')
      
      try {
        const result = await UserAuthService.signUp(body)
        
        logger.info({ requestId, email: body.email }, 'User signed up successfully')
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign up failed'
        logger.error({ requestId, email: body.email, error: errorMessage }, 'User sign-up failed')
        throw new Error(errorMessage)
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 6 }),
        firstName: t.Optional(t.String()),
        lastName: t.Optional(t.String()),
      }),
      response: {
        200: t.Object({
          id: t.String(),
          email: t.String(),
          firstName: t.Nullable(t.String()),
          lastName: t.Nullable(t.String()),
        })
      },
      detail: {
        summary: 'User sign up',
        description: 'Register a new user account',
        tags: ['User Auth']
      }
    }
  )
  
  .use(userAuth)
  .post(
    '/sign-out',
    async ({ logger, requestId, session, user }) => {
      logger.info({ requestId, userId: user.id }, 'User sign-out')
      
      const result = await UserAuthService.signOut(session.token)
      
      logger.info({ requestId, userId: user.id }, 'User signed out successfully')
      return result
    },
    {
      response: {
        200: t.Object({
          success: t.Boolean()
        })
      },
      detail: {
        summary: 'User sign out',
        description: 'Sign out user and revoke session',
        tags: ['User Auth'],
        security: [{ bearerAuth: [] }]
      }
    }
  )
  
  .get(
    '/me',
    async ({ logger, requestId, user }) => {
      logger.info({ requestId, userId: user.id }, 'Get user profile')
      
      const profile = await UserAuthService.getProfile(user.id)
      
      return profile
    },
    {
      detail: {
        summary: 'Get current user',
        description: 'Get the currently authenticated user profile',
        tags: ['User Auth'],
        security: [{ bearerAuth: [] }]
      }
    }
  )

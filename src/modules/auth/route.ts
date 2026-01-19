// Route file for auth module - all auth endpoints defined here
import { Elysia } from 'elysia'
import { Auth } from './service'
import { AuthModel } from './model'

export const authRoutes = new Elysia({ 
  prefix: '/auth',
  tags: ['Auth'] // For OpenAPI grouping
})
  .post(
    '/sign-in',
    async ({ body, cookie: { session }, logger, requestId }) => {
      logger.info({ requestId, username: body.username }, 'User sign-in attempt')
      const response = await Auth.signIn(body)

      // Set session cookie
      session.value = response.token
      
      logger.info({ requestId, username: body.username }, 'User signed in successfully')
      return response
    }, 
    {
      body: AuthModel.signInBody,
      response: {
        200: AuthModel.signInResponse,
        400: AuthModel.signInInvalid
      },
      detail: {
        summary: 'Sign in user',
        description: 'Authenticate user with username and password',
        tags: ['Auth']
      }
    }
  )
  .post(
    '/sign-up',
    async ({ body, logger, requestId }) => {
      logger.info({ requestId, username: body.username }, 'User sign-up attempt')
      // Add your sign-up logic here
      return { success: true }
    },
    {
      body: AuthModel.signInBody,
      detail: {
        summary: 'Sign up user',
        description: 'Register a new user account',
        tags: ['Auth']
      }
    }
  )
  .post(
    '/sign-out',
    async ({ cookie: { session }, logger, requestId }) => {
      logger.info({ requestId }, 'User sign-out')
      session.remove()
      return { success: true }
    },
    {
      detail: {
        summary: 'Sign out user',
        description: 'Sign out and clear session',
        tags: ['Auth']
      }
    }
  )
  .get(
    '/me',
    async ({ logger, requestId }) => {
      logger.info({ requestId }, 'Get current user')
      // Add your get current user logic here
      return { username: 'example' }
    },
    {
      detail: {
        summary: 'Get current user',
        description: 'Get the currently authenticated user',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }]
      }
    }
  )

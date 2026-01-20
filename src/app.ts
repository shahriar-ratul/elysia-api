import { Elysia, t } from 'elysia'
import { openapi, fromTypes } from '@elysiajs/openapi'
import { randomUUID } from 'crypto'
import { env } from '@yolk-oss/elysia-env'

// Import utilities
import { logger } from './utils/logger'

// Import routes from modules
import { adminAuthRoutes } from './modules/admin-auth/route'
import { userAuthRoutes } from './modules/user-auth/route'
import { adminRoutes } from './modules/admin/route'
import { roleRoutes } from './modules/role/route'
import { permissionRoutes } from './modules/permission/route'

export const app = new Elysia()
  .use(
    env({
      DATABASE_URL: t.String(),
      PORT: t.Number()
    })
  )
  .decorate('logger', logger)
  .derive(({ request, logger }) => {
    const requestId = request.headers.get('x-request-id') || randomUUID()
    logger.info({ requestId, method: request.method, url: request.url }, 'Incoming request')
    return { requestId }
  })
  .onAfterResponse(({ requestId, logger, request, set }) => {
    logger.info(
      { requestId, method: request.method, url: request.url, statusCode: set.status },
      'Request completed'
    )
  })
  .onError(({ requestId, logger, error, request }) => {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const method = request?.method || 'UNKNOWN'
    const url = request?.url || 'UNKNOWN'
    logger.error({ requestId, method, url, error: errorMessage }, 'Request failed')
    return { error: errorMessage, requestId }
  })
  .use(
    openapi({
      path: '/docs',
      references: fromTypes(),
      documentation: {
        externalDocs: {
          url: 'https://example.com',
          description: 'External API documentation'
        },
        info: {
          title: 'REST API Documentation',
          description: `
            ## API Versions
            - **v1**: Current stable version
            - **v2**: Beta version with new features
            
            All endpoints are prefixed with \`/api/v1\` or \`/api/v2\`
          `,
          version: '1.0.0',
          contact: {
            name: 'API Support',
            email: 'support@example.com'
          }
        },
        servers: [
          {
            url: 'http://localhost:3000',
            description: 'Development server'
          },
          {
            url: 'https://api.example.com',
            description: 'Production server'
          }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'Enter your JWT token'
            }
          }
        },
        tags: [
          {
            name: 'User Auth',
            description: 'User authentication endpoints'
          },
          {
            name: 'Admin Auth',
            description: 'Admin authentication endpoints'
          },
          {
            name: 'Admin',
            description: 'Admin user management endpoints (requires permissions)'
          },
          {
            name: 'Roles',
            description: 'Role management endpoints (requires permissions)'
          },
          {
            name: 'Permissions',
            description: 'Permission management endpoints (requires permissions)'
          }
        ]
      },
      exclude: {
        paths: ['/api/docs', '/api/docs/json']
      },
      embedSpec: true,
      scalar: {
        version: 'latest',
        hideClientButton: true,
        persistAuth: true
      }
    })
  )

  // Health check endpoint (no version)
  .get('/', ({ logger, requestId, set }) => {
    logger.info({ requestId }, 'Health check')
    set.headers['x-request-id'] = requestId
    return {
      status: 'ok',
      message: 'API is running',
      timestamp: new Date().toISOString()
    }
  })

  // API v1 routes
  .group('/api/v1', (app) =>
    app
      .use(userAuthRoutes)
      .use(adminAuthRoutes)
      .use(adminRoutes)
      .use(roleRoutes)
      .use(permissionRoutes)
  )

  // API v2 routes (for future versioning)
  .group('/api/v2', (app) =>
    app
      .use(userAuthRoutes)
      .use(adminAuthRoutes)
      .use(adminRoutes)
      .use(roleRoutes)
      .use(permissionRoutes)
  )

export type App = typeof app

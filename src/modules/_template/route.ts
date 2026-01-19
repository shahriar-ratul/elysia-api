/**
 * Template for creating new module routes
 * 
 * Usage:
 * 1. Copy this folder and rename it to your module name
 * 2. Replace 'template' with your module name throughout
 * 3. Add your route logic
 * 4. Import and register in src/index.ts
 */

import { Elysia, t } from 'elysia'

export const templateRoutes = new Elysia({ 
  prefix: '/template',
  tags: ['Template'] // Change this to your module name
})
  // GET example - List resources
  .get(
    '/',
    async ({ logger, requestId, query }) => {
      logger.info({ requestId, query }, 'Fetching template list')
      
      // Your logic here
      const items = []
      
      return { 
        data: items,
        total: items.length 
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.Number({ minimum: 1, default: 1 })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 }))
      }),
      response: {
        200: t.Object({
          data: t.Array(t.Any()),
          total: t.Number()
        })
      },
      detail: {
        summary: 'List all templates',
        description: 'Get a paginated list of templates',
        tags: ['Template']
      }
    }
  )
  
  // GET by ID example - Get single resource
  .get(
    '/:id',
    async ({ logger, requestId, params }) => {
      logger.info({ requestId, id: params.id }, 'Fetching template by ID')
      
      // Your logic here
      const item = {
        id: params.id,
        name: 'Example'
      }
      
      return item
    },
    {
      params: t.Object({
        id: t.String()
      }),
      detail: {
        summary: 'Get template by ID',
        description: 'Get detailed information about a specific template',
        tags: ['Template']
      }
    }
  )
  
  // POST example - Create resource
  .post(
    '/',
    async ({ logger, requestId, body }) => {
      logger.info({ requestId, body }, 'Creating new template')
      
      // Your logic here
      const newItem = {
        id: '123',
        ...body
      }
      
      return newItem
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.String())
      }),
      response: {
        201: t.Object({
          id: t.String(),
          name: t.String(),
          description: t.Optional(t.String())
        })
      },
      detail: {
        summary: 'Create template',
        description: 'Create a new template',
        tags: ['Template'],
        security: [{ bearerAuth: [] }]
      }
    }
  )
  
  // PUT/PATCH example - Update resource
  .patch(
    '/:id',
    async ({ logger, requestId, params, body }) => {
      logger.info({ requestId, id: params.id, body }, 'Updating template')
      
      // Your logic here
      const updatedItem = {
        id: params.id,
        ...body
      }
      
      return updatedItem
    },
    {
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        description: t.Optional(t.String())
      }),
      detail: {
        summary: 'Update template',
        description: 'Update an existing template',
        tags: ['Template'],
        security: [{ bearerAuth: [] }]
      }
    }
  )
  
  // DELETE example - Delete resource
  .delete(
    '/:id',
    async ({ logger, requestId, params }) => {
      logger.info({ requestId, id: params.id }, 'Deleting template')
      
      // Your logic here
      
      return { 
        success: true,
        message: 'Template deleted successfully' 
      }
    },
    {
      params: t.Object({
        id: t.String()
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          message: t.String()
        })
      },
      detail: {
        summary: 'Delete template',
        description: 'Delete a template',
        tags: ['Template'],
        security: [{ bearerAuth: [] }]
      }
    }
  )

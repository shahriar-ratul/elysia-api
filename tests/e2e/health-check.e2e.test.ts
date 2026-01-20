import { describe, it, expect } from 'vitest'
import { request } from '../helpers'

describe('Health Check E2E', () => {
  describe('GET /', () => {
    it('should return health status', async () => {
      // Act
      const response = await request().get('/')

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body.status).toBe('ok')
    })

    it('should not require authentication', async () => {
      // Act
      const response = await request().get('/')

      // Assert
      expect(response.status).toBe(200)
    })

    it('should include request ID header', async () => {
      // Act
      const response = await request().get('/')

      // Assert
      expect(response.headers.has('x-request-id')).toBe(true)
    })
  })

  describe('GET /docs', () => {
    it('should return API documentation', async () => {
      // Act
      const response = await request().get('/docs')

      // Assert
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('text/html')
    })

    it('should not require authentication', async () => {
      // Act
      const response = await request().get('/docs')

      // Assert
      expect(response.status).toBe(200)
    })
  })
})

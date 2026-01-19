import { describe, it, expect, beforeAll } from 'vitest'
import { ApiClient } from '../helpers/api-client'

describe('Health Check E2E', () => {
  let client: ApiClient

  beforeAll(() => {
    client = new ApiClient()
  })

  describe('GET /', () => {
    it('should return health status', async () => {
      // Act
      const response = await client.healthCheck()

      // Assert
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('status')
      expect(response.data).toHaveProperty('message')
      expect(response.data).toHaveProperty('timestamp')
      expect(response.data.status).toBe('ok')
    })

    it('should not require authentication', async () => {
      // Arrange
      client.clearToken()

      // Act
      const response = await client.healthCheck()

      // Assert
      expect(response.status).toBe(200)
    })

    it('should include request ID header', async () => {
      // Act
      const rawResponse = await fetch('http://localhost:3000/')
      
      // Assert
      expect(rawResponse.headers.has('x-request-id')).toBe(true)
    })
  })

  describe('GET /docs', () => {
    it('should return API documentation', async () => {
      // Act
      const response = await fetch('http://localhost:3000/docs')

      // Assert
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('text/html')
    })

    it('should not require authentication', async () => {
      // Act
      const response = await fetch('http://localhost:3000/docs')

      // Assert
      expect(response.status).toBe(200)
    })
  })
})

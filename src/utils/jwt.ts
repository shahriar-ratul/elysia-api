import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d'

export interface JWTPayload {
  id: bigint | string  // Can be bigint or string representation
  email: string
  type: 'admin' | 'user'
}

/**
 * Generate access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(): string {
  return randomBytes(64).toString('hex')
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

/**
 * Get token expiration date
 */
export function getTokenExpiration(expiresIn: string = JWT_EXPIRES_IN): Date {
  const match = expiresIn.match(/^(\d+)([dhms])$/)
  if (!match) {
    throw new Error('Invalid expiration format')
  }

  const value = parseInt(match[1])
  const unit = match[2]

  const now = new Date()
  
  switch (unit) {
    case 'd':
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000)
    case 'h':
      return new Date(now.getTime() + value * 60 * 60 * 1000)
    case 'm':
      return new Date(now.getTime() + value * 60 * 1000)
    case 's':
      return new Date(now.getTime() + value * 1000)
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Default 7 days
  }
}

/**
 * Get refresh token expiration date
 */
export function getRefreshTokenExpiration(): Date {
  return getTokenExpiration(JWT_REFRESH_EXPIRES_IN)
}

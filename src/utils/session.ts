import { db } from './db'
import { generateAccessToken, generateRefreshToken, getTokenExpiration, getRefreshTokenExpiration } from './jwt'

/**
 * Session management utilities
 */

interface CreateSessionOptions {
  ipAddress?: string
  userAgent?: string
}

/**
 * Create admin session
 */
export async function createAdminSession(
  adminId: bigint,
  email: string,
  options: CreateSessionOptions = {}
) {
  const token = generateAccessToken({ id: adminId.toString(), email, type: 'admin' })
  const refreshToken = generateRefreshToken()

  const session = await db.adminSession.create({
    data: {
      adminId,
      token,
      refreshToken,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      expiresAt: getTokenExpiration(),
      isRevoked: false,
    }
  })

  return {
    token,
    refreshToken,
    expiresAt: session.expiresAt,
  }
}

/**
 * Create user session
 */
export async function createUserSession(
  userId: bigint,
  email: string,
  options: CreateSessionOptions = {}
) {
  const token = generateAccessToken({ id: userId.toString(), email, type: 'user' })
  const refreshToken = generateRefreshToken()

  const session = await db.userSession.create({
    data: {
      userId,
      token,
      refreshToken,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      expiresAt: getTokenExpiration(),
      isRevoked: false,
    }
  })

  return {
    token,
    refreshToken,
    expiresAt: session.expiresAt,
  }
}

/**
 * Validate admin session
 */
export async function validateAdminSession(token: string) {
  const session = await db.adminSession.findUnique({
    where: { token },
    include: {
      admin: {
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          },
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  })

  if (!session) {
    throw new Error('Session not found')
  }

  if (session.isRevoked) {
    throw new Error('Session has been revoked')
  }

  if (session.expiresAt < new Date()) {
    throw new Error('Session has expired')
  }

  if (!session.admin.isActive) {
    throw new Error('Admin account is not active')
  }

  if (session.admin.isDeleted) {
    throw new Error('Admin account has been deleted')
  }

  return session
}

/**
 * Validate user session
 */
export async function validateUserSession(token: string) {
  const session = await db.userSession.findUnique({
    where: { token },
    include: {
      user: true
    }
  })

  if (!session) {
    throw new Error('Session not found')
  }

  if (session.isRevoked) {
    throw new Error('Session has been revoked')
  }

  if (session.expiresAt < new Date()) {
    throw new Error('Session has expired')
  }

  if (!session.user.isActive) {
    throw new Error('User account is not active')
  }

  if (session.user.isDeleted) {
    throw new Error('User account has been deleted')
  }

  return session
}

/**
 * Revoke admin session
 */
export async function revokeAdminSession(token: string, revokedBy?: bigint) {
  return await db.adminSession.update({
    where: { token },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedBy,
    }
  })
}

/**
 * Revoke user session
 */
export async function revokeUserSession(token: string, revokedBy?: bigint) {
  return await db.userSession.update({
    where: { token },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedBy,
    }
  })
}

/**
 * Revoke all admin sessions
 */
export async function revokeAllAdminSessions(adminId: bigint, revokedBy?: bigint) {
  return await db.adminSession.updateMany({
    where: { 
      adminId,
      isRevoked: false 
    },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedBy,
    }
  })
}

/**
 * Revoke all user sessions
 */
export async function revokeAllUserSessions(userId: bigint, revokedBy?: bigint) {
  return await db.userSession.updateMany({
    where: { 
      userId,
      isRevoked: false 
    },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedBy,
    }
  })
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions() {
  const now = new Date()

  const [adminDeleted, userDeleted] = await Promise.all([
    db.adminSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { isRevoked: true }
        ]
      }
    }),
    db.userSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { isRevoked: true }
        ]
      }
    })
  ])

  return {
    adminSessionsDeleted: adminDeleted.count,
    userSessionsDeleted: userDeleted.count,
  }
}

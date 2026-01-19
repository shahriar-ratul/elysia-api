import bcrypt from 'bcryptjs'
import { db } from '../../utils/db'
import { createAdminSession, revokeAdminSession } from '../../utils/session'

export class AdminAuthService {
  /**
   * Sign in admin
   */
  static async signIn(credentials: { email: string; password: string }, options?: { ipAddress?: string; userAgent?: string }) {
    const admin = await db.admin.findUnique({
      where: { email: credentials.email },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!admin) {
      throw new Error('Invalid credentials')
    }

    if (!admin.isActive) {
      throw new Error('Account is not active')
    }

    if (admin.isDeleted) {
      throw new Error('Account has been deleted')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, admin.password)
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    // Update last login
    await db.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    })

    // Create session
    const session = await createAdminSession(admin.id, admin.email, options)

    return {
      admin: {
        id: admin.id.toString(),
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        roles: admin.roles.map(r => ({
          id: r.role.id.toString(),
          name: r.role.name,
          displayName: r.role.displayName,
        }))
      },
      token: session.token,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    }
  }

  /**
   * Sign out admin
   */
  static async signOut(token: string, adminId?: bigint) {
    await revokeAdminSession(token, adminId)
    return { success: true }
  }

  /**
   * Register new admin (only super admin can do this)
   */
  static async register(data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    createdBy?: bigint
  }) {
    // Check if email already exists
    const existing = await db.admin.findUnique({
      where: { email: data.email }
    })

    if (existing) {
      throw new Error('Email already in use')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create admin
    const admin = await db.admin.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        createdBy: data.createdBy,
        isActive: true,
        isDeleted: false,
      }
    })

    return {
      id: admin.id.toString(),
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
    }
  }

  /**
   * Get current admin profile
   */
  static async getProfile(adminId: bigint) {
    const admin = await db.admin.findUnique({
      where: { id: adminId },
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
    })

    if (!admin) {
      throw new Error('Admin not found')
    }

    return {
      id: admin.id.toString(),
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      photo: admin.photo,
      isVerified: admin.isVerified,
      lastLogin: admin.lastLogin,
      roles: admin.roles.map(r => ({
        id: r.role.id.toString(),
        name: r.role.name,
        displayName: r.role.displayName,
      })),
      permissions: admin.roles.flatMap(r => 
        r.role.permissions.map(p => p.permission.slug)
      ).concat(
        admin.permissions.map(p => p.permission.slug)
      )
    }
  }
}

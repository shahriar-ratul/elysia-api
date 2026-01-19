import bcrypt from 'bcryptjs'
import { db } from '../../utils/db'
import { createUserSession, revokeUserSession } from '../../utils/session'

export class UserAuthService {
  /**
   * Sign in user
   */
  static async signIn(credentials: { email: string; password: string }, options?: { ipAddress?: string; userAgent?: string }) {
    const user = await db.user.findUnique({
      where: { email: credentials.email }
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    if (!user.isActive) {
      throw new Error('Account is not active')
    }

    if (user.isDeleted) {
      throw new Error('Account has been deleted')
    }

    if (!user.password) {
      throw new Error('Please use social login or reset your password')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    // Create session
    const session = await createUserSession(user.id, user.email, options)

    return {
      user: {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        photo: user.photo,
      },
      token: session.token,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    }
  }

  /**
   * Sign up new user
   */
  static async signUp(data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
  }) {
    // Check if email already exists
    const existing = await db.user.findUnique({
      where: { email: data.email }
    })

    if (existing) {
      throw new Error('Email already in use')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        isActive: true,
        isDeleted: false,
      }
    })

    return {
      id: user.id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }
  }

  /**
   * Sign out user
   */
  static async signOut(token: string, adminId?: bigint) {
    await revokeUserSession(token, adminId)
    return { success: true }
  }

  /**
   * Get current user profile
   */
  static async getProfile(userId: bigint) {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return {
      id: user.id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      photo: user.photo,
      isVerified: user.isVerified,
      verifiedByEmail: user.verifiedByEmail,
      verifiedByPhone: user.verifiedByPhone,
      isPaid: user.isPaid,
      premiumUntil: user.premiumUntil,
      lastLogin: user.lastLogin,
    }
  }
}

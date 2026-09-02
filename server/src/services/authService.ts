import prisma from '../config/database';
import { AuthUtils, JWTPayload } from '../utils/auth';
import { RegisterInput, LoginInput } from '../utils/validation';
import { UserRole } from '@prisma/client';

export class AuthService {
  static async register(data: RegisterInput) {
    const { email, password, role = UserRole.CUSTOMER, location_id, business_id } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const password_hash = await AuthUtils.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        role,
        location_id,
        business_id,
        points_balance: 0,
      },
    });

    // Generate tokens
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = AuthUtils.generateTokenPair(payload);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: 'USER_REGISTERED',
        entity_type: 'USER',
        entity_id: user.id,
        details: `New user registered with role: ${role}`,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        points_balance: user.points_balance,
      },
      tokens,
    };
  }

  static async login(data: LoginInput) {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await AuthUtils.comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = AuthUtils.generateTokenPair(payload);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: 'USER_LOGIN',
        entity_type: 'USER',
        entity_id: user.id,
        details: 'User logged in successfully',
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        points_balance: user.points_balance,
        location_id: user.location_id,
        business_id: user.business_id,
      },
      tokens,
    };
  }

  static async refreshToken(refreshToken: string) {
    try {
      const payload = AuthUtils.verifyRefreshToken(refreshToken);

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const newPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const tokens = AuthUtils.generateTokenPair(newPayload);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          points_balance: user.points_balance,
        },
        tokens,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        location: true,
        business: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      points_balance: user.points_balance,
      location: user.location,
      business: user.business,
      created_at: user.created_at,
    };
  }
}

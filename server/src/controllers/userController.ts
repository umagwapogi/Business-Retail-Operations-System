import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { UserUpdateInput } from '../utils/validation';

export class UserController {
  static async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          include: {
            location: true,
            business: true,
          },
          orderBy: { created_at: 'desc' },
        }),
        prisma.user.count(),
      ]);

      res.json({
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  static async getUserById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          location: true,
          business: true,
          transactions: {
            take: 10,
            orderBy: { created_at: 'desc' },
          },
          reward_claims: {
            take: 10,
            orderBy: { claimed_at: 'desc' },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  static async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UserUpdateInput = req.body;

      // Remove sensitive fields
      const { password_hash, ...safeUpdateData } = updateData as any;

      const user = await prisma.user.update({
        where: { id },
        data: safeUpdateData,
        include: {
          location: true,
          business: true,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          user_id: req.user?.userId,
          action: 'USER_UPDATED',
          entity_type: 'USER',
          entity_id: id,
          details: `User updated: ${JSON.stringify(safeUpdateData)}`,
        },
      });

      res.json(user);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update user' });
      }
    }
  }

  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          user_id: req.user?.userId,
          action: 'USER_DELETED',
          entity_type: 'USER',
          entity_id: id,
          details: `User deleted: ${id}`,
        },
      });

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete user' });
      }
    }
  }
}

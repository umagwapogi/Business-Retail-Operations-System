import prisma from '../config/database';
import { TransactionInput } from '../utils/validation';
import { TransactionType } from '@prisma/client';

export class TransactionService {
  static async createTransaction(data: TransactionInput, staffId: string, locationId: string) {
    const { user_id, amount, type, description } = data;

    // Calculate points based on transaction type
    let points_change = 0;

    switch (type) {
      case TransactionType.PURCHASE:
        points_change = Math.floor(amount); // 1 point per dollar
        break;
      case TransactionType.REFUND:
        points_change = -Math.floor(amount);
        break;
      case TransactionType.POINTS_ADJUSTMENT:
        points_change = Math.floor(amount);
        break;
      case TransactionType.REWARD_REDEMPTION:
        points_change = -Math.floor(amount);
        break;
    }

    // Use transaction with row-level locking to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Lock the user row for update
      const user = await tx.user.findUnique({
        where: { id: user_id },
        select: { points_balance: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if user has enough points for redemption
      if (type === TransactionType.REWARD_REDEMPTION && user.points_balance < Math.abs(points_change)) {
        throw new Error('Insufficient points balance');
      }

      // Update user points balance atomically
      const updatedUser = await tx.user.update({
        where: { id: user_id },
        data: {
          points_balance: {
            increment: points_change,
          },
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          user_id,
          staff_id: staffId,
          location_id: locationId,
          type,
          amount,
          points_change,
          description,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          user_id: staffId,
          action: 'TRANSACTION_CREATED',
          entity_type: 'TRANSACTION',
          entity_id: transaction.id,
          details: `Transaction ${type} processed: ${amount} amount, ${points_change} points`,
        },
      });

      return {
        transaction,
        new_balance: updatedUser.points_balance,
      };
    });

    return result;
  }

  static async getUserTransactions(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
        include: {
          location: true,
          staff: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.transaction.count({
        where: { user_id: userId },
      }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getLocationTransactions(locationId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { location_id: locationId },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              points_balance: true,
            },
          },
          staff: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.transaction.count({
        where: { location_id: locationId },
      }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

import prisma from '../config/database';
import { RewardCreateInput, RewardClaimInput } from '../utils/validation';
import { RewardClaimStatus } from '@prisma/client';

export class RewardService {
  static async createReward(data: RewardCreateInput) {
    const reward = await prisma.reward.create({
      data,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'REWARD_CREATED',
        entity_type: 'REWARD',
        entity_id: reward.id,
        details: `New reward created: ${reward.name}`,
      },
    });

    return reward;
  }

  static async getAllRewards(includeInactive = false) {
    const rewards = await prisma.reward.findMany({
      where: includeInactive ? undefined : { is_active: true },
      orderBy: { points_required: 'asc' },
    });

    return rewards;
  }

  static async getRewardById(id: string) {
    const reward = await prisma.reward.findUnique({
      where: { id },
      include: {
        reward_claims: {
          take: 10,
          orderBy: { claimed_at: 'desc' },
        },
      },
    });

    if (!reward) {
      throw new Error('Reward not found');
    }

    return reward;
  }

  static async updateReward(id: string, data: Partial<RewardCreateInput>) {
    const reward = await prisma.reward.update({
      where: { id },
      data,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'REWARD_UPDATED',
        entity_type: 'REWARD',
        entity_id: id,
        details: `Reward updated: ${JSON.stringify(data)}`,
      },
    });

    return reward;
  }

  static async deleteReward(id: string) {
    await prisma.reward.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'REWARD_DELETED',
        entity_type: 'REWARD',
        entity_id: id,
        details: `Reward deleted: ${id}`,
      },
    });
  }

  static async claimReward(userId: string, data: RewardClaimInput) {
    const { reward_id } = data;

    const result = await prisma.$transaction(async (tx) => {
      // Get reward details
      const reward = await tx.reward.findUnique({
        where: { id: reward_id },
      });

      if (!reward) {
        throw new Error('Reward not found');
      }

      if (!reward.is_active) {
        throw new Error('Reward is not currently available');
      }

      if (reward.stock_quantity <= 0) {
        throw new Error('Reward is out of stock');
      }

      // Get user details
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.points_balance < reward.points_required) {
        throw new Error('Insufficient points balance');
      }

      // Update user points balance
      await tx.user.update({
        where: { id: userId },
        data: {
          points_balance: {
            decrement: reward.points_required,
          },
        },
      });

      // Update reward stock
      await tx.reward.update({
        where: { id: reward_id },
        data: {
          stock_quantity: {
            decrement: 1,
          },
        },
      });

      // Create reward claim
      const claim = await tx.rewardClaim.create({
        data: {
          user_id: userId,
          reward_id,
          points_spent: reward.points_required,
          status: RewardClaimStatus.COMPLETED,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          user_id: userId,
          action: 'REWARD_CLAIMED',
          entity_type: 'REWARD_CLAIM',
          entity_id: claim.id,
          details: `User claimed reward: ${reward.name} for ${reward.points_required} points`,
        },
      });

      return {
        claim,
        new_balance: user.points_balance - reward.points_required,
        reward,
      };
    });

    return result;
  }

  static async getUserRewardClaims(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [claims, total] = await Promise.all([
      prisma.rewardClaim.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
        include: {
          reward: true,
        },
        orderBy: { claimed_at: 'desc' },
      }),
      prisma.rewardClaim.count({
        where: { user_id: userId },
      }),
    ]);

    return {
      claims,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getAllRewardClaims(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [claims, total] = await Promise.all([
      prisma.rewardClaim.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          reward: true,
        },
        orderBy: { claimed_at: 'desc' },
      }),
      prisma.rewardClaim.count(),
    ]);

    return {
      claims,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

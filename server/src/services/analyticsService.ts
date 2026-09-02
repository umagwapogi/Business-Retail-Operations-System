import prisma from '../config/database';

export class AnalyticsService {
  static async getDashboardAnalytics(locationId?: string) {
    const whereClause = locationId ? { location_id: locationId } : {};

    const [
      totalUsers,
      totalTransactions,
      totalRewardsClaimed,
      totalPointsIssued,
      recentTransactions,
      topCustomers,
      revenueByType,
    ] = await Promise.all([
      // Total users
      prisma.user.count({
        where: locationId ? { location_id: locationId } : {},
      }),

      // Total transactions
      prisma.transaction.count({
        where: whereClause,
      }),

      // Total rewards claimed
      prisma.rewardClaim.count({
        where: locationId
          ? {
              user: {
                location_id: locationId,
              },
            }
          : {},
      }),

      // Total points issued
      prisma.transaction.aggregate({
        where: {
          ...whereClause,
          points_change: { gt: 0 },
        },
        _sum: {
          points_change: true,
        },
      }),

      // Recent transactions
      prisma.transaction.findMany({
        where: whereClause,
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          location: true,
        },
      }),

      // Top customers by points
      prisma.user.findMany({
        where: locationId ? { location_id: locationId } : {},
        orderBy: { points_balance: 'desc' },
        take: 10,
        select: {
          id: true,
          email: true,
          points_balance: true,
          role: true,
          created_at: true,
        },
      }),

      // Revenue/transactions by type
      prisma.transaction.groupBy({
        by: ['type'],
        where: whereClause,
        _count: {
          id: true,
        },
        _sum: {
          amount: true,
          points_change: true,
        },
      }),
    ]);

    return {
      overview: {
        totalUsers,
        totalTransactions,
        totalRewardsClaimed,
        totalPointsIssued: totalPointsIssued._sum.points_change || 0,
      },
      recentTransactions,
      topCustomers,
      revenueByType: revenueByType.map((item) => ({
        type: item.type,
        count: item._count.id,
        totalAmount: item._sum.amount || 0,
        totalPoints: item._sum.points_change || 0,
      })),
    };
  }

  static async getUserAnalytics(userId: string) {
    const [
      user,
      transactionCount,
      totalPointsEarned,
      totalPointsSpent,
      recentTransactions,
      rewardClaims,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          points_balance: true,
          role: true,
          created_at: true,
        },
      }),

      prisma.transaction.count({
        where: { user_id: userId },
      }),

      prisma.transaction.aggregate({
        where: {
          user_id: userId,
          points_change: { gt: 0 },
        },
        _sum: {
          points_change: true,
        },
      }),

      prisma.transaction.aggregate({
        where: {
          user_id: userId,
          points_change: { lt: 0 },
        },
        _sum: {
          points_change: true,
        },
      }),

      prisma.transaction.findMany({
        where: { user_id: userId },
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          location: true,
        },
      }),

      prisma.rewardClaim.findMany({
        where: { user_id: userId },
        take: 10,
        orderBy: { claimed_at: 'desc' },
        include: {
          reward: true,
        },
      }),
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      user,
      stats: {
        transactionCount,
        totalPointsEarned: totalPointsEarned._sum.points_change || 0,
        totalPointsSpent: Math.abs(totalPointsSpent._sum.points_change || 0),
        rewardClaimsCount: rewardClaims.length,
      },
      recentTransactions,
      rewardClaims,
    };
  }

  static async getLocationAnalytics(locationId: string) {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        business: true,
      },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    const dashboardData = await this.getDashboardAnalytics(locationId);

    return {
      location,
      ...dashboardData,
    };
  }

  static async getAuditLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
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
        },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.auditLog.count(),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

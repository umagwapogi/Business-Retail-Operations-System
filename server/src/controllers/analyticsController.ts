import { Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { AuthRequest } from '../middleware/auth';

export class AnalyticsController {
  static async getDashboardAnalytics(req: AuthRequest, res: Response) {
    try {
      const locationId = req.user?.location_id;
      const analytics = await AnalyticsService.getDashboardAnalytics(locationId);
      res.json(analytics);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch analytics' });
      }
    }
  }

  static async getUserAnalytics(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const analytics = await AnalyticsService.getUserAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch user analytics' });
      }
    }
  }

  static async getMyAnalytics(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const analytics = await AnalyticsService.getUserAnalytics(req.user.userId);
      res.json(analytics);
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch analytics' });
      }
    }
  }

  static async getLocationAnalytics(req: AuthRequest, res: Response) {
    try {
      const { locationId } = req.params;
      const analytics = await AnalyticsService.getLocationAnalytics(locationId);
      res.json(analytics);
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch location analytics' });
      }
    }
  }

  static async getAuditLogs(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const logs = await AnalyticsService.getAuditLogs(page, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  }
}

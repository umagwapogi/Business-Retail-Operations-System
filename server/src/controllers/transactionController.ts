import { Response } from 'express';
import { TransactionService } from '../services/transactionService';
import { AuthRequest } from '../middleware/auth';

export class TransactionController {
  static async createTransaction(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const locationId = req.user.location_id || req.body.location_id;

      if (!locationId) {
        return res.status(400).json({ error: 'Location ID required' });
      }

      const result = await TransactionService.createTransaction(
        req.body,
        req.user.userId,
        locationId
      );

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create transaction' });
      }
    }
  }

  static async getUserTransactions(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await TransactionService.getUserTransactions(userId, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  static async getMyTransactions(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await TransactionService.getUserTransactions(req.user.userId, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  static async getLocationTransactions(req: AuthRequest, res: Response) {
    try {
      const { locationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await TransactionService.getLocationTransactions(locationId, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }
}

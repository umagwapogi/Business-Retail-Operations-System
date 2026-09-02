import { Response } from 'express';
import { RewardService } from '../services/rewardService';
import { AuthRequest } from '../middleware/auth';

export class RewardController {
  static async createReward(req: AuthRequest, res: Response) {
    try {
      const reward = await RewardService.createReward(req.body);
      res.status(201).json(reward);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create reward' });
      }
    }
  }

  static async getAllRewards(req: AuthRequest, res: Response) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const rewards = await RewardService.getAllRewards(includeInactive);
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch rewards' });
    }
  }

  static async getRewardById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const reward = await RewardService.getRewardById(id);
      res.json(reward);
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch reward' });
      }
    }
  }

  static async updateReward(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const reward = await RewardService.updateReward(id, req.body);
      res.json(reward);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update reward' });
      }
    }
  }

  static async deleteReward(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await RewardService.deleteReward(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete reward' });
      }
    }
  }

  static async claimReward(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = await RewardService.claimReward(req.user.userId, req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to claim reward' });
      }
    }
  }

  static async getUserRewardClaims(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await RewardService.getUserRewardClaims(req.user.userId, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reward claims' });
    }
  }

  static async getAllRewardClaims(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await RewardService.getAllRewardClaims(page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reward claims' });
    }
  }
}

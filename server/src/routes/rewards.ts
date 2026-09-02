import { Router } from 'express';
import { RewardController } from '../controllers/rewardController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { rewardCreateSchema, rewardClaimSchema } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Public routes (authenticated users can view rewards)
router.get('/', authenticate, RewardController.getAllRewards);
router.get('/:id', authenticate, RewardController.getRewardById);

// Manager and Admin can manage rewards
router.post('/', authorize('MANAGER', 'ADMIN'), validate(rewardCreateSchema), RewardController.createReward);
router.put('/:id', authorize('MANAGER', 'ADMIN'), validate(rewardCreateSchema), RewardController.updateReward);
router.delete('/:id', authorize('ADMIN'), RewardController.deleteReward);

// Customers can claim rewards
router.post('/claim', authenticate, validate(rewardClaimSchema), RewardController.claimReward);

// Users can view their reward claims
router.get('/claims/my', authenticate, RewardController.getUserRewardClaims);

// Manager and Admin can view all reward claims
router.get('/claims/all', authorize('MANAGER', 'ADMIN'), RewardController.getAllRewardClaims);

export default router;

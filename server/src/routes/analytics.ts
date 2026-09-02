import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Manager and Admin can view dashboard analytics
router.get('/dashboard', authorize('MANAGER', 'ADMIN'), AnalyticsController.getDashboardAnalytics);

// Users can view their own analytics
router.get('/my', authenticate, AnalyticsController.getMyAnalytics);

// Manager and Admin can view user analytics
router.get('/user/:userId', authorize('MANAGER', 'ADMIN'), AnalyticsController.getUserAnalytics);

// Manager and Admin can view location analytics
router.get('/location/:locationId', authorize('MANAGER', 'ADMIN'), AnalyticsController.getLocationAnalytics);

// Admin only can view audit logs
router.get('/audit-logs', authorize('ADMIN'), AnalyticsController.getAuditLogs);

export default router;

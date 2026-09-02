import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { transactionSchema } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Staff, Manager, and Admin can create transactions
router.post('/', authorize('STAFF', 'MANAGER', 'ADMIN'), validate(transactionSchema), TransactionController.createTransaction);

// Users can view their own transactions
router.get('/my', authenticate, TransactionController.getMyTransactions);

// Manager and Admin can view user transactions
router.get('/user/:userId', authorize('MANAGER', 'ADMIN'), TransactionController.getUserTransactions);

// Manager and Admin can view location transactions
router.get('/location/:locationId', authorize('MANAGER', 'ADMIN'), TransactionController.getLocationTransactions);

export default router;

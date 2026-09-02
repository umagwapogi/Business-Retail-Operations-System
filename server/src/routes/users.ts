import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { userUpdateSchema } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Manager and Admin only
router.get('/', authorize('MANAGER', 'ADMIN'), UserController.getAllUsers);
router.get('/:id', authorize('MANAGER', 'ADMIN'), UserController.getUserById);
router.put('/:id', authorize('MANAGER', 'ADMIN'), validate(userUpdateSchema), UserController.updateUser);
router.delete('/:id', authorize('ADMIN'), UserController.deleteUser);

export default router;

import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimit';
import { registerSchema, loginSchema } from '../utils/validation';

const router = Router();

// Public routes with rate limiting
router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', authLimiter, AuthController.refreshToken);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);

export default router;

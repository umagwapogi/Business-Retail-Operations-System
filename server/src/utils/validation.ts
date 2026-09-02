import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum(['CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN']).optional(),
  location_id: z.string().uuid().optional(),
  business_id: z.string().uuid().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const transactionSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['PURCHASE', 'REFUND', 'POINTS_ADJUSTMENT', 'REWARD_REDEMPTION']),
  description: z.string().optional(),
});

export const rewardClaimSchema = z.object({
  reward_id: z.string().uuid('Invalid reward ID'),
});

export const userUpdateSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN']).optional(),
  location_id: z.string().uuid().optional(),
  points_balance: z.number().int().min(0).optional(),
});

export const rewardCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  points_required: z.number().int().positive('Points required must be positive'),
  stock_quantity: z.number().int().min(0, 'Stock quantity must be non-negative'),
  is_active: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type RewardClaimInput = z.infer<typeof rewardClaimSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type RewardCreateInput = z.infer<typeof rewardCreateSchema>;

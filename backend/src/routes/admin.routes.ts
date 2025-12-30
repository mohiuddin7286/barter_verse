import { Router } from 'express';
import { authRequired, adminOnly } from '../middleware/auth.middleware';
import {
  listUsers,
  setUserRole,
  adminAddCoins,
  adminDeductCoins,
  getCoinTransactions,
  getUserTransactions,
} from '../controllers/admin.controller';

const router = Router();

// User management
router.get('/users', authRequired, adminOnly, listUsers);
router.post('/users/role', authRequired, adminOnly, setUserRole);

// Coin management
router.post('/coins/add', authRequired, adminOnly, adminAddCoins);
router.post('/coins/deduct', authRequired, adminOnly, adminDeductCoins);

// Transaction history
router.get('/transactions', authRequired, adminOnly, getCoinTransactions);
router.get('/users/:userId/transactions', authRequired, adminOnly, getUserTransactions);

export default router;

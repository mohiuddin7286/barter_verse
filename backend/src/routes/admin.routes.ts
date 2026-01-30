import { Router } from 'express';
import { authRequired, adminOnly } from '../middleware/auth.middleware';
import {
  listUsers,
  getUserById,
  setUserRole,
  adminAddCoins,
  adminDeductCoins,
  getCoinTransactions,
  getUserTransactions,
  getAdminStats,
  getAdminTrades,
  getAdminTradeById,
  adminAcceptTrade,
  adminRejectTrade,
  adminCompleteTrade,
  adminCancelTrade,
} from '../controllers/admin.controller';

const router = Router();

// User management
router.get('/users', authRequired, adminOnly, listUsers);
router.get('/users/:userId', authRequired, adminOnly, getUserById);
router.put('/users/:userId/role', authRequired, adminOnly, setUserRole);

// Coin management
router.post('/coins/add', authRequired, adminOnly, adminAddCoins);
router.post('/coins/deduct', authRequired, adminOnly, adminDeductCoins);

// Transaction history
router.get('/transactions', authRequired, adminOnly, getCoinTransactions);
router.get('/users/:userId/transactions', authRequired, adminOnly, getUserTransactions);

// Stats
router.get('/stats/overview', authRequired, adminOnly, getAdminStats);

// Trades moderation
router.get('/trades', authRequired, adminOnly, getAdminTrades);
router.get('/trades/:id', authRequired, adminOnly, getAdminTradeById);
router.put('/trades/:id/accept', authRequired, adminOnly, adminAcceptTrade);
router.put('/trades/:id/reject', authRequired, adminOnly, adminRejectTrade);
router.put('/trades/:id/complete', authRequired, adminOnly, adminCompleteTrade);
router.put('/trades/:id/cancel', authRequired, adminOnly, adminCancelTrade);

export default router;

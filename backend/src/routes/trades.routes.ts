import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware';
import { 
  getMyTrades, 
  createTrade, 
  confirmTrade, 
  completeTrade, 
  cancelTrade, 
  getTradeById,
  confirmDelivery // Added this import
} from '../controllers/trades.controller';

const router = Router();

// Get Trades
router.get('/', authRequired, getMyTrades);
router.get('/:id', authRequired, getTradeById);


// Create Trade
router.post('/', authRequired, createTrade);

// Trade Lifecycle Actions
router.patch('/:id/confirm', authRequired, confirmTrade);   // Accept/Reject
router.patch('/:id/delivery', authRequired, confirmDelivery); // Seller confirms sending [New]
router.patch('/:id/complete', authRequired, completeTrade);   // Buyer confirms receipt
router.patch('/:id/cancel', authRequired, cancelTrade);

export default router;
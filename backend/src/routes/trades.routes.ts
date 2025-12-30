import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware';
import { getMyTrades, createTrade, confirmTrade, completeTrade, cancelTrade, getTradeById } from '../controllers/trades.controller';

const router = Router();

router.get('/', authRequired, getMyTrades);
router.get('/:id', authRequired, getTradeById);
router.post('/', authRequired, createTrade);
router.patch('/:id/confirm', authRequired, confirmTrade);
router.patch('/:id/complete', authRequired, completeTrade);
router.patch('/:id/cancel', authRequired, cancelTrade);

export default router;

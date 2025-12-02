import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware';
import { getMyTrades, createTrade } from '../controllers/trades.controller';

const router = Router();

router.get('/', authRequired, getMyTrades);
router.post('/', authRequired, createTrade);

export default router;

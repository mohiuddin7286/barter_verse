import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware';
import { getMyCoins, getMyCoinTransactions } from '../controllers/coins.controller';

const router = Router();

router.get('/', authRequired, getMyCoins);
router.get('/transactions', authRequired, getMyCoinTransactions);

export default router;

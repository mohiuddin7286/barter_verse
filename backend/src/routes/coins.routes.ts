import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware';
import { getMyCoins, getMyCoinTransactions, addCoins, spendCoins, transferCoins } from '../controllers/coins.controller';

const router = Router();

router.get('/', authRequired, getMyCoins);
router.get('/transactions', authRequired, getMyCoinTransactions);

router.post('/add', authRequired, addCoins);
router.post('/spend', authRequired, spendCoins);
router.post('/transfer', authRequired, transferCoins);

export default router;

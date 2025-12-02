import { Router } from 'express';
import { authRequired, adminOnly } from '../middleware/auth.middleware';
import { listUsers, setUserRole } from '../controllers/admin.controller';

const router = Router();

router.get('/users', authRequired, adminOnly, listUsers);
router.post('/users/role', authRequired, adminOnly, setUserRole);

export default router;

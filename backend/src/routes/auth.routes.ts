import { Router } from 'express';
import { signup, login, me, updateProfile } from '../controllers/auth.controller';
import { authRequired } from '../middleware/auth.middleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/signin', login); // alias for frontend that uses "signin"
router.get('/me', me);
router.patch('/profile', authRequired, updateProfile);

export default router;

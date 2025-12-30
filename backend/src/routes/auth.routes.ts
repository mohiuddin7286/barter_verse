import { Router } from 'express';
import { signup, login, me } from '../controllers/auth.controller';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/signin', login); // alias for frontend that uses "signin"
router.get('/me', me);

export default router;

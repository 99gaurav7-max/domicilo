import { Router } from 'express';
import { login, register, changePassword, forgotPassword, resetPassword, refreshToken, getProfile } from '../controllers/auth';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);
router.get('/profile', authenticate, getProfile);
router.post('/change-password', authenticate, changePassword);

export default router;

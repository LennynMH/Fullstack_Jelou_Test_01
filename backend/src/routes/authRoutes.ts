import { Router } from 'express';
import {
  register,
  login,
  getMe,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { registerValidator, loginValidator } from '../utils/validators';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/register', validate(registerValidator), register);
router.post('/login', validate(loginValidator), login);
router.get('/me', authenticate, getMe);

export default router;


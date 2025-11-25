import { Router } from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { checkAdmin } from '../middleware/checkAdmin';
import { userCreateValidator, userUpdateValidator } from '../utils/validators';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);
router.use(checkAdmin);

router.get('/', getUsers);
router.post('/', validate(userCreateValidator), createUser);
router.get('/:id', getUser);
router.put('/:id', validate(userUpdateValidator), updateUser);
router.delete('/:id', deleteUser);

export default router;


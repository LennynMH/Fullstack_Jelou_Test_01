import { Router } from 'express';
import {
  getProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
} from '../controllers/profileController';
import { authenticate } from '../middleware/auth';
import { checkAdmin } from '../middleware/checkAdmin';
import { profileValidator } from '../utils/validators';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);
router.use(checkAdmin);

router.get('/', getProfiles);
router.get('/:id', getProfile);
router.post('/', validate(profileValidator), createProfile);
router.put('/:id', validate(profileValidator), updateProfile);
router.delete('/:id', deleteProfile);

export default router;


import { Router } from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addCollaborator,
  removeCollaborator,
} from '../controllers/projectController';
import { authenticate } from '../middleware/auth';
import { projectValidator } from '../utils/validators';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', validate(projectValidator), createProject);
router.put('/:id', validate(projectValidator), updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/collaborators', addCollaborator);
router.delete('/:id/collaborators/:userId', removeCollaborator);

export default router;


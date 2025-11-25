import { Router } from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { taskValidator, taskUpdateValidator } from '../utils/validators';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', validate(taskValidator), createTask);
router.put('/:id', validate(taskUpdateValidator), updateTask);
router.delete('/:id', deleteTask);

export default router;


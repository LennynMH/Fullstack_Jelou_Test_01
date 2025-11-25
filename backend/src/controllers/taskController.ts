import { Response } from 'express';
import { Task, TaskStatus, TaskPriority } from '../models/Task';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';
import { Model } from 'sequelize';

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Obtener lista de tareas con filtros
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 */
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.user?.id || '0');
    const {
      project: projectId,
      status,
      priority,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const userProjects = await Project.findAll({
      where: {
        [Op.or]: [
          { ownerId: userId },
        ],
      },
      include: [
        {
          model: User,
          as: 'collaborators',
          where: { id: userId },
          required: false,
        },
      ],
    });

    const projectIds = userProjects.map((p: Project) => p.id);

    if (projectId) {
      const projectIdNum = parseInt(projectId as string);
      const hasAccess = projectIds.includes(projectIdNum);
      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'No tienes acceso a este proyecto',
        });
        return;
      }
    }

    const where: any = {
      projectId: projectId ? parseInt(projectId as string) : { [Op.in]: projectIds },
    };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedToId = parseInt(assignedTo as string);

    const order: any = [[sortBy as string, sortOrder === 'asc' ? 'ASC' : 'DESC']];

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order,
    });

    res.status(200).json({
      success: true,
      data: {
        tasks,
        count: tasks.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tareas',
      error: error.message,
    });
  }
};

export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findByPk(parseInt(req.params.id), {
      include: [
        {
          model: Project,
          as: 'project',
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'name', 'email'],
            },
            {
              model: User,
              as: 'collaborators',
              attributes: ['id', 'name', 'email'],
              through: { attributes: [] },
            },
          ],
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Tarea no encontrada',
      });
      return;
    }

    const userId = parseInt(req.user?.id || '0');
    const project = task.project;
    const isOwner = project?.ownerId === userId;
    const isCollaborator = project?.collaborators?.some((collab: User) => collab.id === userId);

    if (!isOwner && !isCollaborator) {
      res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta tarea',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tarea',
      error: error.message,
    });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, project, assignedTo, dueDate } = req.body;
    const userId = parseInt(req.user?.id || '0');

    const projectDoc = await Project.findByPk(parseInt(project), {
      include: [
        {
          model: User,
          as: 'owner',
        },
        {
          model: User,
          as: 'collaborators',
        },
      ],
    });

    if (!projectDoc) {
      res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
      return;
    }

    const isOwner = projectDoc.ownerId === userId;
    const isCollaborator = projectDoc.collaborators?.some((collab: User) => collab.id === userId);

    if (!isOwner && !isCollaborator) {
      res.status(403).json({
        success: false,
        message: 'No tienes acceso a este proyecto',
      });
      return;
    }

    if (assignedTo) {
      const assignedToId = parseInt(assignedTo);
      const isValidAssignee =
        projectDoc.ownerId === assignedToId ||
        projectDoc.collaborators?.some((collab: User) => collab.id === assignedToId);
      if (!isValidAssignee) {
        res.status(400).json({
          success: false,
          message: 'El usuario asignado debe ser colaborador del proyecto',
        });
        return;
      }
    }

    const task = await Task.create({
      title,
      description,
      status: status || TaskStatus.PENDING,
      priority: priority || TaskPriority.MEDIUM,
      projectId: parseInt(project),
      assignedToId: assignedTo ? parseInt(assignedTo) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    await task.reload({
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Tarea creada exitosamente',
      data: task,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al crear tarea',
      error: error.message,
    });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findByPk(parseInt(req.params.id), {
      include: [
        {
          model: Project,
          as: 'project',
          include: [
            {
              model: User,
              as: 'owner',
            },
            {
              model: User,
              as: 'collaborators',
            },
          ],
        },
      ],
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Tarea no encontrada',
      });
      return;
    }

    const userId = parseInt(req.user?.id || '0');
    const project = task.project;
    const isOwner = project?.ownerId === userId;
    const isCollaborator = project?.collaborators?.some((collab: User) => collab.id === userId);

    if (!isOwner && !isCollaborator) {
      res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta tarea',
      });
      return;
    }

    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status as TaskStatus;
    if (priority) task.priority = priority as TaskPriority;
    if (assignedTo !== undefined) {
      if (assignedTo) {
        const assignedToId = parseInt(assignedTo);
        const isValidAssignee =
          project?.ownerId === assignedToId ||
          project?.collaborators?.some((collab: User) => collab.id === assignedToId);
        if (!isValidAssignee) {
          res.status(400).json({
            success: false,
            message: 'El usuario asignado debe ser colaborador del proyecto',
          });
          return;
        }
        task.assignedToId = assignedToId;
      } else {
        task.assignedToId = undefined;
      }
    }
    if (dueDate !== undefined) {
      task.dueDate = dueDate ? new Date(dueDate) : undefined;
    }

    await task.save();
    await task.reload({
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Tarea actualizada exitosamente',
      data: task,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tarea',
      error: error.message,
    });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findByPk(parseInt(req.params.id), {
      include: [
        {
          model: Project,
          as: 'project',
          include: [
            {
              model: User,
              as: 'owner',
            },
            {
              model: User,
              as: 'collaborators',
            },
          ],
        },
      ],
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Tarea no encontrada',
      });
      return;
    }

    const userId = parseInt(req.user?.id || '0');
    const project = task.project;
    const isOwner = project?.ownerId === userId;
    const isCollaborator = project?.collaborators?.some((collab: User) => collab.id === userId);

    if (!isOwner && !isCollaborator) {
      res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta tarea',
      });
      return;
    }

    await task.destroy();

    res.status(200).json({
      success: true,
      message: 'Tarea eliminada exitosamente',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar tarea',
      error: error.message,
    });
  }
};

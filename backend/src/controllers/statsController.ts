import { Response } from 'express';
import { Project } from '../models/Project';
import { Task, TaskStatus } from '../models/Task';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';
import { sequelize } from '../config/database';

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Obtener estadísticas del usuario
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 */
export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.user?.id || '0');

    const projectsAsOwner = await Project.findAll({
      where: { ownerId: userId },
    });

    const projectsAsCollaborator = await Project.findAll({
      include: [
        {
          model: User,
          as: 'collaborators',
          where: { id: userId },
          required: true,
        },
      ],
    });

    const allProjects = [...projectsAsOwner, ...projectsAsCollaborator];
    const projectIds = allProjects.map((p: Project) => p.id);

    const totalProjects = allProjects.length;
    const projectsAsOwnerCount = projectsAsOwner.length;
    const projectsAsCollaboratorCount = projectsAsCollaborator.length;

    const totalTasks = await Task.count({
      where: {
        projectId: { [Op.in]: projectIds },
      },
    });

    const tasksByStatus = await Task.findAll({
      where: {
        projectId: { [Op.in]: projectIds },
      },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    const statusCounts: Record<string, number> = {
      [TaskStatus.PENDING]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.COMPLETED]: 0,
    };

    tasksByStatus.forEach((item: any) => {
      statusCounts[item.status] = parseInt(item.count) || 0;
    });

    const tasksByPriority = await Task.findAll({
      where: {
        projectId: { [Op.in]: projectIds },
      },
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['priority'],
      raw: true,
    });

    const priorityCounts: Record<string, number> = {
      baja: 0,
      media: 0,
      alta: 0,
    };

    tasksByPriority.forEach((item: any) => {
      priorityCounts[item.priority] = parseInt(item.count) || 0;
    });

    const tasksAssignedToMe = await Task.count({
      where: {
        projectId: { [Op.in]: projectIds },
        assignedToId: userId,
      },
    });

    const unassignedTasks = await Task.count({
      where: {
        projectId: { [Op.in]: projectIds },
        assignedToId: null,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        projects: {
          total: totalProjects,
          asOwner: projectsAsOwnerCount,
          asCollaborator: projectsAsCollaboratorCount,
        },
        tasks: {
          total: totalTasks,
          byStatus: statusCounts,
          byPriority: priorityCounts,
          assignedToMe: tasksAssignedToMe,
          unassigned: unassignedTasks,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message,
    });
  }
};

import { Response } from 'express';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Obtener lista de proyectos
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de proyectos
 */
export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    const userId = parseInt(req.user?.id || '0');

    const ownerProjects = await Project.findAll({
      where: { ownerId: userId },
    });

    const collaboratorProjects = await Project.findAll({
      include: [
        {
          model: User,
          as: 'collaborators',
          where: { id: userId },
          required: true,
        },
      ],
    });

    const allProjectIds = [
      ...ownerProjects.map((p: Project) => p.id),
      ...collaboratorProjects.map((p: Project) => p.id),
    ];

    const where: any = {
      id: { [Op.in]: allProjectIds },
    };

    if (search) {
      where[Op.and] = [
        {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } },
          ],
        },
      ];
    }

    const { count, rows: projects } = await Project.findAndCountAll({
      where,
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
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    const userProjects = projects.filter((project) => {
      const isOwner = project.ownerId === userId;
      const isCollaborator = project.collaborators?.some((collab: User) => collab.id === userId);
      return isOwner || isCollaborator;
    });

    res.status(200).json({
      success: true,
      data: {
        projects: userProjects,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener proyectos',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Obtener un proyecto por ID
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *       404:
 *         description: Proyecto no encontrado
 */
export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findByPk(parseInt(req.params.id), {
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
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
      return;
    }

    const userId = parseInt(req.user?.id || '0');
    const isOwner = project.ownerId === userId;
    const isCollaborator = project.collaborators?.some((collab: User) => collab.id === userId);

    if (!isOwner && !isCollaborator) {
      res.status(403).json({
        success: false,
        message: 'No tienes acceso a este proyecto',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener proyecto',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Proyecto creado exitosamente
 */
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const userId = parseInt(req.user?.id || '0');

    const project = await Project.create({
      name,
      description,
      ownerId: userId,
    });

    await project.reload({
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Proyecto creado exitosamente',
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al crear proyecto',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Actualizar un proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *       403:
 *         description: No autorizado
 */
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findByPk(parseInt(req.params.id));
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
      return;
    }

    const userId = parseInt(req.user?.id || '0');
    if (project.ownerId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Solo el creador del proyecto puede editarlo',
      });
      return;
    }

    const { name, description } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;

    await project.save();
    await project.reload({
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
    });

    res.status(200).json({
      success: true,
      message: 'Proyecto actualizado exitosamente',
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar proyecto',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Eliminar un proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto eliminado
 *       403:
 *         description: No autorizado
 */
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findByPk(parseInt(req.params.id));
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
      return;
    }

    const userId = parseInt(req.user?.id || '0');
    if (project.ownerId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Solo el creador del proyecto puede eliminarlo',
      });
      return;
    }

    await project.destroy();

    res.status(200).json({
      success: true,
      message: 'Proyecto eliminado exitosamente',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar proyecto',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/projects/{id}/collaborators:
 *   post:
 *     summary: Añadir colaborador a un proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Colaborador añadido
 */
export const addCollaborator = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findByPk(parseInt(req.params.id));
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
      return;
    }

    const userId = parseInt(req.user?.id || '0');
    if (project.ownerId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Solo el creador del proyecto puede añadir colaboradores',
      });
      return;
    }

    const { userId: collaboratorId } = req.body;
    if (!collaboratorId) {
      res.status(400).json({
        success: false,
        message: 'userId es requerido',
      });
      return;
    }

    const collaboratorIdNum = parseInt(collaboratorId);

    if (project.ownerId === collaboratorIdNum) {
      res.status(400).json({
        success: false,
        message: 'El owner ya es parte del proyecto',
      });
      return;
    }

    const collaborator = await User.findByPk(collaboratorIdNum);
    if (!collaborator) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    await project.reload({
      include: [
        {
          model: User,
          as: 'collaborators',
        },
      ],
    });

    const isAlreadyCollaborator = project.collaborators?.some(
      (collab) => collab.id === collaboratorIdNum
    );

    if (isAlreadyCollaborator) {
      res.status(400).json({
        success: false,
        message: 'El usuario ya es colaborador del proyecto',
      });
      return;
    }

    await (project as any).addCollaborator(collaborator);

    await project.reload({
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
    });

    res.status(200).json({
      success: true,
      message: 'Colaborador añadido exitosamente',
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al añadir colaborador',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/projects/{id}/collaborators/{userId}:
 *   delete:
 *     summary: Remover colaborador de un proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Colaborador removido
 */
export const removeCollaborator = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findByPk(parseInt(req.params.id));
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
      return;
    }

    const userId = parseInt(req.user?.id || '0');
    if (project.ownerId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Solo el creador del proyecto puede remover colaboradores',
      });
      return;
    }

    const collaboratorId = parseInt(req.params.userId);
    const collaborator = await User.findByPk(collaboratorId);
    if (!collaborator) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    await (project as any).removeCollaborator(collaborator);

    await project.reload({
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
    });

    res.status(200).json({
      success: true,
      message: 'Colaborador removido exitosamente',
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al remover colaborador',
      error: error.message,
    });
  }
};

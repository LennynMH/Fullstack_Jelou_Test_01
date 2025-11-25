import { Response } from 'express';
import { User } from '../models/User';
import { Profile } from '../models/Profile';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener lista de usuarios (solo administradores)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 */
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      include: [
        {
          model: Profile,
          as: 'profile',
          attributes: ['id', 'name', 'description'],
        },
      ],
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    res.status(200).json({
      success: true,
      data: {
        users,
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
      message: 'Error al obtener usuarios',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear un nuevo usuario (solo administradores)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 */
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, profileId } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'El email ya está en uso',
      });
      return;
    }

    if (profileId) {
      const profile = await Profile.findByPk(profileId);
      if (!profile) {
        res.status(400).json({
          success: false,
          message: 'Perfil no encontrado',
        });
        return;
      }
    }

    const user = await User.create({ name, email, password, profileId });

    const userWithProfile = await User.findByPk(user.id, {
      include: [
        {
          model: Profile,
          as: 'profile',
          attributes: ['id', 'name', 'description'],
        },
      ],
      attributes: { exclude: ['password'] },
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: userWithProfile,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID (solo administradores)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 */
export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(parseInt(id), {
      include: [
        {
          model: Profile,
          as: 'profile',
          attributes: ['id', 'name', 'description'],
        },
      ],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar un usuario (solo administradores)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 */
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, profileId } = req.body;

    const user = await User.findByPk(parseInt(id));
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'El email ya está en uso',
        });
        return;
      }
    }

    if (profileId) {
      const profile = await Profile.findByPk(profileId);
      if (!profile) {
        res.status(400).json({
          success: false,
          message: 'Perfil no encontrado',
        });
        return;
      }
    }

    await user.update({ name, email, profileId });

    const updatedUser = await User.findByPk(parseInt(id), {
      include: [
        {
          model: Profile,
          as: 'profile',
          attributes: ['id', 'name', 'description'],
        },
      ],
      attributes: { exclude: ['password'] },
    });

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario (solo administradores)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const currentUserId = parseInt(req.user?.id || '0');

    if (userId === currentUserId) {
      res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta',
      });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message,
    });
  }
};


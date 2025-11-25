import { Response } from 'express';
import { Profile } from '../models/Profile';
import { AuthRequest } from '../middleware/auth';

/**
 * @swagger
 * /api/profiles:
 *   get:
 *     summary: Obtener lista de perfiles
 *     tags: [Perfiles]
 *     security:
 *       - bearerAuth: []
 */
export const getProfiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profiles = await Profile.findAll({
      order: [['name', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: {
        profiles,
        count: profiles.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfiles',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/profiles/{id}:
 *   get:
 *     summary: Obtener un perfil por ID
 *     tags: [Perfiles]
 *     security:
 *       - bearerAuth: []
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const profile = await Profile.findByPk(parseInt(id));

    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Perfil no encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/profiles:
 *   post:
 *     summary: Crear un nuevo perfil
 *     tags: [Perfiles]
 *     security:
 *       - bearerAuth: []
 */
export const createProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    const existingProfile = await Profile.findOne({ where: { name } });
    if (existingProfile) {
      res.status(400).json({
        success: false,
        message: 'El perfil ya existe',
      });
      return;
    }

    const profile = await Profile.create({ name, description });

    res.status(201).json({
      success: true,
      message: 'Perfil creado exitosamente',
      data: profile,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al crear perfil',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/profiles/{id}:
 *   put:
 *     summary: Actualizar un perfil
 *     tags: [Perfiles]
 *     security:
 *       - bearerAuth: []
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const profile = await Profile.findByPk(parseInt(id));
    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Perfil no encontrado',
      });
      return;
    }

    if (name && name !== profile.name) {
      const existingProfile = await Profile.findOne({ where: { name } });
      if (existingProfile) {
        res.status(400).json({
          success: false,
          message: 'El nombre del perfil ya existe',
        });
        return;
      }
    }

    await profile.update({ name, description });

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: profile,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/profiles/{id}:
 *   delete:
 *     summary: Eliminar un perfil
 *     tags: [Perfiles]
 *     security:
 *       - bearerAuth: []
 */
export const deleteProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const profile = await Profile.findByPk(parseInt(id));

    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Perfil no encontrado',
      });
      return;
    }

    const { User } = await import('../models/User');
    const usersWithProfile = await User.count({ where: { profileId: parseInt(id) } });
    
    if (usersWithProfile > 0) {
      res.status(400).json({
        success: false,
        message: `No se puede eliminar el perfil. Hay ${usersWithProfile} usuario(s) asignado(s) a este perfil`,
      });
      return;
    }

    await profile.destroy();

    res.status(200).json({
      success: true,
      message: 'Perfil eliminado exitosamente',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar perfil',
      error: error.message,
    });
  }
};


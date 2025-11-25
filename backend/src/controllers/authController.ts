import { Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../utils/generateToken';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registro de nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error de validación
 */
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {

    const { name, email, password, profileId } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'El email ya está registrado',
      });
      return;
    }

    let finalProfileId = profileId;
    if (!finalProfileId) {
      const { Profile } = await import('../models/Profile');
      const gestorProfile = await Profile.findOne({ where: { name: 'gestor' } });
      if (gestorProfile) {
        finalProfileId = gestorProfile.id;
      }
    }

    const user = await User.create({ name, email, password, profileId: finalProfileId });

    const token = generateToken(user.id.toString(), user.email);

    const userWithProfile = await User.findByPk(user.id, {
      include: [
        {
          model: (await import('../models/Profile')).Profile,
          as: 'profile',
          attributes: ['id', 'name', 'description'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile: userWithProfile?.profile ? {
            id: userWithProfile.profile.id,
            name: userWithProfile.profile.name,
            description: userWithProfile.profile.description,
          } : null,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicio de sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
      return;
    }

    const token = generateToken(user.id.toString(), user.email);

    const userWithProfile = await User.findByPk(user.id, {
      include: [
        {
          model: (await import('../models/Profile')).Profile,
          as: 'profile',
          attributes: ['id', 'name', 'description'],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile: userWithProfile?.profile ? {
            id: userWithProfile.profile.id,
            name: userWithProfile.profile.name,
            description: userWithProfile.profile.description,
          } : null,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autenticado
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(parseInt(req.user?.id || '0'), {
      include: [
        {
          model: (await import('../models/Profile')).Profile,
          as: 'profile',
          attributes: ['id', 'name', 'description'],
        },
      ],
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
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile ? {
          id: user.profile.id,
          name: user.profile.name,
          description: user.profile.description,
        } : null,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message,
    });
  }
};


import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { User } from '../models/User';
import { Profile } from '../models/Profile';


export const checkAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = parseInt(req.user?.id || '0');
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
      return;
    }

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Profile,
          as: 'profile',
          attributes: ['id', 'name'],
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

    if (!user.profile || user.profile.name !== 'administrador') {
      res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar permisos',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};


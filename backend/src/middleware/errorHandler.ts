import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || err.code || 500;
  let message = err.message || 'Error interno del servidor';

  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = (err as any).errors.map((e: any) => e.message).join(', ');
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    const field = (err as any).errors[0]?.path || 'campo';
    message = `${field} ya está en uso`;
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Referencia inválida';
  }

  if (err.name === 'SequelizeDatabaseError') {
    statusCode = 400;
    message = 'Error en la base de datos';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`,
  });
};


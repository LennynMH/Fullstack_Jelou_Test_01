import { body, ValidationChain } from 'express-validator';

export const registerValidator: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
];

export const loginValidator: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
];

export const projectValidator: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del proyecto es requerido')
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
];

export const taskValidator: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('El título de la tarea es requerido')
    .isLength({ min: 3, max: 200 })
    .withMessage('El título debe tener entre 3 y 200 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  body('status')
    .optional()
    .isIn(['pendiente', 'en progreso', 'completada'])
    .withMessage('El estado debe ser: pendiente, en progreso o completada'),
  body('priority')
    .optional()
    .isIn(['baja', 'media', 'alta'])
    .withMessage('La prioridad debe ser: baja, media o alta'),
  body('project')
    .notEmpty()
    .withMessage('El proyecto es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de proyecto inválido'),
  body('assignedTo')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de usuario inválido'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe ser válida (ISO 8601)'),
];

export const profileValidator: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del perfil es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La descripción no puede exceder 255 caracteres'),
];

export const userCreateValidator: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('profileId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de perfil inválido'),
];

export const userUpdateValidator: ValidationChain[] = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('profileId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de perfil inválido'),
];

export const taskUpdateValidator: ValidationChain[] = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El título no puede estar vacío')
    .isLength({ min: 3, max: 200 })
    .withMessage('El título debe tener entre 3 y 200 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  body('status')
    .optional()
    .isIn(['pendiente', 'en progreso', 'completada'])
    .withMessage('El estado debe ser: pendiente, en progreso o completada'),
  body('priority')
    .optional()
    .isIn(['baja', 'media', 'alta'])
    .withMessage('La prioridad debe ser: baja, media o alta'),
  body('assignedTo')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de usuario inválido'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe ser válida (ISO 8601)'),
];


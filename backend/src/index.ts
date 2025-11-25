import dotenv from 'dotenv';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { connectDatabase, syncDatabase } from './config/database';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFound } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import statsRoutes from './routes/statsRoutes';
import profileRoutes from './routes/profileRoutes';
import userRoutes from './routes/userRoutes';

import './models';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
}));

const limiter = rateLimit({
  // windowMs: 15 * 60 * 1000, // 15 minutos
  // max: 100, // máximo 100 requests por ventana
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), 
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/users', userRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    console.log('🚀 Iniciando servidor...');
    console.log('📦 Paso 1: Conectando a la base de datos...');
    
    await connectDatabase();
    console.log('✅ Conexión a la base de datos completada');
    
    console.log('📦 Paso 2: Sincronizando modelos con la base de datos...');
    await syncDatabase();
    console.log('✅ Sincronización de modelos completada');
    
    console.log('📦 Paso 3: Iniciando servidor Express...');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📚 Documentación Swagger: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    if (error instanceof Error) {
      console.error('Detalles del error:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
export { startServer };


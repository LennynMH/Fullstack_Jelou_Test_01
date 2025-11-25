import request from 'supertest';
import app from '../index';
import { connectDatabase, sequelize, seedDefaultAdminUser, seedDefaultProfiles } from '../config/database';

export const ADMIN_EMAIL = 'administrador@outlook.com';
export const ADMIN_PASSWORD = '123456';

export const setupTestDatabase = async (): Promise<void> => {
  await connectDatabase();
};

export const resetDatabase = async (): Promise<void> => {
  await sequelize.sync({ force: true });
  await seedDefaultProfiles();
  await seedDefaultAdminUser();
};

export const loginAsAdmin = async (): Promise<string> => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

  if (response.status !== 200) {
    throw new Error('No se pudo iniciar sesión como administrador en las pruebas');
  }

  return response.body.data.token;
};

export const registerAndLogin = async (overrides?: { name?: string; email?: string; password?: string }) => {
  const payload = {
    name: overrides?.name || 'Usuario de Prueba',
    email: overrides?.email || `user-${Date.now()}@example.com`,
    password: overrides?.password || 'password123',
  };

  const response = await request(app)
    .post('/api/auth/register')
    .send(payload);

  if (response.status !== 201) {
    throw new Error(`No se pudo registrar al usuario de prueba: ${response.body?.message || 'error desconocido'}`);
  }

  return {
    token: response.body.data.token as string,
    user: response.body.data.user as { id: number; email: string },
  };
};


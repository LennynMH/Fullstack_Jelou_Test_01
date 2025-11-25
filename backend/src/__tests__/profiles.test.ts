import request from 'supertest';
import app from '../index';
import { loginAsAdmin, registerAndLogin, resetDatabase, setupTestDatabase } from '../tests/testUtils';

describe('Profiles API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('debería listar los perfiles existentes', async () => {
    const adminToken = await loginAsAdmin();

    const response = await request(app)
      .get('/api/profiles')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.profiles)).toBe(true);
    expect(response.body.data.profiles.length).toBeGreaterThanOrEqual(2);
  });

  it('debería permitir crear un nuevo perfil (admin)', async () => {
    const adminToken = await loginAsAdmin();

    const response = await request(app)
      .post('/api/profiles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'auditor',
        description: 'Perfil con permisos de auditoría',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('auditor');
  });

  it('debería rechazar creación de perfiles a usuarios sin rol administrador', async () => {
    const { token } = await registerAndLogin({ email: 'gestor@example.com' });

    const response = await request(app)
      .post('/api/profiles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'sin-permisos',
      });

    expect(response.status).toBe(403);
  });
});


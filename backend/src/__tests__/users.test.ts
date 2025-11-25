import request from 'supertest';
import app from '../index';
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  loginAsAdmin,
  registerAndLogin,
  resetDatabase,
  setupTestDatabase,
} from '../tests/testUtils';

describe('Users API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  const getGestorProfileId = async (adminToken: string): Promise<number> => {
    const profilesResponse = await request(app)
      .get('/api/profiles')
      .set('Authorization', `Bearer ${adminToken}`);

    const { profiles } = profilesResponse.body.data;
    const gestorProfile = profiles.find((profile: any) => profile.name === 'gestor');
    return gestorProfile.id;
  };

  it('debería permitir al administrador crear un usuario', async () => {
    const adminToken = await loginAsAdmin();
    const gestorProfileId = await getGestorProfileId(adminToken);

    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Usuario Creado',
        email: 'nuevo@example.com',
        password: 'password123',
        profileId: gestorProfileId,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('nuevo@example.com');
  });

  it('debería permitir actualizar datos de un usuario', async () => {
    const adminToken = await loginAsAdmin();
    const gestorProfileId = await getGestorProfileId(adminToken);

    const createResponse = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Usuario a Actualizar',
        email: 'actualizar@example.com',
        password: 'password123',
        profileId: gestorProfileId,
      });

    const userId = createResponse.body.data.id;

    const updateResponse = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Usuario Actualizado',
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.name).toBe('Usuario Actualizado');
  });

  it('debería impedir que un usuario sin rol admin acceda al listado', async () => {
    const { token } = await registerAndLogin({ email: 'gestor@example.com' });

    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('debería impedir que el administrador elimine su propia cuenta', async () => {
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

    const adminToken = adminLogin.body.data.token;
    const adminUser = adminLogin.body.data.user;

    const response = await request(app)
      .delete(`/api/users/${adminUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });
});


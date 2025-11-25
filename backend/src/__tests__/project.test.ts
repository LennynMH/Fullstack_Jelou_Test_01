import request from 'supertest';
import app from '../index';
import { registerAndLogin, resetDatabase, setupTestDatabase } from '../tests/testUtils';

describe('Project API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  describe('POST /api/projects', () => {
    it('debería crear un proyecto exitosamente', async () => {
      const { token } = await registerAndLogin({ email: 'creator@example.com' });

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Mi Proyecto',
          description: 'Descripción del proyecto',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Mi Proyecto');
    });

    it('debería fallar sin autenticación', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ name: 'Proyecto' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/projects', () => {
    it('debería obtener lista de proyectos con paginación', async () => {
      const { token } = await registerAndLogin({ email: 'owner@example.com' });

      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Proyecto 1' });

      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Proyecto 2' });

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.projects.length).toBe(2);
      expect(response.body.data.pagination).toHaveProperty('total', 2);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('solo el owner puede actualizar un proyecto', async () => {
      const { token, user } = await registerAndLogin({ email: 'owner-update@example.com' });
      const { token: otherToken } = await registerAndLogin({ email: 'intruder@example.com' });

      const createResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Proyecto Original' });

      const projectId = createResponse.body.data.id;

      const updateResponse = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Proyecto Actualizado' });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.name).toBe('Proyecto Actualizado');
      expect(updateResponse.body.data.ownerId).toBe(user.id);

      const forbiddenResponse = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Cambio no permitido' });

      expect(forbiddenResponse.status).toBe(403);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('debería eliminar un proyecto exitosamente', async () => {
      const { token } = await registerAndLogin({ email: 'delete@example.com' });

      const createResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Proyecto a Eliminar' });

      const projectId = createResponse.body.data.id;

      const deleteResponse = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
    });
  });

  describe('POST /api/projects/:id/collaborators', () => {
    it('debería permitir al owner añadir colaboradores', async () => {
      const { token: ownerToken } = await registerAndLogin({ email: 'owner-collab@example.com' });
      const { user: collaborator } = await registerAndLogin({ email: 'collab@example.com' });

      const projectResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Proyecto con colaboradores' });

      const projectId = projectResponse.body.data.id;

      const addResponse = await request(app)
        .post(`/api/projects/${projectId}/collaborators`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: collaborator.id });

      expect(addResponse.status).toBe(200);
      expect(addResponse.body.success).toBe(true);
      expect(addResponse.body.data.collaborators).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: collaborator.id }),
        ]),
      );
    });
  });
});


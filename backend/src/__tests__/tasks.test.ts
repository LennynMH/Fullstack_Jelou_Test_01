import request from 'supertest';
import app from '../index';
import { registerAndLogin, resetDatabase, setupTestDatabase } from '../tests/testUtils';

const createProject = async (token: string, name = 'Proyecto Tareas') => {
  const response = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name });

  return response.body.data.id as number;
};

const createTaskPayload = (projectId: number) => ({
  title: 'Tarea Importante',
  description: 'Descripción de la tarea',
  priority: 'alta',
  status: 'pendiente',
  project: projectId,
});

describe('Tasks API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('debería crear una tarea asociada a un proyecto', async () => {
    const { token } = await registerAndLogin({ email: 'owner-tasks@example.com' });
    const projectId = await createProject(token);

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send(createTaskPayload(projectId));

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Tarea Importante');
    expect(response.body.data.projectId).toBe(projectId);
  });

  it('debería permitir actualizar el estado de una tarea', async () => {
    const { token } = await registerAndLogin({ email: 'owner-update-tasks@example.com' });
    const projectId = await createProject(token);

    const taskResponse = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send(createTaskPayload(projectId));

    const taskId = taskResponse.body.data.id;

    const updateResponse = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'en progreso' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.status).toBe('en progreso');
  });

  it('debería listar las tareas disponibles para el usuario', async () => {
    const { token } = await registerAndLogin({ email: 'owner-list-tasks@example.com' });
    const projectId = await createProject(token, 'Proyecto Lista');

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send(createTaskPayload(projectId));

    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tasks.length).toBeGreaterThanOrEqual(1);
  });

  it('debería impedir crear tareas en proyectos sin acceso', async () => {
    const { token: ownerToken } = await registerAndLogin({ email: 'owner-protected@example.com' });
    const { token: outsiderToken } = await registerAndLogin({ email: 'outsider@example.com' });
    const projectId = await createProject(ownerToken, 'Proyecto Privado');

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${outsiderToken}`)
      .send(createTaskPayload(projectId));

    expect(response.status).toBe(403);
  });
});


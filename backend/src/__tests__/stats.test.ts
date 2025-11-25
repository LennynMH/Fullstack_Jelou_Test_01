import request from 'supertest';
import app from '../index';
import { registerAndLogin, resetDatabase, setupTestDatabase } from '../tests/testUtils';

const createProject = async (token: string, name = 'Proyecto Estadísticas') => {
  const response = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name });

  return response.body.data.id as number;
};

const createTask = async (token: string, body: Record<string, unknown>) => {
  return request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send(body);
};

describe('Stats API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('debería devolver estadísticas agregadas del usuario', async () => {
    const { token, user } = await registerAndLogin({ email: 'stats-owner@example.com' });
    const projectId = await createProject(token);

    await createTask(token, {
      title: 'Tarea Pendiente',
      project: projectId,
      status: 'pendiente',
      priority: 'media',
    });

    await createTask(token, {
      title: 'Tarea en Progreso',
      project: projectId,
      status: 'en progreso',
      priority: 'alta',
      assignedTo: user.id,
    });

    await createTask(token, {
      title: 'Tarea Completada',
      project: projectId,
      status: 'completada',
      priority: 'baja',
    });

    const response = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const { projects, tasks } = response.body.data;
    expect(projects.total).toBe(1);
    expect(tasks.total).toBe(3);
    expect(tasks.byStatus.pendiente).toBeGreaterThanOrEqual(1);
    expect(tasks.byStatus['en progreso']).toBe(1);
    expect(tasks.byStatus.completada).toBeGreaterThanOrEqual(1);
    expect(tasks.byPriority.alta).toBeGreaterThanOrEqual(1);
    expect(tasks.assignedToMe).toBe(1);
  });
});


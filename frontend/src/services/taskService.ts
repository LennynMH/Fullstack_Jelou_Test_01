import api from './api';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pendiente' | 'en progreso' | 'completada';
  priority: 'baja' | 'media' | 'alta';
  projectId: number;
  assignedToId?: number;
  dueDate?: string;
  project: {
    id: number;
    name: string;
  };
  assignedTo?: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreateData {
  title: string;
  description?: string;
  status?: 'pendiente' | 'en progreso' | 'completada';
  priority?: 'baja' | 'media' | 'alta';
  project: number;
  assignedTo?: number;
  dueDate?: string;
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  status?: 'pendiente' | 'en progreso' | 'completada';
  priority?: 'baja' | 'media' | 'alta';
  assignedTo?: number;
  dueDate?: string;
}

export interface TasksResponse {
  success: boolean;
  data: {
    tasks: Task[];
    count: number;
  };
}

export interface TaskResponse {
  success: boolean;
  data: Task;
}

export const taskService = {
  getAll: async (filters?: {
    project?: number;
    status?: string;
    priority?: string;
    assignedTo?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<TasksResponse> => {
    const response = await api.get<TasksResponse>('/tasks', { params: filters });
    return response.data;
  },

  getById: async (id: number): Promise<TaskResponse> => {
    const response = await api.get<TaskResponse>(`/tasks/${id}`);
    return response.data;
  },

  create: async (data: TaskCreateData): Promise<TaskResponse> => {
    const response = await api.post<TaskResponse>('/tasks', data);
    return response.data;
  },

  update: async (id: number, data: TaskUpdateData): Promise<TaskResponse> => {
    const response = await api.put<TaskResponse>(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};


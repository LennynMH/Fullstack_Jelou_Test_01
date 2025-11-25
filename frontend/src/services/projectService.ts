import api from './api';

export interface Project {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  owner: {
    id: number;
    name: string;
    email: string;
  };
  collaborators: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreateData {
  name: string;
  description?: string;
}

export interface ProjectsResponse {
  success: boolean;
  data: {
    projects: Project[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
}

export const projectService = {
  getAll: async (page = 1, limit = 10, search = ''): Promise<ProjectsResponse> => {
    const response = await api.get<ProjectsResponse>('/projects', {
      params: { page, limit, search },
    });
    return response.data;
  },

  getById: async (id: number): Promise<ProjectResponse> => {
    const response = await api.get<ProjectResponse>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: ProjectCreateData): Promise<ProjectResponse> => {
    const response = await api.post<ProjectResponse>('/projects', data);
    return response.data;
  },

  update: async (id: number, data: ProjectCreateData): Promise<ProjectResponse> => {
    const response = await api.put<ProjectResponse>(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  addCollaborator: async (projectId: number, userId: number): Promise<ProjectResponse> => {
    const response = await api.post<ProjectResponse>(`/projects/${projectId}/collaborators`, {
      userId,
    });
    return response.data;
  },

  removeCollaborator: async (projectId: number, userId: number): Promise<ProjectResponse> => {
    const response = await api.delete<ProjectResponse>(
      `/projects/${projectId}/collaborators/${userId}`
    );
    return response.data;
  },
};


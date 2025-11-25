import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  profile?: {
    id: number;
    name: string;
    description?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface SingleUserResponse {
  success: boolean;
  data: User;
}

export const userService = {
  getAll: async (page: number = 1, limit: number = 10, search?: string): Promise<UsersResponse['data']> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    const response = await api.get<UsersResponse>(`/users?${params.toString()}`);
    return response.data.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get<SingleUserResponse>(`/users/${id}`);
    return response.data.data;
  },

  create: async (data: { name: string; email: string; password: string; profileId?: number }): Promise<User> => {
    const response = await api.post<SingleUserResponse>('/users', data);
    return response.data.data;
  },

  update: async (id: number, data: { name?: string; email?: string; profileId?: number }): Promise<User> => {
    const response = await api.put<SingleUserResponse>(`/users/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};


import api from './api';

export interface Profile {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileResponse {
  success: boolean;
  data: {
    profiles: Profile[];
    count: number;
  };
}

export interface SingleProfileResponse {
  success: boolean;
  data: Profile;
}

export const profileService = {
  getAll: async (): Promise<Profile[]> => {
    const response = await api.get<ProfileResponse>('/profiles');
    return response.data.data.profiles;
  },

  getById: async (id: number): Promise<Profile> => {
    const response = await api.get<SingleProfileResponse>(`/profiles/${id}`);
    return response.data.data;
  },

  create: async (data: { name: string; description?: string }): Promise<Profile> => {
    const response = await api.post<SingleProfileResponse>('/profiles', data);
    return response.data.data;
  },

  update: async (id: number, data: { name?: string; description?: string }): Promise<Profile> => {
    const response = await api.put<SingleProfileResponse>(`/profiles/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/profiles/${id}`);
  },
};


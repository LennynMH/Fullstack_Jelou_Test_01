import api from './api';

export interface StatsResponse {
  success: boolean;
  data: {
    projects: {
      total: number;
      asOwner: number;
      asCollaborator: number;
    };
    tasks: {
      total: number;
      byStatus: {
        pendiente: number;
        'en progreso': number;
        completada: number;
      };
      byPriority: {
        baja: number;
        media: number;
        alta: number;
      };
      assignedToMe: number;
      unassigned: number;
    };
  };
}

export const statsService = {
  getStats: async (): Promise<StatsResponse> => {
    const response = await api.get<StatsResponse>('/stats');
    return response.data;
  },
};


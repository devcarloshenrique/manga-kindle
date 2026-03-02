import { http } from './http';
import type { SystemStats } from './types';

export const systemService = {
  async getStats(): Promise<SystemStats> {
    const response = await http.get<SystemStats>('/api/system/stats');
    return response.data;
  },
};

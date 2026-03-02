import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { ApiError } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function createHttpClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message || error.message || 'Erro desconhecido na requisição';

      console.error(`[HTTP Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        message,
      });

      return Promise.reject(error);
    },
  );

  return client;
}

export const http = createHttpClient();

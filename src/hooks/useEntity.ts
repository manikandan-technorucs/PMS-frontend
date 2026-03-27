import { useState, useCallback } from 'react';
import { api } from '@/api/axiosInstance';
import { AxiosRequestConfig } from 'axios';

interface UseEntityReturn {
  loading: boolean;
  error: string | null;
  getAll: (params?: Record<string, any>) => Promise<any>;
  getById: (id: number | string) => Promise<any>;
  create: (data: Record<string, any>) => Promise<any>;
  update: (id: number | string, data: Record<string, any>) => Promise<any>;
  remove: (id: number | string) => Promise<any>;
  search: (query: string, extraParams?: Record<string, any>, customPath?: string | null) => Promise<any>;
}

export const useEntity = (entityType: string): UseEntityReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = useCallback(async (
    method: AxiosRequestConfig['method'],
    url: string,
    data: Record<string, any> | null = null,
    params: Record<string, any> = {}
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api({ method, url, data, params });
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'An unexpected error occurred';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [entityType]);

  return {
    loading,
    error,
    getAll: (params = {}) => callApi('get', `/${entityType}/`, null, params),
    getById: (id) => callApi('get', `/${entityType}/${id}`),
    create: (data) => callApi('post', `/${entityType}/`, data),
    update: (id, data) => callApi('put', `/${entityType}/${id}`, data),
    remove: (id) => callApi('delete', `/${entityType}/${id}`),
    search: (query, extraParams = {}, customPath = null) =>
      callApi('get', customPath || `/${entityType}/search`, null, { q: query, ...extraParams }),
  };
};

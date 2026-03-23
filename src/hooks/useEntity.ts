import { useState, useCallback, useEffect } from 'react';
import { api } from '@/api/axiosInstance';

interface UseEntityOptions {
  params?: Record<string, any>;
  immediate?: boolean;
}

/**
 * useEntity — Generic CRUD hook for registry-driven modules.
 * Standardizes fetching, loading states, and mutations.
 */
export function useEntity<T = any>(entityPath: string, options: UseEntityOptions = {}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAll = useCallback(async (customParams?: Record<string, any>) => {
    setLoading(true);
    try {
      const response = await api.get(`/${entityPath}`, {
        params: { ...options.params, ...customParams }
      });
      // Handle both { data: [], total: 0 } and simple array responses
      const result = response.data?.data ?? response.data;
      setData(Array.isArray(result) ? result : []);
      setTotal(response.data?.total ?? (Array.isArray(result) ? result.length : 0));
    } catch (err) {
      console.error(`[useEntity] GetAll failed for ${entityPath}:`, err);
    } finally {
      setLoading(false);
    }
  }, [entityPath, JSON.stringify(options.params)]);

  const getById = useCallback(async (id: string | number) => {
    try {
      const response = await api.get(`/${entityPath}/${id}`);
      return response.data;
    } catch (err) {
      console.error(`[useEntity] GetById failed for ${entityPath}/${id}:`, err);
      throw err;
    }
  }, [entityPath]);

  const create = useCallback(async (payload: any) => {
    setIsSubmitting(true);
    try {
      const response = await api.post(`/${entityPath}`, payload);
      return response.data;
    } finally {
      setIsSubmitting(false);
    }
  }, [entityPath]);

  const update = useCallback(async (id: string | number, payload: any) => {
    setIsSubmitting(true);
    try {
      const response = await api.put(`/${entityPath}/${id}`, payload);
      return response.data;
    } finally {
      setIsSubmitting(false);
    }
  }, [entityPath]);

  const remove = useCallback(async (id: string | number) => {
    try {
      await api.delete(`/${entityPath}/${id}`);
    } catch (err) {
      console.error(`[useEntity] Delete failed for ${entityPath}/${id}:`, err);
      throw err;
    }
  }, [entityPath]);

  useEffect(() => {
    if (options.immediate !== false) {
      getAll();
    }
  }, [getAll]);

  return {
    data,
    loading,
    total,
    isSubmitting,
    getAll,
    getById,
    create,
    update,
    remove,
    refresh: getAll
  };
}

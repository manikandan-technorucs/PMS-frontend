import { useState, useCallback } from 'react';
import { api } from '@/shared/lib/api';

/**
 * Universal hook for CRUD logic for 17+ modules.
 * @param {string} entityType - The API endpoint segment (e.g., 'timelogs', 'tasks').
 */
export const useEntity = (entityType) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const callApi = useCallback(async (method, url, data = null, params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api({ method, url, data, params });
            return response.data;
        } catch (err) {
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

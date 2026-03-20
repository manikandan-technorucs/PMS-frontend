import axios from 'axios';
import { queryClient } from '@/app/providers/AppProviders';

const TOKEN_KEY = 'pms_token';

// Base API instance
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach the auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor to handle global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
    (response) => {
        const { method, url } = response.config;
        
        // Automatic Invalidation on any successful mutation (POST, PUT, DELETE)
        if (method && ['post', 'put', 'delete', 'patch'].includes(method.toLowerCase()) && url) {
            // Strip leading slash/api/v1 and get the resource segment
            const resource = url.replace(/^\/api\/v1\//, '').split('/')[0];
            if (resource) {
                console.log(`[API Interceptor] Auto-invalidating: ${resource}`);
                queryClient.invalidateQueries({ queryKey: [resource] });
            }
        }
        
        return response;
    },
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem(TOKEN_KEY);
            window.location.href = '/login';
        } else {
            // Dispatch a global error event for the useApiErrorToast hook
            const message =
                error.response?.data?.detail ||
                error.response?.data?.message ||
                error.message ||
                'An unexpected error occurred';

            window.dispatchEvent(
                new CustomEvent('api-error', {
                    detail: { status, message },
                })
            );
        }

        return Promise.reject(error);
    }
);

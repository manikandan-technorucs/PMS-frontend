import axios from 'axios';
import { queryClient } from '@/providers/AppProviders';

const TOKEN_KEY = 'pms_token';

const PROD_API_URL = 'https://trucszohoreplica.azurewebsites.net/api/v1';
const DEV_API_URL = 'http://localhost:8000/api/v1';

const BASE_URL: string =
    import.meta.env.VITE_API_URL          // Explicit override always wins
    ?? (import.meta.env.PROD              // Vite build-time flag
        ? PROD_API_URL
        : DEV_API_URL);

export const api = axios.create({
    baseURL: BASE_URL,
    
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        const { method, url } = response.config;

        if (method && ['post', 'put', 'delete', 'patch'].includes(method.toLowerCase()) && url) {
            const resource = url.replace(/^\/api\/v1\//, '').split('/')[0];
            if (resource) {
                queryClient.invalidateQueries({ queryKey: [resource] });
            }
        }

        return response;
    },
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            window.location.href = '/login';
        } else {
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

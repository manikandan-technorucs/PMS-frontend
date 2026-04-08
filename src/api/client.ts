import axios, { AxiosInstance } from 'axios';
import { queryClient } from '@/providers/AppProviders';

const TOKEN_KEY = 'pms_token';

export const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL,
    timeout: 30_000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => {
        const { method, url } = response.config;
        if (method && ['post', 'put', 'delete', 'patch'].includes(method) && url) {
            // Extract the base resource name from the URL path
            // e.g., "projects/123/users" -> "projects"
            const resourcePath = url.replace(/^\/api\/v1\//, '').split('?')[0];
            const baseResource = resourcePath.split('/')[0];
            
            if (baseResource) {
                // Invalidate the base resource query key
                queryClient.invalidateQueries({ queryKey: [baseResource] });
                
                // Also invalidate related common resources that might be affected
                if (['tasks', 'issues', 'timelogs', 'milestones'].includes(baseResource)) {
                   queryClient.invalidateQueries({ queryKey: ['reports'] });
                   queryClient.invalidateQueries({ queryKey: ['projects'] });
                }
            }
        }
        return response;
    },
    (error) => {
        const status: number | undefined = error.response?.status;
        const message: string =
            error.response?.data?.detail ??
            error.response?.data?.message ??
            error.message ??
            'An unexpected error occurred';

        if (status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem('user');
            localStorage.removeItem('user_data');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        const toastPayload = (title: string) =>
            window.dispatchEvent(
                new CustomEvent('pms:toast', { detail: { type: 'error', title, message } }),
            );

        if (status === 403) toastPayload('Access Denied');
        else if (status !== undefined && status >= 500) toastPayload(`Server Error (${status})`);
        else if (status !== undefined) toastPayload('Request Failed');

        return Promise.reject(error);
    },
);

import axios, { AxiosInstance } from 'axios';
import { queryClient } from '@/providers/AppProviders';

import { 
    AUTH_TOKEN_KEY, 
    AUTH_REFRESH_TOKEN_KEY, 
    MUTATION_METHODS, 
    CACHE_INVALIDATION_RESOURCES 
} from '@/constants/constants';

export const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL,
    timeout: 30_000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => {
        const { method, url } = response.config;
        if (method && MUTATION_METHODS.includes(method) && url) {

            const resourcePath = url.replace(/^\/api\/v1\//, "");
            const baseResource = resourcePath.split('/')[0];

            if (baseResource) {

                queryClient.invalidateQueries({ queryKey: [baseResource] });

                if (CACHE_INVALIDATION_RESOURCES.includes(baseResource)) {
                    queryClient.invalidateQueries({ queryKey: ['reports'] });
                    queryClient.invalidateQueries({ queryKey: ['projects'] });
                }
            }
        }
        return response;
    },
    (error) => {
        const originalRequest = error.config;
        const status: number | undefined = error.response?.status;
        const message: string =
            error.response?.data?.detail ??
            error.response?.data?.message ??
            error.message ??
            'An unexpected error occurred';

        if (status === 401) {
            if (!originalRequest._retry) {
                const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
                if (refreshToken) {
                    originalRequest._retry = true;
                    const refreshUrl = `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL}/auth/refresh`;
                    
                    return axios.post(refreshUrl, { refresh_token: refreshToken })
                        .then(res => {
                            if (res.status === 200 || res.status === 201) {
                                const { access_token, refresh_token: newRefreshToken } = res.data;
                                localStorage.setItem(AUTH_TOKEN_KEY, access_token);
                                localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, newRefreshToken);
                                api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                                return api(originalRequest);
                            }
                            throw new Error('Refresh failed');
                        })
                        .catch(err => {
                            console.error('[Auth] Refresh failed:', err);
                            localStorage.removeItem(AUTH_TOKEN_KEY);
                            localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
                            localStorage.removeItem('user');
                            localStorage.removeItem('user_data');
                            window.dispatchEvent(
                                new CustomEvent('pms:toast', { 
                                    detail: { type: 'warning', title: 'Session Expired', message: 'Please login again to continue.' } 
                                })
                            );
                            setTimeout(() => { window.location.href = '/login'; }, 1500);
                            return Promise.reject(err);
                        });
                }
            }
            
            // If we got here, it's either a second 401 (retry failed) or no refresh token
            if (window.location.pathname !== '/login') {
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
                window.location.href = '/login';
            }
        }

        const toastPayload = (title: string) =>
            window.dispatchEvent(
                new CustomEvent('pms:toast', { detail: { type: 'error', title, message } }),
            );

        if (status === 403) toastPayload('Access Denied');
        else if (status !== undefined && status >= 500) toastPayload(`Server Error (${status})`);



        return Promise.reject(error);
    },
);

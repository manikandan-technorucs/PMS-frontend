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

            const resourcePath = url.replace(/^\/api\/v1\//, "");
            const baseResource = resourcePath.split('/')[0];

            if (baseResource) {

                queryClient.invalidateQueries({ queryKey: [baseResource] });

                if (['tasks', 'issues', 'timelogs', 'milestones'].includes(baseResource)) {
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

        if (status === 401 && !originalRequest._retry) {
            const refreshToken = localStorage.getItem('pms_refresh_token');
            if (refreshToken) {
                originalRequest._retry = true;
                return axios.post(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
                    refresh_token: refreshToken
                })
                    .then(res => {
                        if (res.status === 200 || res.status === 201) {
                            const { access_token, refresh_token } = res.data;
                            localStorage.setItem(TOKEN_KEY, access_token);
                            localStorage.setItem('pms_refresh_token', refresh_token);
                            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                            originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                            return api(originalRequest);
                        }
                    })
                    .catch(err => {
                        localStorage.removeItem(TOKEN_KEY);
                        localStorage.removeItem('pms_refresh_token');
                        localStorage.removeItem('user');
                        localStorage.removeItem('user_data');
                        window.location.href = '/login';
                        return Promise.reject(err);
                    });
            } else {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem('user');
                localStorage.removeItem('user_data');
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

import axios from 'axios';

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
        const token = localStorage.getItem('token');
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
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            // Clear token and potentially redirect to login
            localStorage.removeItem('token');
            // window.location.href = '/login';
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

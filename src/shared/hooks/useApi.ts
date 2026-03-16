import { useState, useCallback } from 'react';
import { api } from '@/shared/lib/api';
import { useToast } from '@/shared/context/ToastContext';

/**
 * Universal API hook for making requests, tracking loading states,
 * and automatically showing success toasts.
 */
export function useApi() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    /**
     * Generic API caller with built-in toast notification
     */
    const callApi = useCallback(async (
        method: 'get' | 'post' | 'put' | 'delete' | 'patch',
        url: string,
        data: any = null,
        params: any = {},
        successMessage?: string
    ) => {
        // Use different loading state depending on method type
        const isSubmit = method !== 'get';
        if (isSubmit) setIsSubmitting(true);
        else setLoading(true);
        
        setError(null);
        try {
            const response = await api({ method, url, data, params });
            const responseData = response.data !== undefined ? response.data : response;
            
            // Show toast on successful mutations if a message is provided
            if (isSubmit && successMessage) {
                showToast('success', 'Success', successMessage);
            } else if (isSubmit && !successMessage && method !== 'delete') {
                // Default success toast if not explicitly suppressed
                showToast('success', 'Success', 'Action completed successfully');
            } else if (method === 'delete') {
                showToast('success', 'Deleted', successMessage || 'Record deleted successfully');
            }

            return responseData;
        } catch (err: any) {
            const msg = err.response?.data?.detail 
                || err.response?.data?.message 
                || err.message 
                || 'An unexpected error occurred';
            setError(msg);
            // Global error interceptor inside api.ts usually handles errors by dispatching 'api-error'
            // which useApiErrorToast picks up, so we don't duplicate error toasts here.
            throw err;
        } finally {
            if (isSubmit) setIsSubmitting(false);
            else setLoading(false);
        }
    }, [showToast]);

    return {
        loading,
        isSubmitting, // specifically for forms/buttons to prevent double submit
        error,
        callApi,
        get: (url: string, params = {}) => callApi('get', url, null, params),
        post: (url: string, data: any, successMessage?: string) => callApi('post', url, data, undefined, successMessage),
        put: (url: string, data: any, successMessage?: string) => callApi('put', url, data, undefined, successMessage),
        remove: (url: string, successMessage?: string) => callApi('delete', url, null, undefined, successMessage),
    };
}

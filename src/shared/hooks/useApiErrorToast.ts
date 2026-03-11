import { useEffect } from 'react';
import { useToast } from '@/shared/context/ToastContext';

/**
 * Hook that listens for global API error events dispatched by the Axios
 * response interceptor and shows them as toast notifications automatically.
 * 
 * Wire this into a component that is always mounted (e.g. App.tsx or a layout).
 */
export function useApiErrorToast() {
    const { showToast } = useToast();

    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            const status = detail?.status;
            const message = detail?.message || 'An unexpected error occurred';

            if (status === 422) {
                showToast('warning', 'Validation Error', message);
            } else if (status === 404) {
                showToast('warning', 'Not Found', message);
            } else if (status >= 500) {
                showToast('error', 'Server Error', message);
            } else {
                showToast('error', 'Request Failed', message);
            }
        };

        window.addEventListener('api-error', handler);
        return () => window.removeEventListener('api-error', handler);
    }, [showToast]);
}

import { UseFormSetError } from 'react-hook-form';

export function handleServerError(
    error: any,
    setError: UseFormSetError<any>,
    showToast: (type: 'success' | 'error' | 'info' | 'warn', title: string, message: string) => void,
    defaultTitle: string = 'Error'
) {
    const detail = error?.response?.data?.detail;
    const status = error?.response?.status;
    const isGloballyHandled = status === 403 || (status !== undefined && status >= 500);

    if (Array.isArray(detail)) {
        detail.forEach((err: any) => {
            const field = err.loc[err.loc.length - 1];
            setError(field, { type: 'manual', message: err.msg });
        });
        if (!isGloballyHandled) showToast('error', defaultTitle, 'Please correct the highlighted fields.');
    } else if (typeof detail === 'string') {
        if (detail.toLowerCase().includes('duplicate') || detail.toLowerCase().includes('already exists')) {
            if (detail.toLowerCase().includes('name')) {
                setError('project_name', { type: 'manual', message: detail });
                setError('bug_name', { type: 'manual', message: detail });
                setError('task_name', { type: 'manual', message: detail });
            } else if (detail.toLowerCase().includes('sync id')) {
                setError('project_id_sync', { type: 'manual', message: detail });
            } else {
                setError('root', { type: 'manual', message: detail });
            }
        } else {
            setError('root', { type: 'manual', message: detail });
        }
        if (!isGloballyHandled) showToast('error', defaultTitle, detail);
    } else {
        const fallback = 'An unexpected error occurred. Please try again.';
        setError('root', { type: 'manual', message: fallback });
        if (!isGloballyHandled) showToast('error', defaultTitle, fallback);
    }
}

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: number;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextType {
    showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
    showToast: () => { },
});

export function useToast() {
    return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, type, title, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5" />;
            case 'error': return <XCircle className="w-5 h-5" />;
            case 'warning': return <AlertTriangle className="w-5 h-5" />;
            case 'info': return <Info className="w-5 h-5" />;
        }
    };

    const getStyles = (type: ToastType) => {
        switch (type) {
            case 'success': return { bg: '#F0FDF4', border: '#A7F3D0', text: '#065F46', icon: '#059669' };
            case 'error': return { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', icon: '#DC2626' };
            case 'warning': return { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', icon: '#D97706' };
            case 'info': return { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', icon: '#3B82F6' };
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast container */}
            <div className="fixed top-20 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => {
                    const styles = getStyles(toast.type);
                    return (
                        <div
                            key={toast.id}
                            className="pointer-events-auto toast-container"
                            style={{
                                backgroundColor: styles.bg,
                                borderColor: styles.border,
                                border: `1px solid ${styles.border}`,
                            }}
                        >
                            <div className="toast-icon" style={{ color: styles.icon }}>
                                {getIcon(toast.type)}
                            </div>
                            <div className="toast-body">
                                <p className="toast-title" style={{ color: styles.text }}>
                                    {toast.title}
                                </p>
                                {toast.message && (
                                    <p className="toast-message" style={{ color: styles.text }}>
                                        {toast.message}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="toast-close"
                                style={{ color: styles.text }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

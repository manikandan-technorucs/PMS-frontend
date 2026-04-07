import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/forms/Button';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

const VARIANT_STYLES = {
    danger:  { wrap: 'bg-red-50 dark:bg-red-900/20',    icon: 'text-red-500' },
    warning: { wrap: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-500' },
    info:    { wrap: 'bg-brand-teal-50 dark:bg-brand-teal-900/20', icon: 'text-brand-teal-500' },
};

export function ConfirmDialog({
    isOpen, title, message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm, onCancel,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const styles = VARIANT_STYLES[variant];
    const severity = variant === 'info' ? undefined : (variant as 'danger' | 'warning');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative rounded-2xl shadow-[var(--shadow-modal)] max-w-md w-full mx-4 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${styles.wrap} flex items-center justify-center`}>
                            <AlertTriangle className={`w-5 h-5 ${styles.icon}`} />
                        </div>
                        <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">{title}</h3>
                    </div>
                    <Button variant="ghost" size="md" onClick={onCancel} className="rounded-full flex items-center justify-center p-0 w-10">
                        <X className="w-4 h-4 text-slate-400" />
                    </Button>
                </div>
                <div className="px-5 py-4">
                    <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>
                </div>
                <div className="flex justify-end gap-2.5 px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <Button variant="ghost" size="md" onClick={onCancel} className="font-bold">
                        {cancelLabel}
                    </Button>
                    <Button variant={variant === 'danger' ? 'danger' : 'primary'} size="md" onClick={onConfirm} className="font-bold">
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}

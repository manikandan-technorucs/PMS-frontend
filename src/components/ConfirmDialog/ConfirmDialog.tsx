import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';

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

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const colors = {
        danger: { bg: 'bg-red-50', text: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700' },
        warning: { bg: 'bg-yellow-50', text: 'text-yellow-600', btn: 'bg-yellow-600 hover:bg-yellow-700' },
        info: { bg: 'bg-blue-50', text: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700' },
    }[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative rounded-[10px] shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95" style={{ backgroundColor: 'var(--card-bg)' }}>
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-[6px] ${colors.bg} flex items-center justify-center`}>
                            <AlertTriangle className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <h3 className="text-[16px] font-semibold text-theme-primary">{title}</h3>
                    </div>
                    <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100">
                        <X className="w-4 h-4 text-[#6B7280]" />
                    </button>
                </div>
                <div className="px-5 py-4">
                    <p className="text-[14px] text-theme-secondary leading-relaxed">{message}</p>
                </div>
                <div className="flex justify-end gap-3 px-5 py-4 border-t" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                    <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
                    <button onClick={onConfirm}
                        className={`px-4 py-2 text-[13px] font-medium text-white rounded-[6px] transition-colors ${colors.btn}`}
                    >{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}

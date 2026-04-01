import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { Button } from 'primereact/button';

interface EmptyStateProps {
    icon?: ReactNode;
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon,
    title = 'No data found',
    description = 'There are no items to display at this time.',
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-5">
                {icon || <Inbox className="w-7 h-7 text-[#9CA3AF]" />}
            </div>
            <h3 className="text-[16px] font-semibold text-[#374151] mb-1.5">{title}</h3>
            <p className="text-[13px] text-[#6B7280] max-w-sm mb-5">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction} size="small">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}

import React from 'react';
import { UserAvatar } from '@/components/data-display/UserAvatar/UserAvatar';

interface PersonRowProps {
    label: string;
    firstName?: string | null;
    lastName?: string | null;
    fallback?: string;
}

export function PersonRow({ label, firstName, lastName, fallback = 'Unassigned' }: PersonRowProps) {
    const hasName = !!(firstName || lastName);
    return (
        <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                {label}
            </p>
            <div className="flex items-center gap-2.5">
                <UserAvatar firstName={firstName} lastName={lastName} size="md" />
                <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                    {hasName ? `${firstName ?? ''} ${lastName ?? ''}`.trim() : fallback}
                </span>
            </div>
        </div>
    );
}

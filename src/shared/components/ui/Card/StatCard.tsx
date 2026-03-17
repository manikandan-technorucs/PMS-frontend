import React from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    accent?: boolean;
    className?: string;
}

export function StatCard({ label, value, icon, accent = true, className = '' }: StatCardProps) {
    return (
        <div
            className={`rounded-[6px] p-4 shadow-sm hover:shadow-md transition-shadow duration-200 stat-card-base ${accent ? 'border-t-2 border-t-brand-teal-500' : ''} ${className}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[12px] mb-1 uppercase tracking-wider font-medium stat-card-label">{label}</p>
                    <p className="text-[24px] font-bold stat-card-value">{value}</p>
                </div>
                {icon && (
                    <div className="w-10 h-10 rounded-[6px] bg-brand-teal-50 dark:bg-brand-teal-900/30 flex items-center justify-center text-brand-teal-600 dark:text-brand-teal-400">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

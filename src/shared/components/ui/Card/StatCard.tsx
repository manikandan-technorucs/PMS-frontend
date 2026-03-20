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
        <div className={`bg-white dark:bg-slate-900 rounded-xl p-5 flex flex-col justify-between border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden ${className}`}>
            {/* Left Accent Border (Brand Identity) */}
            {accent && <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-brand-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]" />}

            <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                    <p className="text-[11px] mb-2 uppercase tracking-[0.05em] font-extrabold text-slate-400 dark:text-slate-500">{label}</p>
                    <p className="text-[32px] font-black text-slate-900 dark:text-white leading-tight tracking-tight">{value}</p>
                </div>
                {icon && (
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-brand-teal-600 dark:text-brand-teal-400 border border-slate-100 dark:border-slate-700/50 shadow-inner group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                )}
            </div>
            
            {/* Subtle background highlight for brand color */}
            {accent && <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 pointer-events-none" />}
        </div>
    );
}

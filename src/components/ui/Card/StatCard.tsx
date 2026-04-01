import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    className?: string;
}

export function StatCard({ label, value, icon, change, trend, className = '' }: StatCardProps) {
    return (
        <div className={`card-base flex flex-col justify-between hover:shadow-lg hover:border-brand-teal-500/40 transition-all duration-500 group relative overflow-hidden ${className}`}>
            {}
            <div className="absolute top-0 left-0 right-0 h-[3px] opacity-80" style={{ background: 'var(--brand-gradient)' }} />
            {}
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl opacity-[0.06] group-hover:opacity-[0.12] transition-all duration-500" style={{ background: 'var(--brand-gradient)' }} />
            
            <div className="flex items-center justify-between p-5 relative z-10">
                <div className="flex-1">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.06em] text-theme-muted group-hover:text-theme-secondary transition-colors mb-3">{label}</h3>
                    <div className="text-[28px] font-black text-theme-primary tracking-tight leading-none group-hover:scale-[1.02] transition-transform duration-300 origin-left">{value}</div>
                    {change && (
                        <div className="flex items-center gap-1 mt-2">
                            {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
                            {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                            <span className={`text-[12px] font-bold ${
                                trend === 'up' ? 'text-emerald-600' :
                                trend === 'down' ? 'text-red-600' :
                                'text-theme-secondary'
                            }`}>
                                {change}
                            </span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className="text-brand-teal-600 dark:text-brand-teal-400 flex items-center justify-center w-11 h-11 rounded-xl bg-theme-neutral border border-theme-border/40 shadow-sm group-hover:border-brand-teal-500/30 transition-all duration-300 relative overflow-hidden ml-3 flex-shrink-0">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: 'var(--brand-gradient)' }} />
                        <div className="relative z-10">{icon}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

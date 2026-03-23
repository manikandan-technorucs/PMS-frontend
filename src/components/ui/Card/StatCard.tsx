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
        <div className={`card-base p-6 flex flex-col justify-between hover:shadow-lg hover:border-brand-teal-500/40 transition-all duration-500 group relative overflow-hidden ${className}`}>
            {/* Subtle background glow on hover */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-teal-500/5 rounded-full blur-2xl group-hover:bg-brand-teal-500/10 transition-all duration-500" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.05em] text-theme-muted group-hover:text-theme-secondary transition-colors line-clamp-1">{label}</h3>
                {icon && (
                    <div className="text-brand-teal-600 dark:text-brand-teal-400 flex items-center justify-center w-9 h-9 rounded-xl bg-theme-neutral border border-theme-border/40 shadow-sm group-hover:bg-brand-teal-500 group-hover:text-white group-hover:border-brand-teal-500 transition-all duration-300">
                        {icon}
                    </div>
                )}
            </div>
            
            <div className="flex items-end justify-between relative z-10">
                <div className="text-3xl font-bold text-theme-primary tracking-tight group-hover:scale-[1.02] transition-transform duration-300 origin-left">{value}</div>
                
                {change && (
                    <div className="flex flex-col items-end gap-0.5 pb-0.5">
                        <div className="flex items-center gap-1">
                            {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />}
                            {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-[#DC2626]" />}
                            <span className={`text-[12px] font-bold ${
                                trend === 'up' ? 'text-[#16A34A]' : 
                                trend === 'down' ? 'text-[#DC2626]' : 
                                'text-theme-secondary'
                            }`}>
                                {change}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

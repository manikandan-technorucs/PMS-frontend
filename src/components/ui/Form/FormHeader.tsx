import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  
  color?: string;
}

const COLOR_MAP: Record<string, { gradient: string; iconBg: string; iconText: string; border: string }> = {
  emerald: {
    gradient: 'from-emerald-50/50 to-teal-50/50 dark:from-slate-800/40 dark:to-slate-800/20',
    iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm shadow-emerald-200 dark:shadow-none',
    iconText: 'text-white',
    border: 'border-emerald-100 dark:border-slate-700/50',
  },
  blue: {
    gradient: 'from-blue-50/50 to-indigo-50/50 dark:from-slate-800/40 dark:to-slate-800/20',
    iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-sm shadow-blue-200 dark:shadow-none',
    iconText: 'text-white',
    border: 'border-blue-100 dark:border-slate-700/50',
  },
  purple: {
    gradient: 'from-purple-50/50 to-violet-50/50 dark:from-slate-800/40 dark:to-slate-800/20',
    iconBg: 'bg-gradient-to-br from-purple-400 to-violet-500 shadow-sm shadow-purple-200 dark:shadow-none',
    iconText: 'text-white',
    border: 'border-purple-100 dark:border-slate-700/50',
  },
  violet: {
    gradient: 'from-violet-50/50 to-purple-50/50 dark:from-slate-800/40 dark:to-slate-800/20',
    iconBg: 'bg-gradient-to-br from-violet-400 to-purple-500 shadow-sm shadow-violet-200 dark:shadow-none',
    iconText: 'text-white',
    border: 'border-violet-100 dark:border-slate-700/50',
  },
  amber: {
    gradient: 'from-amber-50/50 to-yellow-50/50 dark:from-slate-800/40 dark:to-slate-800/20',
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-200 dark:shadow-none',
    iconText: 'text-white',
    border: 'border-amber-100 dark:border-slate-700/50',
  },
  rose: {
    gradient: 'from-rose-50/50 to-pink-50/50 dark:from-slate-800/40 dark:to-slate-800/20',
    iconBg: 'bg-gradient-to-br from-rose-400 to-pink-500 shadow-sm shadow-rose-200 dark:shadow-none',
    iconText: 'text-white',
    border: 'border-rose-100 dark:border-slate-700/50',
  },
  cyan: {
    gradient: 'from-cyan-50/50 to-sky-50/50 dark:from-slate-800/40 dark:to-slate-800/20',
    iconBg: 'bg-gradient-to-br from-cyan-400 to-sky-500 shadow-sm shadow-cyan-200 dark:shadow-none',
    iconText: 'text-white',
    border: 'border-cyan-100 dark:border-slate-700/50',
  },
  teal: {
    gradient: 'from-teal-50/50 to-emerald-50/50 dark:from-slate-800/40 dark:to-slate-800/20',
    iconBg: 'bg-gradient-to-br from-teal-400 to-emerald-500 shadow-sm shadow-teal-200 dark:shadow-none',
    iconText: 'text-white',
    border: 'border-teal-100 dark:border-slate-700/50',
  },
};

export function FormHeader({ icon: Icon, title, subtitle, color = 'emerald' }: FormHeaderProps) {
  const c = COLOR_MAP[color] || COLOR_MAP.emerald;
  
  return (
    <div className="rounded-xl p-5 mb-6 shadow-sm flex items-center gap-4" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.iconText}`} />
        </div>
        <div>
          <h2 className="text-[17px] font-semibold text-theme-primary">{title}</h2>
          <p className="text-sm text-theme-secondary mt-0.5">{subtitle}</p>
        </div>
    </div>
  );
}

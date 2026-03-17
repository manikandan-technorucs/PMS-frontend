import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** Color theme: 'emerald' | 'blue' | 'purple' | 'violet' | 'amber' | 'rose' | 'cyan' | 'teal' */
  color?: string;
}

const COLOR_MAP: Record<string, { gradient: string; iconBg: string; iconText: string; border: string }> = {
  emerald: {
    gradient: 'from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconText: 'text-emerald-600',
    border: 'border-emerald-100 dark:border-slate-700',
  },
  blue: {
    gradient: 'from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconText: 'text-blue-600',
    border: 'border-blue-100 dark:border-slate-700',
  },
  purple: {
    gradient: 'from-purple-50 to-violet-50 dark:from-slate-800 dark:to-slate-800',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconText: 'text-purple-600',
    border: 'border-purple-100 dark:border-slate-700',
  },
  violet: {
    gradient: 'from-violet-50 to-purple-50 dark:from-slate-800 dark:to-slate-800',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconText: 'text-violet-600',
    border: 'border-violet-100 dark:border-slate-700',
  },
  amber: {
    gradient: 'from-amber-50 to-yellow-50 dark:from-slate-800 dark:to-slate-800',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconText: 'text-amber-600',
    border: 'border-amber-100 dark:border-slate-700',
  },
  rose: {
    gradient: 'from-rose-50 to-pink-50 dark:from-slate-800 dark:to-slate-800',
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconText: 'text-rose-600',
    border: 'border-rose-100 dark:border-slate-700',
  },
  cyan: {
    gradient: 'from-cyan-50 to-sky-50 dark:from-slate-800 dark:to-slate-800',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
    iconText: 'text-cyan-600',
    border: 'border-cyan-100 dark:border-slate-700',
  },
  teal: {
    gradient: 'from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800',
    iconBg: 'bg-teal-100 dark:bg-teal-900/30',
    iconText: 'text-teal-600',
    border: 'border-teal-100 dark:border-slate-700',
  },
};

export function FormHeader({ icon: Icon, title, subtitle, color = 'emerald' }: FormHeaderProps) {
  const c = COLOR_MAP[color] || COLOR_MAP.emerald;
  const borderLeftColor = c.iconText.replace('text-', 'border-l-');
  
  return (
    <div className={`bg-gradient-to-r ${c.gradient} border ${c.border} border-l-[6px] ${borderLeftColor} rounded-xl p-5 mb-6 shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.iconText}`} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-gray-100">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

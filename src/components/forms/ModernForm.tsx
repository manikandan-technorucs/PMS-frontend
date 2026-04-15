import React from 'react';
import { AlertCircle, LucideIcon } from 'lucide-react';
import { classNames } from 'primereact/utils';

export function FieldLabel({ label, required, icon }: { label: string; required?: boolean; icon?: React.ReactNode }) {
    return (
        <label className="flex items-center gap-1.5 text-[11px] font-bold mb-1.5 tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
            {icon && <span className="opacity-60">{icon}</span>}
            {label}
            {required && <span className="text-red-500 font-bold ml-0.5 text-[14px] leading-none">*</span>}
        </label>
    );
}

export function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-medium" style={{ color: 'hsl(0 75% 55%)' }}>
            <AlertCircle size={11} />
            {message}
        </div>
    );
}

export const inputCls = (hasError?: boolean) => classNames(
    'w-full rounded-xl px-3 py-2.5 text-sm transition-all outline-none focus:ring-2',
    hasError
        ? 'border border-red-400 focus:ring-red-200 focus:border-red-500'
        : 'border border-[var(--border-color)] focus:ring-[hsl(160_60%_45%_/_0.2)] focus:border-[hsl(160_60%_45%)]',
);

export function SectionDivider({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-2 col-span-full my-1">
            <div className="h-px flex-1" style={{ background: 'var(--border-color)' }} />
            <span className="text-[10px] font-bold tracking-widest uppercase px-2" style={{ color: 'var(--text-muted)' }}>{title}</span>
            <div className="h-px flex-1" style={{ background: 'var(--border-color)' }} />
        </div>
    );
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1" style={{ background: 'var(--border-color)' }} />
                <span className="text-[11px] font-bold tracking-widest uppercase px-2" style={{ color: 'var(--text-muted)' }}>{title}</span>
                <div className="h-px flex-1" style={{ background: 'var(--border-color)' }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {children}
            </div>
        </div>
    );
}

interface PremiumFormHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  color?: string;
  customGradients?: { bgGlow: string; borderGlow: string; iconGrad: string; iconColor?: string };
}

const COLOR_MAP: Record<string, { bgGlow: string; borderGlow: string; iconGrad: string; iconColor: string }> = {
  emerald: {
    bgGlow: 'linear-gradient(135deg, hsl(150 60% 45% / 0.08), hsl(170 70% 50% / 0.05))',
    borderGlow: '1px solid hsl(150 60% 45% / 0.2)',
    iconGrad: 'linear-gradient(135deg, hsl(150 60% 45%), hsl(170 70% 50%))',
    iconColor: 'text-white'
  },
  blue: {
    bgGlow: 'linear-gradient(135deg, hsl(210 70% 55% / 0.08), hsl(230 80% 60% / 0.05))',
    borderGlow: '1px solid hsl(210 70% 55% / 0.2)',
    iconGrad: 'linear-gradient(135deg, hsl(210 70% 55%), hsl(230 80% 60%))',
    iconColor: 'text-white'
  },
  red: {
    bgGlow: 'linear-gradient(135deg, hsl(0 70% 55% / 0.08), hsl(30 90% 55% / 0.05))',
    borderGlow: '1px solid hsl(0 70% 55% / 0.2)',
    iconGrad: 'linear-gradient(135deg, hsl(0 70% 55%), hsl(20 85% 55%))',
    iconColor: 'text-white'
  },
  cyan: {
    bgGlow: 'linear-gradient(135deg, hsl(160 60% 45% / 0.1), hsl(200 70% 50% / 0.06))',
    borderGlow: '1px solid hsl(160 60% 45% / 0.25)',
    iconGrad: 'linear-gradient(135deg, #0CD1C3, #B3F57B)',
    iconColor: 'text-slate-900'
  },
  violet: {
    bgGlow: 'linear-gradient(135deg, hsl(270 70% 60% / 0.1), hsl(290 65% 55% / 0.06))',
    borderGlow: '1px solid hsl(270 70% 60% / 0.25)',
    iconGrad: 'linear-gradient(135deg, hsl(270 70% 60%), hsl(290 65% 55%))',
    iconColor: 'text-white'
  },
  purple: {
    bgGlow: 'linear-gradient(135deg, hsl(260 80% 60% / 0.1), hsl(280 75% 55% / 0.06))',
    borderGlow: '1px solid hsl(260 80% 60% / 0.25)',
    iconGrad: 'linear-gradient(135deg, hsl(260 80% 60%), hsl(280 75% 55%))',
    iconColor: 'text-white'
  },
  teal: {
    bgGlow: 'linear-gradient(135deg, hsl(175 70% 45% / 0.1), hsl(190 65% 50% / 0.06))',
    borderGlow: '1px solid hsl(175 70% 45% / 0.25)',
    iconGrad: 'linear-gradient(135deg, hsl(175 70% 45%), hsl(190 65% 50%))',
    iconColor: 'text-white'
  },
  indigo: {
    bgGlow: 'linear-gradient(135deg, hsl(230 80% 60% / 0.1), hsl(250 75% 55% / 0.06))',
    borderGlow: '1px solid hsl(230 80% 60% / 0.25)',
    iconGrad: 'linear-gradient(135deg, hsl(230 80% 60%), hsl(250 75% 55%))',
    iconColor: 'text-white'
  }
};

export function PremiumFormHeader({ icon: Icon, title, subtitle, color = 'emerald', customGradients }: PremiumFormHeaderProps) {
  const c = customGradients || COLOR_MAP[color] || COLOR_MAP.emerald;
  return (
        <div className="flex items-center gap-4 mb-8 p-5 rounded-2xl" style={{
            background: c.bgGlow,
            border: c.borderGlow,
        }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: c.iconGrad }}>
                <Icon size={22} className={c.iconColor || 'text-white'} />
            </div>
            <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
            </div>
        </div>
  );
}

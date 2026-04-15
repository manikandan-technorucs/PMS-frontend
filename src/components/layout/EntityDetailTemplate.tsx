import React, { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StatCard, StatCardProps } from '@/components/data-display/StatCard';
import { motion } from 'framer-motion';

const DETAIL_COLOR_MAP: Record<string, { bgGlow: string; shadow: string; iconBg: string }> = {
  emerald: {
    bgGlow: 'linear-gradient(135deg, hsl(150 60% 45%), hsl(170 70% 40%))',
    shadow: '0 8px 24px -4px rgba(16, 185, 129, 0.35)',
    iconBg: 'bg-white/20'
  },
  blue: {
    bgGlow: 'linear-gradient(135deg, hsl(210 70% 55%), hsl(230 80% 60%))',
    shadow: '0 8px 24px -4px rgba(59, 130, 246, 0.35)',
    iconBg: 'bg-white/20'
  },
  red: {
    bgGlow: 'linear-gradient(135deg, hsl(0 70% 55%), hsl(20 85% 55%))',
    shadow: '0 8px 24px -4px rgba(239, 68, 68, 0.35)',
    iconBg: 'bg-white/20'
  },
  cyan: {
    bgGlow: 'linear-gradient(135deg, #0CD1C3, #B3F57B)',
    shadow: '0 8px 24px -4px rgba(12, 209, 195, 0.35)',
    iconBg: 'bg-slate-900/10 text-slate-900 border-none'
  }
};

export interface EntityDetailTemplateProps {
  title: string;
  subtitle?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  badges?: ReactNode[];
  metadata?: ReactNode[];
  progressPercent?: number;
  users?: any[];
  headerActions?: ReactNode;
  actions?: ReactNode;
  stats?: StatCardProps[] | any[];
  tabs?: { label: string; id?: string }[];
  color?: 'emerald' | 'blue' | 'red' | 'cyan';
  children: ReactNode;
}

export function EntityDetailTemplate({
  title,
  subtitle,
  icon,
  badge,
  badges,
  metadata,
  progressPercent,
  users,
  headerActions,
  actions,
  stats,
  tabs,
  color = 'emerald',
  children,
}: EntityDetailTemplateProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabLabel = searchParams.get('tab') || (tabs && tabs.length > 0 ? tabs[0].label : null);
  const theme = DETAIL_COLOR_MAP[color] || DETAIL_COLOR_MAP.emerald;


  const isDarkText = color === 'cyan';
  const textColor = isDarkText ? 'text-slate-900' : 'text-white';
  const subtitleColor = isDarkText ? 'text-slate-700' : 'text-slate-100/90';

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {}
      <div
        className="flex-shrink-0 relative overflow-hidden rounded-2xl mb-5"
        style={{
          background: theme.bgGlow,
          boxShadow: theme.shadow,
        }}
      >
        {}
        <div
          className={`absolute inset-0 opacity-20 pointer-events-none ${isDarkText ? 'mix-blend-multiply' : 'mix-blend-overlay'}`}
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 80% 50%, #ffffff 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">

          {}
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            {icon && (
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-white/20 backdrop-blur-sm ${theme.iconBg} ${textColor}`}>
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h2 className={`text-[17px] font-black leading-tight truncate ${textColor}`}>
                {title}
              </h2>
              {subtitle && (
                <p className={`text-[13px] font-medium mt-0.5 truncate ${subtitleColor}`}>
                  {subtitle}
                </p>
              )}
              {badge && (
                <div className="mt-1">
                  {badge as React.ReactElement}
                </div>
              )}
              {}
              {badges && badges.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {badges.map((b, i) => (
                    <React.Fragment key={i}>{b}</React.Fragment>
                  ))}
                </div>
              )}
              {}
              {metadata && metadata.length > 0 && (
                <div className="hidden sm:flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-semibold text-slate-800/80">
                  {metadata.map((m, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-md"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {}
          <div className="flex items-center gap-4 flex-shrink-0">
            {progressPercent !== undefined && progressPercent >= 0 && (
              <div className="hidden sm:flex flex-col items-end gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-800/70">
                  Progress
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-28 h-1.5 rounded-full bg-black/10 overflow-hidden">
                    <motion.div
                      className="h-full bg-slate-900/40 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-[12px] font-black text-slate-900 tabular-nums w-9">
                    {progressPercent}%
                  </span>
                </div>
              </div>
            )}

            {users && users.length > 0 && (
              <div className="flex -space-x-2">
                {users.slice(0, 5).map((u, i) => (
                  <div
                    key={u.id || i}
                    className="w-8 h-8 rounded-full bg-white/30 border-2 border-white/60 flex items-center justify-center text-[10px] font-black text-slate-900 flex-shrink-0"
                    title={`${u.first_name || ''} ${u.last_name || ''}`}
                  >
                    {u.first_name?.[0]}{u.last_name?.[0]}
                  </div>
                ))}
                {users.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-[9px] font-black text-slate-800">
                    +{users.length - 5}
                  </div>
                )}
              </div>
            )}

            {headerActions && <div>{headerActions}</div>}
            {actions && <div>{actions}</div>}
          </div>
        </div>
      </div>

      {}
      {stats && stats.length > 0 && (
        <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          {stats.map((s, idx) => (
            <StatCard key={idx} {...s} />
          ))}
        </div>
      )}

      {}
      {tabs && tabs.length > 0 && (
        <div
          className="flex-shrink-0 flex items-center gap-0.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px mb-5"
          style={{ scrollbarWidth: 'none' }}
        >
          {tabs.map((tab) => {
            const isActive = tab.label === currentTabLabel;
            return (
              <button
                key={tab.label}
                onClick={() => setSearchParams({ tab: tab.label }, { replace: true })}
                className={[
                  'relative pb-3 pt-1 px-4 text-[13px] font-semibold whitespace-nowrap bg-transparent border-0 cursor-pointer outline-none transition-colors duration-150',
                  isActive
                    ? 'text-brand-teal-600 dark:text-brand-teal-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200',
                ].join(' ')}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="entityDetailActiveTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-teal-500 rounded-t-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {}
      <div
        className="flex-1 min-h-0 overflow-y-auto pb-8"
        style={{ scrollbarWidth: 'thin' }}
      >
        {children}
      </div>
    </div>
  );
}

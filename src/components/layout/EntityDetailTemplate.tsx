import React, { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StatCard, StatCardProps } from '@/components/data-display/StatCard';
import { motion } from 'framer-motion';

export interface EntityDetailTemplateProps {
  /** Entity's display name — shown in the hero banner */
  title: string;
  /** Small icon inside the coloured icon box */
  icon?: ReactNode;
  /** Status / priority badges rendered in the banner */
  badges?: ReactNode[];
  /** Short metadata chips (client, dates, IDs…) */
  metadata?: ReactNode[];
  /** 0-100, renders a slim progress bar in the banner */
  progressPercent?: number;
  /** User objects { id, first_name, last_name } for avatar stack */
  users?: any[];
  /** Extra action buttons placed right of the avatar stack */
  headerActions?: ReactNode;
  /** Always-visible KPI stat cards — keep stable across tabs */
  stats?: StatCardProps[];
  /** Tab definitions */
  tabs: { label: string; id?: string }[];
  children: ReactNode;
}

export function EntityDetailTemplate({
  title,
  icon,
  badges,
  metadata,
  progressPercent,
  users,
  headerActions,
  stats,
  tabs,
  children,
}: EntityDetailTemplateProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabLabel = searchParams.get('tab') || tabs[0]?.label;

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Hero Banner ─────────────────────────────────────────────────
          Always visible – no layout shift when tabs change.
          Gradient strip carries entity identity and key metadata.       */}
      <div
        className="flex-shrink-0 relative overflow-hidden rounded-2xl mb-5"
        style={{
          background: 'var(--brand-gradient)',
          boxShadow: '0 8px 24px -4px rgba(12, 209, 195, 0.25)',
        }}
      >
        {/* ambient glow */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 80% 50%, #ffffff 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">

          {/* Left — icon + title + meta */}
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-white/25 border border-white/40 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-sm text-slate-900">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-[17px] font-black text-slate-900 leading-tight truncate">
                {title}
              </h2>
              {/* badges */}
              {badges && badges.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {badges.map((b, i) => (
                    <React.Fragment key={i}>{b}</React.Fragment>
                  ))}
                </div>
              )}
              {/* metadata chips */}
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

          {/* Right — progress + avatars + actions */}
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
          </div>
        </div>
      </div>

      {/* ── KPI Stats Row ───────────────────────────────────────────────
          Rendered only when stats are provided.
          Keep stats FIXED (project-level) — don't swap per-tab.         */}
      {stats && stats.length > 0 && (
        <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {stats.map((s, idx) => (
            <StatCard key={idx} {...s} />
          ))}
        </div>
      )}

      {/* ── Tab Bar ─────────────────────────────────────────────────── */}
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

      {/* ── Tab Content ─────────────────────────────────────────────── */}
      <div
        className="flex-1 min-h-0 overflow-y-auto pb-8"
        style={{ scrollbarWidth: 'thin' }}
      >
        {children}
      </div>
    </div>
  );
}

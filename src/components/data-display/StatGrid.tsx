import React from 'react';
import { StatCard, StatCardProps } from '@/components/data-display/StatCard';

export interface StatItem {
  id: string;
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  accentVariant?: StatCardProps['accentVariant'];
  isLoading?: boolean;
}

export interface StatGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4 | 5;
}

const COL_CLASS: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 md:grid-cols-3 xl:grid-cols-5',
};

export const StatGrid: React.FC<StatGridProps> = ({ stats, columns = 4 }) => {
  return (
    <div className={`grid ${COL_CLASS[columns]} gap-5`}>
      {stats.map((stat) =>
        stat.isLoading ? (
          <div
            key={stat.id}
            className="h-[130px] rounded-3xl bg-slate-100 dark:bg-slate-800/50 animate-pulse"
          />
        ) : (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            trend={stat.trend}
            accentVariant={stat.accentVariant}
          />
        )
      )}
    </div>
  );
};

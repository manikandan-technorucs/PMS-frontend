import React from 'react';
import { Skeleton } from 'primereact/skeleton';

export interface StatItem {
  id: string;
  label: string;
  value: string | number;
  icon: string;
  trend?: number; 
  isLoading?: boolean;
}

export interface StatGridProps {
  stats: StatItem[];
}

export const StatGrid: React.FC<StatGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
      {stats.map((stat) => (
        <div 
          key={stat.id} 
          className="bg-white rounded-[0.75rem] p-5 shadow-sm border border-gray-100 flex items-center transition-all hover:shadow-md"
        >
          <div className="flex-shrink-0 mr-4">
            <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <i className={`${stat.icon} text-xl`} />
            </div>
          </div>
          <div className="flex-grow">
            {stat.isLoading ? (
              <>
                <Skeleton width="60%" className="mb-2 rounded-[0.75rem]" />
                <Skeleton width="40%" height="2rem" className="rounded-[0.75rem]" />
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                  {stat.trend !== undefined && (
                    <span className={`text-sm font-semibold mb-1 ml-2 ${stat.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.trend > 0 ? '+' : ''}{stat.trend}%
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

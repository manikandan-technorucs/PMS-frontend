import React, { ReactNode } from 'react';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { StatCard, StatCardProps } from '@/components/data-display/StatCard';
import { Button } from '@/components/forms/Button';
import { Filter } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { FilterPanel } from './FilterPanel';

export interface EntityPageTemplateProps {
  title: string;
  headerActions?: ReactNode;
  
  
  stats?: StatCardProps[];
  
  
  filterGroups?: any[];
  selectedFilters?: Record<string, string[]>;
  onFilterChange?: (groupId: string, value: string) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  activeFilterCount?: number;
  
  utilityBarExtra?: ReactNode; 
  
  
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  getTabCount?: (tab: string) => number | string;
  
  
  children: ReactNode;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export const EntityPageTemplate: React.FC<EntityPageTemplateProps> = ({
  title,
  headerActions,
  stats,
  filterGroups,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  activeFilterCount = 0,
  utilityBarExtra,
  tabs,
  activeTab,
  onTabChange,
  getTabCount,
  children
}) => {
  const [showFilters, setShowFilters] = React.useState(true);

  return (
    <PageLayout
      title={title}
      isFullHeight
      actions={
        <div className="flex items-center gap-3">
          {utilityBarExtra}
          {filterGroups && (
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-lg whitespace-nowrap"
            >
              <Filter size={14} className="mr-1.5" />
              {showFilters ? 'Hide Filters' : 'Filters'}
              {hasActiveFilters && activeFilterCount > 0 && !showFilters && (
                <span className="ml-1.5 w-4 h-4 rounded-full bg-white text-brand-teal-700 text-[9px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          )}
          {(headerActions || utilityBarExtra || filterGroups) && headerActions && (
             <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 border-r border-transparent"></div>
          )}
          {headerActions}
        </div>
      }
    >
      <div className="h-full flex flex-col space-y-6 overflow-hidden">
        
        {}
        {stats && stats.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 flex-shrink-0"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {stats.map((stat, i) => (
              <motion.div key={i} variants={itemVariants} className="h-full">
                <StatCard {...stat} className="h-full" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {}
          {tabs && tabs.length > 0 && onTabChange && (
             <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar pb-px flex-shrink-0">
                {tabs.map(tab => {
                   const isActive = activeTab === tab;
                   return (
                     <button
                       key={tab}
                       onClick={() => onTabChange(tab)}
                       className={[
                         'pb-3 pt-2 px-2 text-[14px] font-bold whitespace-nowrap relative transition-colors bg-transparent border-0 cursor-pointer outline-none flex items-center gap-2.5',
                         isActive
                           ? 'text-brand-teal-600 dark:text-brand-teal-400'
                           : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
                       ].join(' ')}
                     >
                       {tab}
                       {getTabCount && (
                           <span className={`text-[11px] font-black px-2 py-0.5 rounded-full transition-colors ${isActive ? 'bg-brand-teal-50 dark:bg-brand-teal-900/30 text-brand-teal-700 dark:text-brand-teal-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                             {getTabCount(tab)}
                           </span>
                       )}
                       {isActive && <motion.div layoutId="entityPageActiveTabIndicator" className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-teal-500 rounded-t-full" />}
                     </button>
                   );
                })}
             </div>
          )}

        {}
        <div className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[var(--shadow-premium)] relative flex">
          {filterGroups && selectedFilters && onFilterChange && onClearFilters && showFilters && (
            <FilterPanel 
              groups={filterGroups}
              selectedFilters={selectedFilters}
              onFilterChange={onFilterChange}
              onClear={onClearFilters}
              className="w-[260px] flex-shrink-0"
            />
          )}
          <div className="flex-1 overflow-hidden relative">
            {children}
          </div>
        </div>
        
      </div>
    </PageLayout>
  );
};

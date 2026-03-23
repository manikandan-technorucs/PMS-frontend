import React from 'react';
import { Skeleton } from 'primereact/skeleton';

export interface DetailViewTemplateProps {
  title: string;
  subtitle?: string;
  mainContent: React.ReactNode;
  sidebarContent: React.ReactNode;
  headerActions?: React.ReactNode;
  isLoading?: boolean;
}

export const DetailViewTemplate: React.FC<DetailViewTemplateProps> = ({
  title,
  subtitle,
  mainContent,
  sidebarContent,
  headerActions,
  isLoading = false
}) => {
  return (
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          {isLoading ? (
            <>
              <Skeleton width="200px" height="2.5rem" className="mb-2 rounded-[0.75rem]" />
              <Skeleton width="150px" className="rounded-[0.75rem]" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
              {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
            </>
          )}
        </div>
        {headerActions && !isLoading && (
          <div className="flex items-center gap-3">
            {headerActions}
          </div>
        )}
      </div>

      {/* 70/30 Split Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content (70%) */}
        <div className="flex-1 lg:w-2/3 xl:w-8/12">
          <div className="bg-white rounded-[0.75rem] shadow-sm border border-gray-100 p-6 min-h-[400px]">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton width="100%" height="2rem" className="rounded-[0.75rem]" />
                <Skeleton width="100%" height="8rem" className="rounded-[0.75rem]" />
                <Skeleton width="80%" height="2rem" className="rounded-[0.75rem]" />
                <Skeleton width="100%" height="6rem" className="rounded-[0.75rem]" />
              </div>
            ) : (
              mainContent
            )}
          </div>
        </div>

        {/* Sidebar Content (30%) */}
        <div className="w-full lg:w-1/3 xl:w-4/12 shrink-0">
          <div className="bg-gray-50 rounded-[0.75rem] shadow-sm border border-gray-200 p-5 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200">
              Metadata & Attributes
            </h3>
            {isLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton width="40%" height="1rem" className="mb-2 rounded-[0.75rem]" />
                    <Skeleton width="70%" height="1.5rem" className="rounded-[0.75rem]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {sidebarContent}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

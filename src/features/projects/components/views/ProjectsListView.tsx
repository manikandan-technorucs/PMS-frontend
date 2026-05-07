import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EntityPageTemplate } from '@/components/layout/EntityPageTemplate';
import { Button } from '@/components/forms/Button';
import { SegmentedControl } from '@/components/forms/SegmentedControl';
import { StatCardProps } from '@/components/data-display/StatCard';
import { Search, Plus, FolderKanban, CheckCircle, Clock, Download, LayoutGrid, List as ListIcon, AlertTriangle, X } from 'lucide-react';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { exportToCSV } from '@/utils/export';
import { Project } from '@/features/projects/api/projects.api';
import { ProjectListTable } from '../ui/ProjectListTable';
import { TableSkeleton } from '@/components/feedback/Skeleton/TableSkeleton';
import { useStatuses, usePriorities, useUsersDropdown } from '@/features/masters/hooks/useMasters';
import { useFilters } from '@/hooks/useFilters';
import { useAuth } from '@/auth/AuthProvider';
import { can } from '@/utils/permissions';
import { ProjectKanbanBoard } from '../ui/ProjectKanbanBoard';
import { useDebounce } from '@/hooks/useDebounce';
import { InputText } from 'primereact/inputtext';
import { LazyParams } from '@/components/data-display/DataTable';

export function ProjectsListView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Active Projects');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [lazyParams, setLazyParams] = useState<LazyParams>({ first: 0, rows: 20, page: 0 });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const {
    selectedFilters, handleFilterChange, clearFilters, hasActiveFilters,
  } = useFilters();

  const { data: allUsers = [] } = useUsersDropdown();
  const { data: statuses = [] } = useStatuses();
  const { data: priorities = [] } = usePriorities();

  const queryParams = useMemo(() => ({
    skip: lazyParams.first,
    limit: lazyParams.rows,
    status_id: selectedFilters.status?.map(Number),
    priority_id: selectedFilters.priority?.map(Number),
    manager_emails: selectedFilters.manager,
    search: debouncedSearch || undefined,
    is_template: activeTab === 'Project Templates' ? true : false,
    is_archived: false,
    is_group: false,
  }), [lazyParams, selectedFilters, debouncedSearch, activeTab]);

  const { data: projectsData, isLoading } = useProjects(queryParams);
  // Backend returns a list or a dict with items/total. Handling both for safety.
  const projects: Project[] = Array.isArray(projectsData) ? projectsData : (projectsData as any)?.items || [];
  const totalRecords: number = (projectsData as any)?.total || projects.length;

  const tabs = ['Active Projects', 'Project Templates'];

  const filterGroups = [
    {
      id: 'status',
      label: 'Status',
      options: statuses.map(s => ({ label: s.label || s.name, value: s.id.toString() })),
    },
    { id: 'priority', label: 'Priority', options: priorities.map(p => ({ label: p.label || p.name, value: p.id.toString() })) },
    { id: 'manager', label: 'Manager', options: allUsers.map(u => ({ label: `${u.first_name} ${u.last_name}`, value: u.email })) },
  ];

  const statsProps = useMemo(() => {
    if (isLoading && !projectsData) return [];
    const counts = { total: projects.length, active: 0, completed: 0, planning: 0 };
    projects.forEach((p: any) => {
      const s = (p.status_master?.name || '').toLowerCase();
      if (['completed', 'closed', 'cancelled'].includes(s)) counts.completed++;
      else if (s.includes('planning')) counts.planning++;
      else counts.active++;
    });

    return [
      { label: 'Total Visible', value: counts.total, icon: <FolderKanban size={18} strokeWidth={2} />, accentVariant: 'teal' },
      { label: 'Active', value: counts.active, icon: <Clock size={18} strokeWidth={2} />, accentVariant: 'teal' },
      { label: 'Completed', value: counts.completed, icon: <CheckCircle size={18} strokeWidth={2} />, accentVariant: 'teal' },
      { label: 'Planning', value: counts.planning, icon: <AlertTriangle size={18} strokeWidth={2} />, accentVariant: 'amber' },
    ] as StatCardProps[];
  }, [projects, isLoading, projectsData]);

  const handleExport = () => exportToCSV(projects, 'projects.csv', [
    { key: 'public_id', header: 'Project ID' },
    { key: 'project_name', header: 'Project Name' },
    { key: 'client_name', header: 'Client' },
    { key: 'expected_start_date', header: 'Start Date' },
    { key: 'expected_end_date', header: 'End Date' },
  ]);

  return (
    <EntityPageTemplate
      title="Projects"
      stats={statsProps}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      getTabCount={(tab) => tab === activeTab ? totalRecords : '—'}
      loading={isLoading}
      filterGroups={filterGroups}
      selectedFilters={selectedFilters}
      onFilterChange={handleFilterChange}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      activeFilterCount={Object.values(selectedFilters).flat().length}
      utilityBarExtra={
        <div className="flex items-center gap-3 w-full">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-teal-500 transition-colors" size={16} />
            <InputText
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects by ID, Name or Client..."
              className="w-full pl-10 pr-10 h-10 border-none bg-slate-50 dark:bg-slate-800/50 rounded-xl text-[13.5px] focus:ring-2 focus:ring-brand-teal-500/20 transition-all"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
             <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mr-2">View Mode</span>
             <SegmentedControl
              value={view}
              onChange={(v) => setView(v as 'list' | 'kanban')}
              options={[
                { label: 'List', value: 'list', icon: <ListIcon size={13} strokeWidth={2.5} /> },
                { label: 'Kanban', value: 'kanban', icon: <LayoutGrid size={13} strokeWidth={2.5} /> },
              ]}
            />
          </div>
        </div>
      }
      headerActions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            className="!w-9 !h-9 !p-0 !rounded-xl"
            title="Export CSV"
          >
            <Download size={15} strokeWidth={2.5} />
          </Button>
          {can.createProject(user?.role?.name) && (
            <Button
              onClick={() => navigate('/projects/create')}
              size="sm"
              className="shadow-brand-teal-500/25 ml-2"
            >
              <Plus size={15} /> New Project
            </Button>
          )}
        </div>
      }
    >
      {view === 'kanban' ? (
        <ProjectKanbanBoard projects={projects} />
      ) : (
        <div className="h-full flex flex-col min-h-0">
          {isLoading && !projectsData ? (
             <div className="p-4 h-full"><TableSkeleton rows={6} columns={8} /></div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={<FolderKanban />}
              title="No projects found"
              description={hasActiveFilters || search ? "Try adjusting your filters or search to see more projects." : "Get started by creating your first project."}
              action={(!hasActiveFilters && !search) && (
                <Button variant="primary" onClick={() => navigate('/projects/create')} className="!h-10 !px-5"><Plus size={15} /> New Project</Button>
              )}
            />
          ) : (
            <ProjectListTable 
              projects={projects} 
              loading={isLoading}
              lazy={true}
              paginator={true}
              totalRecords={totalRecords}
              onPage={(e) => setLazyParams(e)}
              first={lazyParams.first}
              rows={lazyParams.rows}
            />
          )}
        </div>
      )}
    </EntityPageTemplate>
  );
}

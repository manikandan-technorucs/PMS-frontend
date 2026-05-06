import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EntityPageTemplate } from '@/components/layout/EntityPageTemplate';
import { Button } from '@/components/forms/Button';
import { SegmentedControl } from '@/components/forms/SegmentedControl';
import { StatCardProps } from '@/components/data-display/StatCard';
import { Plus, FolderKanban, CheckCircle, Clock, Download, LayoutGrid, List as ListIcon, AlertTriangle } from 'lucide-react';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { exportToCSV } from '@/utils/export';
import { Project } from '@/features/projects/api/projects.api';
import { Card } from '@/components/layout/Card';
import { Badge } from '@/components/data-display/Badge';
import { ProjectListTable } from '../ui/ProjectListTable';
import { TableSkeleton } from '@/components/feedback/Skeleton/TableSkeleton';
import { FilterSidebar } from '@/components/layout/FilterSidebar';
import { useStatuses, usePriorities, useUsersDropdown } from '@/features/masters/hooks/useMasters';
import { useFilters } from '@/hooks/useFilters';
import { useAuth } from '@/auth/AuthProvider';
import { can } from '@/utils/permissions';
import { motion } from 'framer-motion';
import { ProjectKanbanBoard } from '../ui/ProjectKanbanBoard';

export function ProjectsListView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Active Projects');
  const [view, setView] = useState<'list' | 'kanban'>('list');

  const {
    showFilters, selectedFilters, openFilters, closeFilters,
    handleFilterChange, clearFilters, hasActiveFilters, isMatch,
  } = useFilters();

  const { data: allUsers = [] } = useUsersDropdown();
  const { data: statuses = [] } = useStatuses();
  const { data: priorities = [] } = usePriorities();

  const filterGroups = [
    {
      id: 'status',
      label: 'Status',
      options: statuses
        .filter(s => ['Active', 'Planning', 'In Progress', 'Completed', 'On Hold', 'Closed', 'Cancelled'].includes(s.name || s.label))
        .map(s => ({ label: s.label || s.name, value: s.label || s.name })),
    },
    { id: 'priority', label: 'Priority', options: priorities.map(p => ({ label: p.label || p.name, value: p.label || p.name })) },
    { id: 'manager', label: 'Manager', options: allUsers.map(u => ({ label: `${u.first_name} ${u.last_name}`, value: u.email })) },
  ];

  const { data: projectsData = [], isLoading } = useProjects();
  const projects: Project[] = Array.isArray(projectsData) ? projectsData : [];

  const tabs = ['Active Projects', 'Project Templates'];

  const filterByTab = (tab: string) => {
    if (tab === 'Active Projects')   return projects.filter((p: any) => !p.is_archived && !p.is_template && !p.is_group);
    if (tab === 'Project Templates') return projects.filter((p: any) => p.is_template);
    return projects;
  };

  const getTabCount = (tab: string) => filterByTab(tab).length;

  const statsProps = useMemo(() => {
    const counts = { total: projects.length, active: 0, completed: 0, planning: 0 };
    projects.forEach((p: any) => {
      const statusObj = p.status_master || (typeof p.status === 'object' ? p.status : null);
      const s = (statusObj?.label || statusObj?.name || (typeof p.status === 'string' ? p.status : '') || '').toLowerCase();
      
      if (s === 'completed' || s === 'closed' || s === 'cancelled') counts.completed++;
      else if (s.includes('planning')) counts.planning++;
      else counts.active++;
    });
    
    if (isLoading) return [];
    return [
      { label: 'Total Projects',  value: counts.total,     icon: <FolderKanban size={18} strokeWidth={2} />, accentVariant: 'teal' },
      { label: 'Active',          value: counts.active,    icon: <Clock        size={18} strokeWidth={2} />, accentVariant: 'teal' },
      { label: 'Completed',       value: counts.completed, icon: <CheckCircle  size={18} strokeWidth={2} />, accentVariant: 'teal' },
      { label: 'Planning',        value: counts.planning,  icon: <AlertTriangle size={18} strokeWidth={2}/>, accentVariant: 'amber' },
    ] as StatCardProps[];
  }, [projects, isLoading]);

  const filteredProjects = useMemo(() => {
    return filterByTab(activeTab)
        .filter((p: any) => isMatch({
           status: p.status_master?.label || p.status_master?.name || (typeof p.status === 'string' ? p.status : p.status?.id),
           priority: p.priority_master?.label || p.priority_master?.name || (typeof p.priority === 'string' ? p.priority : p.priority?.id),
           manager: p.manager_email,
        }))
        .filter((p: any) => {
            return true;
        });
  }, [activeTab, projects, isMatch]);

  const [displayedProjects, setDisplayedProjects] = useState<Project[]>([]);
  
  useEffect(() => {
    setDisplayedProjects(filteredProjects);
  }, [filteredProjects]);

  const handleExport = () => exportToCSV(displayedProjects, 'projects.csv', [
    { key: 'public_id', header: 'Project ID' },
    { key: 'project_name',      header: 'Project Name' },
    { key: 'client_name',    header: 'Client' },
    { key: 'expected_start_date',header: 'Start Date' },
    { key: 'expected_end_date',  header: 'End Date' },
  ]);

  return (
    <EntityPageTemplate
      title="Projects"
      stats={statsProps}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      getTabCount={getTabCount}
      loading={isLoading}
      filterGroups={filterGroups}
      selectedFilters={selectedFilters}
      onFilterChange={handleFilterChange}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      activeFilterCount={Object.values(selectedFilters).flat().length}
      headerActions={
        <div className="flex items-center gap-2">
          <SegmentedControl
            value={view}
            onChange={(v) => setView(v as 'list' | 'kanban')}
            options={[
              { label: 'List', value: 'list', icon: <ListIcon size={13} strokeWidth={2.5} /> },
              { label: 'Kanban', value: 'kanban', icon: <LayoutGrid size={13} strokeWidth={2.5} /> },
            ]}
          />
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/50 mx-1" />
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
      {isLoading ? (
        <div className="p-4 h-full"><TableSkeleton rows={6} columns={8} /></div>
      ) : view === 'kanban' ? (
        <ProjectKanbanBoard projects={filteredProjects} />
      ) : (
        <ProjectListTable projects={filteredProjects} onValueChange={setDisplayedProjects} />
      )}
    </EntityPageTemplate>
  );
}

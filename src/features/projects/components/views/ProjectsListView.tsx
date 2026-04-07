import React, { useState, useMemo } from"react";
import { useNavigate } from"react-router-dom";
import { PageLayout } from"@/layouts/PageWrapper/PageLayout";
import { TableSkeleton } from"@/components/ui/Skeleton/TableSkeleton";
import { Button } from"primereact/button";
import { DataTable, Column } from"@/components/DataTable/DataTable";
import { StatusBadge } from"@/components/ui/Badge/StatusBadge";
import {
  Plus, FolderKanban, CheckCircle, Clock, Download,
  LayoutGrid, List as ListIcon, Users, ArrowUpRight,
  AlertTriangle, Filter, Calendar
} from"lucide-react";
import { useProjects } from '@/features/projects/hooks/useProjects';
import { exportToCSV } from"@/utils/export";
import { Project } from"@/features/projects/services/projects.api";
import { ProjectCard } from"./ProjectCard";
import { FilterSidebar } from"@/components/ui/FilterSidebar";
import { useStatuses, usePriorities, useUsers } from"@/hooks/useMasterData";
import { useFilters } from"@/hooks/useFilters";
import { useAuth } from '@/auth/AuthProvider';
import { can } from '@/utils/permissions';

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="card-base p-5 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-80" style={{ background: 'var(--brand-gradient)' }} />
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-800/40">
          <div className="relative z-10">{icon}</div>
        </div>
      </div>
      <div>
        <p className="text-[28px] font-black leading-none text-slate-800 dark:text-white mb-1">{value}</p>
        <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export function ProjectsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Active Projects");
  const [view, setView] = useState<'list' | 'grid'>('list');
  const {
    showFilters, selectedFilters, openFilters, closeFilters,
    handleFilterChange, clearFilters, hasActiveFilters, isMatch,
  } = useFilters();

  const { data: allUsers = [] } = useUsers();
  const { data: statuses = [] } = useStatuses();
  const { data: priorities = [] } = usePriorities();

  const filterGroups = [
    { id: 'status', label: 'Status', options: statuses.map(s => ({ label: s.name, value: s.id.toString() })) },
    { id: 'priority', label: 'Priority', options: priorities.map(p => ({ label: p.name, value: p.id.toString() })) },
    { id: 'manager', label: 'Manager', options: allUsers.map(u => ({ label: `${u.first_name} ${u.last_name}`, value: u.email })) },
  ];

  const { data: projectsData = [], isLoading } = useProjects();
  const projects = Array.isArray(projectsData) ? projectsData : [];

  const tabs = ["Active Projects", "Project Templates", "Project Groups", "Archived Projects"];

  const filterByTab = (tab: string) => {
    if (tab === "Active Projects")    return projects.filter((p: any) => !p.is_archived && !p.is_template && !p.is_group);
    if (tab === "Project Templates") return projects.filter((p: any) => p.is_template);
    if (tab === "Project Groups")    return projects.filter((p: any) => p.is_group);
    if (tab === "Archived Projects") return projects.filter((p: any) => p.is_archived);
    return projects;
  };

  const columns: Column<Project>[] = [
    {
      key:"public_id", header:"ID", sortable: true,
      render: (_, row) => (
        <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg font-bold">
          {row.public_id || `PRJ-${row.id}`}
        </span>
      ),
    },
    {
      key:"name", header:"Project Name", sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 flex-shrink-0 border border-teal-100 dark:border-teal-800/40">
            <FolderKanban className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-bold text-[14px] text-slate-800 dark:text-slate-100 group-hover:text-teal-600 transition-colors">{row.name}</p>
            {row.client && <p className="text-[11px] text-slate-400 font-medium">{row.client}</p>}
          </div>
        </div>
      )
    },
    {
      key:"status", header:"Status", sortable: true,
      render: (_, row) => <StatusBadge status={row.status?.name ||"Unknown"} variant="status" />
    },
    {
      key:"priority", header:"Priority", sortable: true,
      render: (_, row) => <StatusBadge status={row.priority?.name ||"Unknown"} variant="priority" />
    },
    {
      key:"manager", header:"Manager",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.manager ? (
            <>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-[9px] font-black text-white flex-shrink-0">
                {row.manager.first_name?.[0]}{row.manager.last_name?.[0]}
              </div>
              <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{row.manager.first_name} {row.manager.last_name}</span>
            </>
          ) : (
            <span className="text-slate-400 text-[13px] italic">Unassigned</span>
          )}
        </div>
      )
    },
    {
      key:"start_date", header:"Start",
      render: (_, row) => (
        <div className="flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-400">
          <Calendar className="w-3 h-3 opacity-50" />
          {row.start_date ||"—"}
        </div>
      )
    },
    {
      key:"end_date", header:"Deadline",
      render: (_, row) => {
        if (!row.end_date) return <span className="text-slate-400 text-[12px]">—</span>;
        const diff = new Date(row.end_date).getTime() - Date.now();
        const days = Math.ceil(diff / 86400000);
        const overdue = days < 0;
        return (
          <div className="flex flex-col">
            <span className="text-[12px] text-slate-700 dark:text-slate-300 font-semibold">{row.end_date}</span>
            <span className={`text-[11px] font-bold ${overdue ? 'text-red-500' : 'text-teal-600'}`}>
              {overdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
            </span>
          </div>
        );
      }
    },
  ];

  const stats = useMemo(() => {
    const counts = { total: projects.length, active: 0, completed: 0, planning: 0 };
    projects.forEach((p: any) => {
      const s = p.status?.name?.toLowerCase() || '';
      if (s === 'completed') counts.completed++;
      else if (s === 'planning') counts.planning++;
      else counts.active++;
    });
    return counts;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return filterByTab(activeTab).filter((p: any) => isMatch({
      status: p.status_id,
      priority: p.priority_id,
      manager: p.manager_email,
    }));
  }, [activeTab, projects, isMatch]);

  const handleExport = () => exportToCSV(filteredProjects,"projects.csv", [
    { key:"public_id", header:"Project ID" },
    { key:"name", header:"Project Name" },
    { key:"client", header:"Client" },
    { key:"start_date", header:"Start Date" },
    { key:"end_date", header:"End Date" },
  ]);

  if (isLoading) return (
    <PageLayout title="Projects" isFullHeight>
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-20 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />)}
        </div>
        <TableSkeleton rows={5} columns={6} />
      </div>
    </PageLayout>
  );

  return (
    <PageLayout
      title="Projects"
      isFullHeight
      actions={
        <div className="flex items-center gap-2.5">
          {}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            {([['list', ListIcon], ['grid', LayoutGrid]] as const).map(([v, Icon]) => (
              <Button key={v} onClick={() => setView(v as any)} text={view !== v}
                className={`!px-3 !py-1.5 !text-[12px] font-bold transition-all ${view === v ? 'btn-gradient shadow-sm' : '!text-slate-500 hover:!text-slate-700 dark:hover:!text-slate-300'}`}>
                <Icon className="w-3.5 h-3.5 mr-1.5" />
                {v === 'list' ? 'List' : 'Grid'}
              </Button>
            ))}
          </div>
          <Button outlined onClick={openFilters} className={`!px-3 !py-1.5 !text-[12px] font-bold ${hasActiveFilters ? '!border-teal-500 !bg-teal-50 !text-teal-700 dark:!bg-teal-900/20 dark:!text-teal-300' : ''}`}>
            <Filter className="w-3.5 h-3.5 mr-1.5" /> Filters {hasActiveFilters && <span className="ml-1 w-4 h-4 rounded-full bg-teal-500 text-white text-[9px] font-black flex items-center justify-center">{Object.values(selectedFilters).flat().length}</span>}
          </Button>
          <Button outlined onClick={handleExport} className="!px-3 !py-1.5 !text-[12px] font-bold">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export
          </Button>
          {can.createProject(user?.role?.name) && (
            <Button onClick={() => navigate('/projects/create')} className="btn-gradient">
              <Plus className="w-4 h-4 mr-1.5" /> New Project
            </Button>
          )}
        </div>
      }
    >
      <div className="h-full flex flex-col space-y-5 overflow-hidden">
        <FilterSidebar isOpen={showFilters} onClose={closeFilters} groups={filterGroups}
          selectedFilters={selectedFilters} onFilterChange={handleFilterChange} onClear={clearFilters} />

        {}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
          <StatCard label="Total Projects" value={stats.total} icon={<FolderKanban className="w-5 h-5" />} />
          <StatCard label="Active Projects" value={stats.active} icon={<Clock className="w-5 h-5" />} />
          <StatCard label="Completed" value={stats.completed} icon={<CheckCircle className="w-5 h-5" />} />
          <StatCard label="Planning" value={stats.planning} icon={<AlertTriangle className="w-5 h-5" />} />
        </div>

        {}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          {tabs.map(tab => (
            <Button key={tab} text onClick={() => setActiveTab(tab)}
              className={`!pb-3 !pt-2 !px-4 !text-[13px] font-extrabold transition-all relative whitespace-nowrap !rounded-none ${activeTab === tab
                ? '!text-teal-600 dark:!text-teal-400'
                : '!text-slate-400 hover:!text-slate-700 dark:hover:!text-slate-300'
              }`} >
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-t-full" />}
              <span className={`ml-2 text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {filterByTab(tab).length}
              </span>
            </Button>
          ))}
        </div>

        {}
        <div className="flex-1 min-h-0 overflow-auto pr-1 pb-4">
          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProjects.map(p => (
                <ProjectCard key={p.id} project={p} onClick={() => navigate(`/projects/${p.id}`)} />
              ))}
              {filteredProjects.length === 0 && (
                <div className="col-span-full py-20 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
                  <FolderKanban className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-medium text-sm">No projects match the current filters.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
              <DataTable
                columns={columns}
                data={filteredProjects}
                selectable
                onRowClick={(e) => navigate(`/projects/${e.id}`)}
                itemsPerPage={12}
              />
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

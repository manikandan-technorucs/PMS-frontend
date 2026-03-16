import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/shared/components/layout/PageWrapper/PageLayout";
import { Card } from "@/shared/components/ui/Card/Card";
import { StatCard } from "@/shared/components/ui/Card/StatCard";
import { TableSkeleton } from "@/shared/components/ui/Skeleton/TableSkeleton";
import { CardSkeleton } from "@/shared/components/ui/Skeleton/CardSkeleton";
import { Button } from "@/shared/components/ui/Button/Button";
import { DataTable, Column } from "@/shared/components/lists/DataTable/DataTable";
import { StatusBadge } from "@/shared/components/ui/Badge/StatusBadge";
import { Plus, FolderKanban, CheckCircle, Clock, AlertTriangle, Download, LayoutGrid, List as ListIcon } from "lucide-react";
import { useProjects } from '@/features/projects/hooks/useProjects';
import { exportToCSV } from "@/shared/utils/export";
import { Project } from "@/features/projects/services/projects.api";
import { ProjectCard } from "./ProjectCard";
import { ViewToggle } from "@/shared/components/ui/ViewToggle/ViewToggle";

import { FilterSidebar } from "@/shared/components/ui/FilterSidebar";
import { useStatuses, usePriorities, useUsers } from "@/shared/hooks/useMasterData";
import { Filter } from "lucide-react";
import { useFilters } from "@/shared/hooks/useFilters";

export function ProjectsList() {
  const navigate = useNavigate();
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
    {
      id: 'status',
      label: 'Status',
      options: statuses.map(s => ({ label: s.name, value: s.id.toString() }))
    },
    {
      id: 'priority',
      label: 'Priority',
      options: priorities.map(p => ({ label: p.name, value: p.id.toString() }))
    },
    {
      id: 'manager',
      label: 'Manager',
      options: allUsers.map(u => ({ label: `${u.first_name} ${u.last_name}`, value: u.id.toString() }))
    }
  ];



  const { data: projectsData = [], isLoading } = useProjects();
  const projects = Array.isArray(projectsData) ? projectsData : [];

  const tabs = ["All Projects", "Active Projects", "Archived Projects"];

  const filterByTab = (tab: string) => {
    if (tab === "Active Projects") return projects.filter((p: any) => p.status?.name !== 'Completed');
    if (tab === "Archived Projects") return projects.filter((p: any) => p.status?.name === 'Completed');
    return projects;
  };

  const startDateTemplate = (rowData: Project) => (
    <span className="text-[13px] text-[#374151]">{rowData.start_date || "—"}</span>
  );

  const endDateTemplate = (rowData: Project) => {
    if (!rowData.end_date) return <span className="text-[#6B7280]">—</span>;
    const diff = new Date(rowData.end_date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    const daysText = days >= 0 ? `${days} days` : `${Math.abs(days)} days`;
    const color = days >= 0 ? "text-[#14b8a6]" : "text-red-500";
    return (
      <div>
        <span className="text-[13px] text-[#374151]">{rowData.end_date}</span>
        <span className={`text-[12px] ml-2 font-medium ${color}`}>{daysText}</span>
      </div>
    );
  };

  const statusTemplate = (rowData: Project) => (
    <StatusBadge
      status={rowData.status?.name || "Unknown"}
      variant="status"
    />
  );

  const priorityTemplate = (rowData: Project) => (
    <StatusBadge
      status={rowData.priority?.name || "Unknown"}
      variant="priority"
    />
  );

  const managerTemplate = (rowData: Project) => {
    return rowData.manager
      ? `${rowData.manager.first_name} ${rowData.manager.last_name}`
      : "Unassigned";
  };

  const columns: Column<Project>[] = [
    {
      key: "public_id",
      header: "Project ID",
      sortable: true,
      render: (_, row) => (
        <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-theme-secondary border border-slate-200 dark:border-slate-700">
          {row.public_id || `PRJ-${row.id}`}
        </span>
      ),
    },
    { key: "name", header: "Project Name", sortable: true, render: (_, row) => <span className="font-medium text-theme-primary">{row.name}</span> },
    { key: "client", header: "Client", sortable: true },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (_, row) => statusTemplate(row),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (_, row) => priorityTemplate(row),
    },
    {
      key: "manager",
      header: "Manager",
      sortable: true,
      render: (_, row) => managerTemplate(row),
    },
    {
      key: "start_date",
      header: "Start Date",
      sortable: true,
      render: (_, row) => startDateTemplate(row),
    },
    {
      key: "end_date",
      header: "End Date",
      sortable: true,
      render: (_, row) => endDateTemplate(row),
    },
  ];

  const stats = useMemo(() => {
    const counts = { total: projects.length, active: 0, completed: 0, planning: 0 };
    projects.forEach((p: any) => {
      const statusName = p.status?.name?.toLowerCase() || '';
      if (statusName === 'completed') {
        counts.completed++;
      } else if (statusName === 'planning') {
        counts.planning++;
      } else {
        // Active includes Active, In Progress, Pending
        counts.active++;
      }
    });
    return counts;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const tabFiltered = filterByTab(activeTab);
    return tabFiltered.filter((p: any) => isMatch({
      status: p.status_id,
      priority: p.priority_id,
      manager: p.manager_id,
    }));
  }, [activeTab, projects, isMatch]);

  const handleExport = () => {
    exportToCSV(filteredProjects, "projects.csv", [
      { key: "public_id", header: "Project ID" },
      { key: "name", header: "Project Name" },
      { key: "client", header: "Client" },
      { key: "start_date", header: "Start Date" },
      { key: "end_date", header: "End Date" },
    ]);
  };

  if (isLoading) return (
    <PageLayout title="Projects" isFullHeight>
      <div className="space-y-6">
        <CardSkeleton count={4} />
        <TableSkeleton rows={5} columns={6} />
      </div>
    </PageLayout>
  );

  return (
    <PageLayout
      title="Projects"
      isFullHeight
      actions={
        <div className="flex items-center gap-3">
          <div className="flex bg-theme-neutral rounded-lg p-1 border border-theme-border flex-shrink-0">
            <button
              type="button"
              onClick={() => setView('list')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 border border-transparent ${view === 'list' ? 'bg-theme-surface shadow-sm text-theme-primary' : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface hover:border-theme-border cursor-pointer'}`}
            >
              <ListIcon className="w-4 h-4" />
              List
            </button>
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 border border-transparent ${view === 'grid' ? 'bg-theme-surface shadow-sm text-theme-primary' : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface hover:border-theme-border cursor-pointer'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </button>
          </div>

          <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden sm:block" />

          <Button variant="outline" onClick={openFilters} className={hasActiveFilters ? 'border-brand-teal-500 bg-brand-teal-50 text-brand-teal-700' : ''}>
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button onClick={() => navigate('/projects/create')} variant="gradient">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      }
    >
      <div className="h-full flex flex-col space-y-6 overflow-hidden">
        <FilterSidebar
          isOpen={showFilters}
          onClose={closeFilters}
          groups={filterGroups}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onClear={clearFilters}
        />

        {/* Tabs & Stats Summary Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 flex-shrink-0">
          {/* Tabs */}
          <div className="border-b flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab
                  ? "text-brand-teal-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-teal-600"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mini Stats for quick overview */}
          <div className="flex items-center gap-4 text-[12px] text-[#6B7280]">
            <span className="flex items-center gap-1"><FolderKanban className="w-3 h-3" /> <b>{stats.total}</b> Total</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-500" /> <b>{stats.active}</b> Active</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-brand-teal-500" /> <b>{stats.completed}</b> Done</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
          <StatCard label="Total Projects" value={stats.total} icon={<FolderKanban className="w-5 h-5" />} accent={false} className="bg-white border" />
          <StatCard label="Active" value={stats.active} icon={<Clock className="w-5 h-5 text-blue-500" />} className="bg-white border border-t-blue-500" />
          <StatCard label="Completed" value={stats.completed} icon={<CheckCircle className="w-5 h-5 text-brand-teal-500" />} className="bg-white border border-t-brand-teal-500" />
          <StatCard label="Planning" value={stats.planning} icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} className="bg-white border border-t-amber-500" />
        </div>

        {/* Content Area (Grid or List) */}
        <div className="flex-1 min-h-0 overflow-auto pr-2 pb-4">
          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => navigate(`/projects/${project.id}`)}
                />
              ))}
              {filteredProjects.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white border border-dashed rounded-lg">
                  <p className="text-gray-500">No projects found for current filters.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border shadow-sm h-full flex flex-col overflow-hidden">
              <DataTable
                columns={columns}
                data={filteredProjects}
                selectable
                onRowClick={(e) => navigate(`/projects/${e.id}`)}
                itemsPerPage={10}
              />
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

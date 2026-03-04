import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/shared/components/layout/PageWrapper/PageLayout";
import { Card } from "@/shared/components/ui/Card/Card";
import { StatCard } from "@/shared/components/ui/Card/StatCard";
import { Button } from "@/shared/components/ui/Button/Button";
import { DataTable, Column } from "@/shared/components/lists/DataTable/DataTable";
import { StatusBadge } from "@/shared/components/ui/Badge/StatusBadge";
import {
  Plus,
  FolderKanban,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
} from "lucide-react";
import { useProjects } from '@/features/projects/hooks/useProjects';
import { exportToCSV } from "@/shared/utils/export";
import { Project } from "@/features/projects/services/projects.api";

export function ProjectsList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Active Projects");

  const { data: projectsData = [], isLoading } = useProjects();
  const projects = Array.isArray(projectsData) ? projectsData : [];

  const tabs = ["All Projects", "Active Projects", "Archived Projects"];

  const filterByTab = (tab: string) => {
    if (tab === "Active Projects") return projects.filter((p: any) => p.status?.name !== 'Completed');
    if (tab === "Archived Projects") return projects.filter((p: any) => p.status?.name === 'Completed');
    return projects;
  };

  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter((p: any) => p.status?.name === 'In Progress' || !p.status).length,
    completed: projects.filter((p: any) => p.status?.name === 'Completed').length,
    planning: projects.filter((p: any) => p.status?.name === 'Planning').length,
  }), [projects]);

  const filteredProjects = useMemo(
    () => filterByTab(activeTab),
    [activeTab, projects]
  );

  const handleExport = () => {
    exportToCSV(filteredProjects, "projects.csv", [
      { key: "public_id", header: "Project ID" },
      { key: "name", header: "Project Name" },
      { key: "client", header: "Client" },
      { key: "start_date", header: "Start Date" },
      { key: "end_date", header: "End Date" },
    ]);
  };

  const columns: Column<Project>[] = [
    { key: "public_id", header: "Project ID", sortable: true },
    { key: "name", header: "Project Name", sortable: true },
    { key: "client", header: "Client", sortable: true },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          status={row.status?.name || "Unknown"}
          variant="status"
        />
      ),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          status={row.priority?.name || "Unknown"}
          variant="priority"
        />
      ),
    },
    {
      key: "manager",
      header: "Manager",
      sortable: true,
      render: (_, row) =>
        row.manager
          ? `${row.manager.first_name} ${row.manager.last_name}`
          : "Unassigned",
    },
    {
      key: "start_date",
      header: "Start Date",
      sortable: true,
      render: (_, row) => (
        <span className="text-[13px] text-[#374151]">{row.start_date || "—"}</span>
      ),
    },
    {
      key: "end_date",
      header: "End Date",
      sortable: true,
      render: (_, row) => {
        if (!row.end_date) return <span className="text-[#6B7280]">—</span>;
        const diff = new Date(row.end_date).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        const daysText = days >= 0 ? `${days} days` : `${Math.abs(days)} days`;
        const color = days >= 0 ? "text-[#059669]" : "text-red-500";
        return (
          <div>
            <span className="text-[13px] text-[#374151]">{row.end_date}</span>
            <span className={`text-[12px] ml-2 font-medium ${color}`}>{daysText}</span>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <div className="p-8">Loading projects...</div>;

  return (
    <PageLayout
      title="Projects"
      actions={
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => navigate("/projects/create")}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* Tabs */}
        <div className="border-b flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 ${activeTab === tab
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-500"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard label="Total Projects" value={stats.total} icon={<FolderKanban className="w-5 h-5" />} />
          <StatCard label="Active" value={stats.active} icon={<Clock className="w-5 h-5" />} />
          <StatCard label="Completed" value={stats.completed} icon={<CheckCircle className="w-5 h-5" />} />
          <StatCard label="Planning" value={stats.planning} icon={<AlertTriangle className="w-5 h-5" />} />
        </div>

        {/* Table */}
        <Card>
          <DataTable
            columns={columns}
            data={filteredProjects}
            selectable
            itemsPerPage={20}
            onRowClick={(project) =>
              navigate(`/projects/${project.id}`)
            }
          />
        </Card>
      </div>
    </PageLayout>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { StatCard } from '@/components/ui/Card/StatCard';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/lists/DataTable/DataTable';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { Plus, FolderKanban, CheckCircle, Clock, AlertTriangle, Download } from 'lucide-react';
import { projectsService, Project } from '@/services/projects';
import { exportToCSV } from '@/utils/export';

export function ProjectsList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Active Projects');

  const tabs = ['All Projects', 'Active Projects', 'Archived Projects'];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectsService.getProjects(0, 500);
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportColumns = [
      { key: 'public_id', header: 'Project ID' },
      { key: 'name', header: 'Project Name' },
      { key: 'client', header: 'Client' },
      { key: 'manager_id', header: 'Manager ID' },
      { key: 'status_id', header: 'Status ID' },
      { key: 'priority_id', header: 'Priority ID' },
      { key: 'start_date', header: 'Start Date' },
      { key: 'end_date', header: 'End Date' }
    ];
    exportToCSV(projects, 'projects.csv', exportColumns);
  };

  const columns: Column<Project>[] = [
    { key: 'public_id', header: 'Project ID', sortable: true },
    { key: 'name', header: 'Project Name', sortable: true },
    { key: 'client', header: 'Client', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_, row) => <StatusBadge status={row.status?.name || 'Unknown'} variant="status" />
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (_, row) => <StatusBadge status={row.priority?.name || 'Unknown'} variant="priority" />
    },
    {
      key: 'manager',
      header: 'Manager',
      sortable: true,
      render: (_, row) => row.manager ? `${row.manager.first_name} ${row.manager.last_name}` : 'Unassigned'
    }
  ];

  const activeCount = projects.filter(p => ['Active', 'In Progress'].includes(p.status?.name || '')).length;
  const completedCount = projects.filter(p => p.status?.name === 'Completed').length;
  const pendingCount = projects.filter(p => p.status?.name === 'Planning').length;

  const filteredProjects = projects.filter(p => {
    if (activeTab === 'All Projects') return true;
    if (activeTab === 'Active Projects') return !['Completed', 'Closed'].includes(p.status?.name || '');
    if (activeTab === 'Archived Projects') return ['Completed', 'Closed'].includes(p.status?.name || '');
    // Other tabs are placeholders for now
    return false;
  });

  return (
    <PageLayout
      title="Projects"
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => navigate('/projects/create')}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tabs Navigation */}
        <div className="border-b border-[#E5E7EB] w-full overflow-x-auto hide-scrollbar">
          <div className="flex gap-1 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-[14px] font-medium transition-all border-b-2 ${activeTab === tab
                  ? 'text-[#059669] border-[#059669]'
                  : 'text-[#6B7280] border-transparent hover:text-[#1F2937] hover:bg-[#ECFDF5]/30'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
          <StatCard label="Total Projects" value={projects.length} icon={<FolderKanban className="w-5 h-5" />} />
          <StatCard label="Active" value={activeCount} icon={<Clock className="w-5 h-5" />} />
          <StatCard label="Completed" value={completedCount} icon={<CheckCircle className="w-5 h-5" />} />
          <StatCard label="Planning" value={pendingCount} icon={<AlertTriangle className="w-5 h-5" />} />
        </div>

        <Card>
          <DataTable
            columns={columns}
            data={filteredProjects}
            selectable
            onRowClick={(project) => navigate(`/projects/${project.id}`)}
            itemsPerPage={20}
          />
        </Card>
      </div>
    </PageLayout>
  );
}

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { StatCard } from '@/components/ui/Card/StatCard';
import { Button } from '@/components/ui/Button/Button';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { DataTable, Column } from '@/components/lists/DataTable/DataTable';
import {
  ArrowLeft, Edit, FileText, Download,
  User, Calendar, Building, Hash, Target, DollarSign,
  CheckCircle, Clock, AlertCircle, Milestone as MilestoneIcon,
  FileArchive, HardDrive, Upload, BarChart3, CalendarClock, TrendingUp
} from 'lucide-react';

const tabs = ['Overview', 'Tasks', 'Issues', 'Milestones', 'Documents', 'Reports'];

interface ProjectTask {
  id: string;
  title: string;
  assignee: string;
  status: string;
  priority: string;
  dueDate: string;
  progress: number;
}

interface ProjectIssue {
  id: string;
  title: string;
  assignee: string;
  status: string;
  severity: string;
  createdDate: string;
}

interface Milestone {
  id: string;
  name: string;
  status: string;
  dueDate: string;
  completion: number;
  tasks: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadDate: string;
  size: string;
}

const mockProjectTasks: ProjectTask[] = [
  { id: 'TSK-001', title: 'Design homepage mockup', assignee: 'Emily Rodriguez', status: 'In Progress', priority: 'High', dueDate: '2026-02-25', progress: 70 },
  { id: 'TSK-002', title: 'Implement navigation component', assignee: 'Michael Chen', status: 'Completed', priority: 'High', dueDate: '2026-02-20', progress: 100 },
  { id: 'TSK-003', title: 'User authentication module', assignee: 'David Park', status: 'In Progress', priority: 'Critical', dueDate: '2026-02-28', progress: 45 },
  { id: 'TSK-004', title: 'Create API endpoints', assignee: 'Michael Chen', status: 'Pending', priority: 'Medium', dueDate: '2026-03-05', progress: 0 },
  { id: 'TSK-005', title: 'Database migration scripts', assignee: 'David Park', status: 'In Progress', priority: 'High', dueDate: '2026-03-01', progress: 60 },
  { id: 'TSK-006', title: 'Responsive layout implementation', assignee: 'Emily Rodriguez', status: 'Pending', priority: 'Medium', dueDate: '2026-03-10', progress: 0 },
];

const mockProjectIssues: ProjectIssue[] = [
  { id: 'ISS-001', title: 'Dashboard loading performance issue', assignee: 'Emily Rodriguez', status: 'In Progress', severity: 'High', createdDate: '2026-02-17' },
  { id: 'ISS-002', title: 'Navigation breaks on mobile', assignee: 'Michael Chen', status: 'Open', severity: 'Medium', createdDate: '2026-02-18' },
  { id: 'ISS-003', title: 'Form validation error messages', assignee: 'David Park', status: 'Resolved', severity: 'Low', createdDate: '2026-02-15' },
  { id: 'ISS-004', title: 'CSS inconsistency in buttons', assignee: 'Emily Rodriguez', status: 'Open', severity: 'Low', createdDate: '2026-02-19' },
];

const mockMilestones: Milestone[] = [
  { id: 'MS-001', name: 'Phase 1: Design & Planning', status: 'Completed', dueDate: '2026-02-15', completion: 100, tasks: 8 },
  { id: 'MS-002', name: 'Phase 2: Core Development', status: 'In Progress', dueDate: '2026-04-15', completion: 55, tasks: 15 },
  { id: 'MS-003', name: 'Phase 3: Integration & Testing', status: 'Pending', dueDate: '2026-05-30', completion: 0, tasks: 12 },
  { id: 'MS-004', name: 'Phase 4: Launch & Deployment', status: 'Pending', dueDate: '2026-06-30', completion: 0, tasks: 6 },
];

const mockDocuments: Document[] = [
  { id: 'DOC-001', name: 'Project Requirements.pdf', type: 'PDF', uploadedBy: 'Sarah Johnson', uploadDate: '2026-01-15', size: '2.4 MB' },
  { id: 'DOC-002', name: 'Design Mockups.fig', type: 'Figma', uploadedBy: 'Emily Rodriguez', uploadDate: '2026-02-01', size: '15.8 MB' },
  { id: 'DOC-003', name: 'Technical Architecture.docx', type: 'Word', uploadedBy: 'Michael Chen', uploadDate: '2026-01-20', size: '1.2 MB' },
  { id: 'DOC-004', name: 'API Documentation.md', type: 'Markdown', uploadedBy: 'David Park', uploadDate: '2026-02-10', size: '450 KB' },
  { id: 'DOC-005', name: 'Sprint Planning.xlsx', type: 'Excel', uploadedBy: 'Sarah Johnson', uploadDate: '2026-02-05', size: '890 KB' },
  { id: 'DOC-006', name: 'Database Schema.png', type: 'Image', uploadedBy: 'David Park', uploadDate: '2026-01-25', size: '3.1 MB' },
];

export function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  const project = {
    id: projectId,
    name: 'Enterprise Portal Redesign',
    client: 'Acme Corp',
    status: 'In Progress',
    priority: 'High',
    progress: 65,
    startDate: '2026-01-15',
    endDate: '2026-06-30',
    manager: 'Sarah Johnson',
    budget: '$250,000',
    spent: '$162,500',
    description: 'Complete redesign of the enterprise portal with focus on user experience, performance optimization, and modern technology stack implementation.',
    team: ['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Park'],
    tags: ['Web Development', 'UI/UX', 'Frontend'],
  };

  const taskColumns: Column<ProjectTask>[] = [
    { key: 'id', header: 'Task ID', sortable: true },
    { key: 'title', header: 'Title', sortable: true },
    { key: 'assignee', header: 'Assignee', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render: (value) => <StatusBadge status={value} variant="status" /> },
    { key: 'priority', header: 'Priority', sortable: true, render: (value) => <StatusBadge status={value} variant="priority" /> },
    { key: 'dueDate', header: 'Due Date', sortable: true },
    {
      key: 'progress',
      header: 'Progress',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div className="h-full bg-[#059669] rounded-full transition-all" style={{ width: `${value}%` }} />
          </div>
          <span className="text-[12px] text-[#6B7280] w-10 text-right">{value}%</span>
        </div>
      ),
    },
  ];

  const issueColumns: Column<ProjectIssue>[] = [
    { key: 'id', header: 'Issue ID', sortable: true },
    { key: 'title', header: 'Title', sortable: true },
    { key: 'assignee', header: 'Assignee', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render: (value) => <StatusBadge status={value} variant="status" /> },
    { key: 'severity', header: 'Severity', sortable: true, render: (value) => <StatusBadge status={value} variant="priority" /> },
    { key: 'createdDate', header: 'Created Date', sortable: true },
  ];

  const milestoneColumns: Column<Milestone>[] = [
    { key: 'id', header: 'Milestone ID', sortable: true },
    { key: 'name', header: 'Milestone Name', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render: (value) => <StatusBadge status={value} variant="status" /> },
    { key: 'dueDate', header: 'Due Date', sortable: true },
    {
      key: 'completion',
      header: 'Completion',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div className="h-full bg-[#059669] rounded-full transition-all" style={{ width: `${value}%` }} />
          </div>
          <span className="text-[12px] text-[#6B7280] w-10 text-right">{value}%</span>
        </div>
      ),
    },
    { key: 'tasks', header: 'Tasks', sortable: true },
  ];

  const documentColumns: Column<Document>[] = [
    { key: 'id', header: 'Doc ID', sortable: true },
    { key: 'name', header: 'File Name', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'uploadedBy', header: 'Uploaded By', sortable: true },
    { key: 'uploadDate', header: 'Upload Date', sortable: true },
    { key: 'size', header: 'Size', sortable: true },
    {
      key: 'id',
      header: 'Actions',
      render: () => (
        <Button size="sm" variant="ghost">
          <Download className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <PageLayout
      title={project.name}
      actions={
        <>
          <Button variant="outline" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <Button onClick={() => navigate(`/projects/${projectId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Project
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Project Summary Header — Premium Design */}
        <div className="bg-white border border-[#E5E7EB] rounded-[6px] border-t-[3px] border-t-[#059669] overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Project ID</p>
                  <p className="text-[14px] font-semibold text-[#1F2937]">{project.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Client</p>
                  <p className="text-[14px] font-semibold text-[#1F2937]">{project.client}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Status</p>
                  <StatusBadge status={project.status} variant="status" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Priority</p>
                  <StatusBadge status={project.priority} variant="priority" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Manager</p>
                  <p className="text-[14px] font-semibold text-[#1F2937]">{project.manager}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Start Date</p>
                  <p className="text-[14px] font-semibold text-[#1F2937]">{project.startDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">End Date</p>
                  <p className="text-[14px] font-semibold text-[#1F2937]">{project.endDate}</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium mb-2">Progress</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#059669] rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                  </div>
                  <span className="text-[14px] font-bold text-[#059669]">{project.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
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

        {/* Tab Content: Overview */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <Card title="Description">
                <p className="text-[14px] text-[#374151] leading-relaxed">{project.description}</p>
              </Card>

              <Card title="Budget Overview">
                <div className="space-y-4">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                      <span className="text-[14px] text-[#6B7280]">Budget Utilization</span>
                      <span className="text-[14px] font-bold text-[#059669]">65%</span>
                    </div>
                    <div className="h-3 bg-[#E5E7EB] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#059669] to-[#34D399] rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-[#ECFDF5] rounded-[6px]">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-[#059669]" />
                        <p className="text-[12px] text-[#6B7280] uppercase tracking-wider font-medium">Total Budget</p>
                      </div>
                      <p className="text-[22px] font-bold text-[#1F2937]">{project.budget}</p>
                    </div>
                    <div className="p-4 bg-[#FEF3C7] rounded-[6px]">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-[#D97706]" />
                        <p className="text-[12px] text-[#6B7280] uppercase tracking-wider font-medium">Amount Spent</p>
                      </div>
                      <p className="text-[22px] font-bold text-[#1F2937]">{project.spent}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Timeline */}
              <Card title="Milestone Timeline">
                <div className="space-y-4">
                  {mockMilestones.map((ms) => (
                    <div key={ms.id} className="flex items-center gap-4 p-3 rounded-[6px] hover:bg-[#ECFDF5]/30 transition-colors">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${ms.status === 'Completed' ? 'bg-[#059669]' : ms.status === 'In Progress' ? 'bg-[#3B82F6]' : 'bg-[#D1D5DB]'
                        }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-[#1F2937] truncate">{ms.name}</p>
                        <p className="text-[12px] text-[#6B7280]">Due: {ms.dueDate}</p>
                      </div>
                      <StatusBadge status={ms.status} variant="status" />
                      <div className="w-20">
                        <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                          <div className="h-full bg-[#059669] rounded-full" style={{ width: `${ms.completion}%` }} />
                        </div>
                      </div>
                      <span className="text-[12px] font-medium text-[#6B7280] w-10 text-right">{ms.completion}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Team Members">
                <div className="space-y-3">
                  {project.team.map((member, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-[6px] hover:bg-[#ECFDF5]/30 transition-colors">
                      <div className="w-9 h-9 bg-[#059669] rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white text-[13px] font-semibold">{member[0]}</span>
                      </div>
                      <div>
                        <span className="text-[14px] font-medium text-[#1F2937] block">{member}</span>
                        <span className="text-[11px] text-[#6B7280]">{index === 0 ? 'Project Manager' : 'Developer'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Tags">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1.5 bg-[#ECFDF5] text-[#059669] text-[12px] font-medium rounded-full border border-[#A7F3D0]">
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>

              <Card title="Quick Stats">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2">
                    <span className="text-[13px] text-[#6B7280]">Total Tasks</span>
                    <span className="text-[14px] font-bold text-[#1F2937]">{mockProjectTasks.length}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2">
                    <span className="text-[13px] text-[#6B7280]">Open Issues</span>
                    <span className="text-[14px] font-bold text-[#DC2626]">{mockProjectIssues.filter(i => i.status === 'Open').length}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2">
                    <span className="text-[13px] text-[#6B7280]">Milestones</span>
                    <span className="text-[14px] font-bold text-[#1F2937]">{mockMilestones.length}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2">
                    <span className="text-[13px] text-[#6B7280]">Documents</span>
                    <span className="text-[14px] font-bold text-[#1F2937]">{mockDocuments.length}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab Content: Tasks */}
        {activeTab === 'Tasks' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Total Tasks" value={mockProjectTasks.length} icon={<CheckCircle className="w-5 h-5" />} />
              <StatCard label="Completed" value={mockProjectTasks.filter(t => t.status === 'Completed').length} icon={<CheckCircle className="w-5 h-5" />} />
              <StatCard label="In Progress" value={mockProjectTasks.filter(t => t.status === 'In Progress').length} icon={<Clock className="w-5 h-5" />} />
              <StatCard label="Pending" value={mockProjectTasks.filter(t => t.status === 'Pending').length} icon={<AlertCircle className="w-5 h-5" />} />
            </div>
            <Card>
              <DataTable
                columns={taskColumns}
                data={mockProjectTasks}
                selectable
                onRowClick={(task) => navigate(`/tasks/${task.id}`)}
                itemsPerPage={10}
              />
            </Card>
          </div>
        )}

        {/* Tab Content: Issues */}
        {activeTab === 'Issues' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Total Issues" value={mockProjectIssues.length} icon={<AlertCircle className="w-5 h-5" />} />
              <StatCard label="Open" value={mockProjectIssues.filter(i => i.status === 'Open').length} icon={<AlertCircle className="w-5 h-5" />} />
              <StatCard label="In Progress" value={mockProjectIssues.filter(i => i.status === 'In Progress').length} icon={<Clock className="w-5 h-5" />} />
              <StatCard label="Resolved" value={mockProjectIssues.filter(i => i.status === 'Resolved').length} icon={<CheckCircle className="w-5 h-5" />} />
            </div>
            <Card>
              <DataTable
                columns={issueColumns}
                data={mockProjectIssues}
                selectable
                onRowClick={(issue) => navigate(`/issues/${issue.id}`)}
                itemsPerPage={10}
              />
            </Card>
          </div>
        )}

        {/* Tab Content: Milestones */}
        {activeTab === 'Milestones' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Total Milestones" value={mockMilestones.length} icon={<Target className="w-5 h-5" />} />
              <StatCard label="Completed" value={mockMilestones.filter(m => m.status === 'Completed').length} icon={<CheckCircle className="w-5 h-5" />} />
              <StatCard label="In Progress" value={mockMilestones.filter(m => m.status === 'In Progress').length} icon={<Clock className="w-5 h-5" />} />
              <StatCard label="Upcoming" value={mockMilestones.filter(m => m.status === 'Pending').length} icon={<CalendarClock className="w-5 h-5" />} />
            </div>
            <Card>
              <DataTable
                columns={milestoneColumns}
                data={mockMilestones}
                selectable
                itemsPerPage={10}
              />
            </Card>
          </div>
        )}

        {/* Tab Content: Documents */}
        {activeTab === 'Documents' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Total Documents" value={mockDocuments.length} icon={<FileArchive className="w-5 h-5" />} />
              <StatCard label="Total Size" value="23.8 MB" icon={<HardDrive className="w-5 h-5" />} />
              <StatCard label="File Types" value={new Set(mockDocuments.map(d => d.type)).size} icon={<FileText className="w-5 h-5" />} />
              <StatCard label="Last Upload" value="2026-02-10" icon={<Upload className="w-5 h-5" />} />
            </div>
            <Card>
              <DataTable
                columns={documentColumns}
                data={mockDocuments}
                selectable
                itemsPerPage={10}
              />
            </Card>
          </div>
        )}

        {/* Tab Content: Reports */}
        {activeTab === 'Reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Reports Generated" value={18} icon={<BarChart3 className="w-5 h-5" />} />
              <StatCard label="Last Report" value="2026-02-19" icon={<CalendarClock className="w-5 h-5" />} />
              <StatCard label="Scheduled" value={3} icon={<Clock className="w-5 h-5" />} />
              <StatCard label="Downloads" value={45} icon={<Download className="w-5 h-5" />} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Weekly Progress Report', description: 'Summary of tasks completed, hours logged, and issues resolved this week', lastGenerated: '2026-02-19', type: 'PDF' },
                { title: 'Budget Utilization Report', description: 'Breakdown of budget allocation and spending across project phases', lastGenerated: '2026-02-17', type: 'Excel' },
                { title: 'Team Performance Report', description: 'Individual and team productivity metrics and task completion rates', lastGenerated: '2026-02-15', type: 'PDF' },
                { title: 'Risk Assessment Report', description: 'Identified risks, their impact levels, and mitigation strategies', lastGenerated: '2026-02-12', type: 'PDF' },
              ].map((report, index) => (
                <div key={index} className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 hover:shadow-md transition-shadow hover:border-[#A7F3D0]">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-[#ECFDF5] rounded-[6px] flex items-center justify-center text-[#059669] flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[16px] font-semibold text-[#1F2937] mb-1">{report.title}</h3>
                      <p className="text-[13px] text-[#6B7280] mb-3 leading-relaxed">{report.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <span className="text-[12px] text-[#6B7280]">
                          Last: <span className="font-medium text-[#1F2937]">{report.lastGenerated}</span>
                        </span>
                        <div className="flex gap-2 items-center">
                          <span className="text-[12px] px-2.5 py-1 bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] rounded-full font-medium">{report.type}</span>
                          <Button size="sm" variant="ghost">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

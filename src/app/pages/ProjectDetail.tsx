import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { DataTable, Column } from '../components/DataTable';
import { ArrowLeft, Edit, Plus, FileText, Download } from 'lucide-react';

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

  // Mock project data
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
            <div className="h-full bg-[#2563EB] rounded-full transition-all" style={{ width: `${value}%` }} />
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
            <div className="h-full bg-[#16A34A] rounded-full transition-all" style={{ width: `${value}%` }} />
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
        {/* Project Summary */}
        <Card>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Project ID</p>
              <p className="text-[14px] font-medium text-[#1F2937]">{project.id}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Client</p>
              <p className="text-[14px] font-medium text-[#1F2937]">{project.client}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Status</p>
              <StatusBadge status={project.status} variant="status" />
            </div>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Priority</p>
              <StatusBadge status={project.priority} variant="priority" />
            </div>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Project Manager</p>
              <p className="text-[14px] font-medium text-[#1F2937]">{project.manager}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Start Date</p>
              <p className="text-[14px] font-medium text-[#1F2937]">{project.startDate}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">End Date</p>
              <p className="text-[14px] font-medium text-[#1F2937]">{project.endDate}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Progress</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${project.progress}%` }} />
                </div>
                <span className="text-[14px] font-medium text-[#1F2937]">{project.progress}%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="border-b border-[#E5E7EB]">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-[14px] font-medium transition-colors border-b-2 ${activeTab === tab
                    ? 'text-[#2563EB] border-[#2563EB]'
                    : 'text-[#6B7280] border-transparent hover:text-[#1F2937]'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content: Overview */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <Card title="Description">
                <p className="text-[14px] text-[#1F2937]">{project.description}</p>
              </Card>

              <Card title="Budget Overview">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[14px] text-[#6B7280]">Budget Utilization</span>
                      <span className="text-[14px] font-medium text-[#1F2937]">65%</span>
                    </div>
                    <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2563EB] rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[12px] text-[#6B7280] mb-1">Total Budget</p>
                      <p className="text-[20px] font-semibold text-[#1F2937]">{project.budget}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-[#6B7280] mb-1">Amount Spent</p>
                      <p className="text-[20px] font-semibold text-[#1F2937]">{project.spent}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Team Members">
                <div className="space-y-3">
                  {project.team.map((member, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center">
                        <span className="text-white text-[12px] font-medium">{member[0]}</span>
                      </div>
                      <span className="text-[14px] text-[#1F2937]">{member}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Tags">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-[#F8FAFC] text-[#1F2937] text-[12px] rounded-[6px] border border-[#E5E7EB]">
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab Content: Tasks */}
        {activeTab === 'Tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-4 gap-4 flex-1 mr-4">
                <Card>
                  <div>
                    <p className="text-[12px] text-[#6B7280] mb-1">Total Tasks</p>
                    <p className="text-[24px] font-semibold text-[#1F2937]">{mockProjectTasks.length}</p>
                  </div>
                </Card>
                <Card>
                  <div>
                    <p className="text-[12px] text-[#6B7280] mb-1">Completed</p>
                    <p className="text-[24px] font-semibold text-[#16A34A]">{mockProjectTasks.filter(t => t.status === 'Completed').length}</p>
                  </div>
                </Card>
                <Card>
                  <div>
                    <p className="text-[12px] text-[#6B7280] mb-1">In Progress</p>
                    <p className="text-[24px] font-semibold text-[#2563EB]">{mockProjectTasks.filter(t => t.status === 'In Progress').length}</p>
                  </div>
                </Card>
                <Card>
                  <div>
                    <p className="text-[12px] text-[#6B7280] mb-1">Pending</p>
                    <p className="text-[24px] font-semibold text-[#F59E0B]">{mockProjectTasks.filter(t => t.status === 'Pending').length}</p>
                  </div>
                </Card>
              </div>
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
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Total Issues</p>
                  <p className="text-[24px] font-semibold text-[#1F2937]">{mockProjectIssues.length}</p>
                </div>
              </Card>
              <Card>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Open</p>
                  <p className="text-[24px] font-semibold text-[#DC2626]">{mockProjectIssues.filter(i => i.status === 'Open').length}</p>
                </div>
              </Card>
              <Card>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">In Progress</p>
                  <p className="text-[24px] font-semibold text-[#2563EB]">{mockProjectIssues.filter(i => i.status === 'In Progress').length}</p>
                </div>
              </Card>
              <Card>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Resolved</p>
                  <p className="text-[24px] font-semibold text-[#16A34A]">{mockProjectIssues.filter(i => i.status === 'Resolved').length}</p>
                </div>
              </Card>
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
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Total Milestones</p>
                  <p className="text-[24px] font-semibold text-[#1F2937]">{mockMilestones.length}</p>
                </div>
              </Card>
              <Card>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Completed</p>
                  <p className="text-[24px] font-semibold text-[#16A34A]">{mockMilestones.filter(m => m.status === 'Completed').length}</p>
                </div>
              </Card>
              <Card>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">In Progress</p>
                  <p className="text-[24px] font-semibold text-[#2563EB]">{mockMilestones.filter(m => m.status === 'In Progress').length}</p>
                </div>
              </Card>
              <Card>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Upcoming</p>
                  <p className="text-[24px] font-semibold text-[#F59E0B]">{mockMilestones.filter(m => m.status === 'Pending').length}</p>
                </div>
              </Card>
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
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Total Documents</p>
                  <p className="text-[24px] font-semibold text-[#1F2937]">{mockDocuments.length}</p>
                </div>
              </Card>
              <Card>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Total Size</p>
                  <p className="text-[24px] font-semibold text-[#1F2937]">23.8 MB</p>
                </div>
              </Card>
              <Card>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">File Types</p>
                  <p className="text-[24px] font-semibold text-[#1F2937]">6</p>
                </div>
              </Card>
              <Card>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Last Upload</p>
                  <p className="text-[14px] font-medium text-[#1F2937]">2026-02-10</p>
                </div>
              </Card>
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
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Reports Generated</p>
                  <p className="text-[24px] font-semibold text-[#1F2937]">18</p>
                </div>
              </Card>
              <Card>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Last Report</p>
                  <p className="text-[14px] font-medium text-[#1F2937]">2026-02-19</p>
                </div>
              </Card>
              <Card>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Scheduled</p>
                  <p className="text-[24px] font-semibold text-[#1F2937]">3</p>
                </div>
              </Card>
              <Card>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Downloads</p>
                  <p className="text-[24px] font-semibold text-[#1F2937]">45</p>
                </div>
              </Card>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { title: 'Weekly Progress Report', description: 'Summary of tasks completed, hours logged, and issues resolved this week', lastGenerated: '2026-02-19', type: 'PDF' },
                { title: 'Budget Utilization Report', description: 'Breakdown of budget allocation and spending across project phases', lastGenerated: '2026-02-17', type: 'Excel' },
                { title: 'Team Performance Report', description: 'Individual and team productivity metrics and task completion rates', lastGenerated: '2026-02-15', type: 'PDF' },
                { title: 'Risk Assessment Report', description: 'Identified risks, their impact levels, and mitigation strategies', lastGenerated: '2026-02-12', type: 'PDF' },
              ].map((report, index) => (
                <Card key={index}>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-[#EFF6FF] rounded-[6px] flex items-center justify-center text-[#2563EB] flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[16px] font-semibold text-[#1F2937] mb-1">{report.title}</h3>
                      <p className="text-[14px] text-[#6B7280] mb-3">{report.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#6B7280]">
                          Last: <span className="font-medium text-[#1F2937]">{report.lastGenerated}</span>
                        </span>
                        <div className="flex gap-2">
                          <span className="text-[12px] px-2 py-1 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[6px]">{report.type}</span>
                          <Button size="sm" variant="ghost">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

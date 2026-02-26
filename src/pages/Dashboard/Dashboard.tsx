import React from 'react';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Clock, AlertCircle, CheckCircle, FolderKanban } from 'lucide-react';

const taskStatusData = [
  { name: 'Completed', value: 45, color: '#16A34A' },
  { name: 'In Progress', value: 32, color: '#059669' },
  { name: 'Pending', value: 18, color: '#F59E0B' },
  { name: 'Blocked', value: 5, color: '#DC2626' },
];

const phaseStatusData = [
  { name: 'Planning', value: 12, color: '#8B5CF6' },
  { name: 'Design', value: 15, color: '#EC4899' },
  { name: 'Development', value: 40, color: '#059669' },
  { name: 'Testing', value: 20, color: '#F59E0B' },
  { name: 'Deployment', value: 13, color: '#16A34A' },
];

const issueSeverityData = [
  { severity: 'Critical', count: 5 },
  { severity: 'High', count: 12 },
  { severity: 'Medium', count: 28 },
  { severity: 'Low', count: 35 },
];

const burndownData = [
  { week: 'Week 1', planned: 100, actual: 95 },
  { week: 'Week 2', planned: 85, actual: 82 },
  { week: 'Week 3', planned: 70, actual: 68 },
  { week: 'Week 4', planned: 55, actual: 58 },
  { week: 'Week 5', planned: 40, actual: 45 },
  { week: 'Week 6', planned: 25, actual: 30 },
  { week: 'Week 7', planned: 10, actual: 15 },
  { week: 'Week 8', planned: 0, actual: 5 },
];

const kpiCards = [
  { title: 'Active Projects', value: '24', change: '+12%', trend: 'up', icon: <FolderKanban className="w-6 h-6" /> },
  { title: 'Total Tasks', value: '847', change: '+8%', trend: 'up', icon: <CheckCircle className="w-6 h-6" /> },
  { title: 'Open Issues', value: '56', change: '-15%', trend: 'down', icon: <AlertCircle className="w-6 h-6" /> },
  { title: 'Hours Logged', value: '1,245', change: '+5%', trend: 'up', icon: <Clock className="w-6 h-6" /> },
  { title: 'Completion Rate', value: '78%', change: '+3%', trend: 'up', icon: <TrendingUp className="w-6 h-6" /> },
];

export function Dashboard() {
  return (
    <PageLayout title="Dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {kpiCards.map((kpi, index) => (
            <div
              key={index}
              className="rounded-[6px] border-t-[3px] border-t-[#059669] p-4 hover:shadow-md transition-shadow dashboard-kpi-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[12px] mb-1 uppercase tracking-wider font-medium dashboard-kpi-label">{kpi.title}</p>
                  <p className="text-[28px] font-bold mb-2 dashboard-kpi-value">{kpi.value}</p>
                  <div className="flex items-center gap-1">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 text-[#16A34A]" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-[#DC2626]" />
                    )}
                    <span className={`text-[12px] font-medium ${kpi.trend === 'up' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  {kpi.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Task Status Distribution */}
          <Card title="Task Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Phase Status Distribution */}
          <Card title="Phase Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={phaseStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {phaseStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Issue Severity */}
          <Card title="Issue Severity Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={issueSeverityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="severity" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#059669" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Burndown Chart */}
          <Card title="Project Burndown">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="planned" stroke="#9CA3AF" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="actual" stroke="#059669" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

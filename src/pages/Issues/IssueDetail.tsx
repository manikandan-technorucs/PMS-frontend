import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { ArrowLeft, Edit, Clock } from 'lucide-react';
import { issuesService, Issue } from '@/services/issues';
import { timelogsService, TimeLog } from '@/services/timelogs';

export function IssueDetail() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [actualHours, setActualHours] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (issueId) {
      fetchIssue();
    }
  }, [issueId]);

  const fetchIssue = async () => {
    try {
      const parsedId = parseInt(issueId as string, 10);
      const [data, logs] = await Promise.all([
        issuesService.getIssue(parsedId),
        timelogsService.getTimelogs(0, 2000)
      ]);
      setIssue(data);

      const issueLogs = logs.filter(l => l.issue_id === parsedId);
      setActualHours(issueLogs.reduce((sum, l) => sum + l.hours, 0));
    } catch (error) {
      console.error('Failed to fetch issue detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8"><p>Loading issue details...</p></div>;
  if (!issue) return <div className="p-8"><p>Issue not found.</p></div>;

  return (
    <PageLayout
      title={issue.title}
      actions={
        <>
          <Button variant="outline" onClick={() => navigate('/issues')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Issues
          </Button>
          <Button onClick={() => navigate(`/issues/${issueId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Issue
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card title="Issue Details">
            <div className="space-y-4">
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Description</p>
                <p className="text-[14px] text-[#1F2937] whitespace-pre-wrap">{issue.description || 'No description'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Project</p>
                  <p className="text-[14px] font-medium text-[#1F2937]">{issue.project?.name || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Issue ID</p>
                  <p className="text-[14px] font-medium text-[#1F2937]">{issue.public_id}</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Created Date</p>
                  <p className="text-[14px] font-medium text-[#1F2937]">{issue.created_at ? new Date(issue.created_at).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Last Updated</p>
                  <p className="text-[14px] font-medium text-[#1F2937]">{issue.updated_at ? new Date(issue.updated_at).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Issue Information">
            <div className="space-y-4">
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Reporter</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 bg-[#EF4444] rounded-full flex items-center justify-center">
                    <span className="text-white text-[12px] font-medium">{issue.reporter ? issue.reporter.first_name[0] : '?'}</span>
                  </div>
                  <span className="text-[14px] font-medium text-[#1F2937]">
                    {issue.reporter ? `${issue.reporter.first_name} ${issue.reporter.last_name}` : 'Unassigned'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Assignee</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 bg-[#059669] rounded-full flex items-center justify-center">
                    <span className="text-white text-[12px] font-medium">{issue.assignee ? issue.assignee.first_name[0] : '?'}</span>
                  </div>
                  <span className="text-[14px] font-medium text-[#1F2937]">
                    {issue.assignee ? `${issue.assignee.first_name} ${issue.assignee.last_name}` : 'Unassigned'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Status</p>
                <StatusBadge status={issue.status?.name || 'Unknown'} variant="status" />
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Severity / Priority</p>
                <StatusBadge status={issue.priority?.name || 'Unknown'} variant="priority" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#EEF2FF] rounded-[6px]">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#4F46E5] shadow-sm">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-0.5">Time Logged</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[16px] font-semibold text-[#1F2937]">{actualHours.toFixed(1)}h</span>
                    <span className="text-[12px] text-[#6B7280]">/ {issue.estimated_hours || 0}h effort</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

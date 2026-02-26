import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { ArrowLeft, Edit } from 'lucide-react';

export function IssueDetail() {
  const { issueId } = useParams();
  const navigate = useNavigate();

  const issue = {
    id: issueId,
    title: 'Login authentication fails on mobile',
    project: 'Mobile App Development',
    reporter: 'John Doe',
    assignee: 'Michael Chen',
    status: 'Open',
    severity: 'Critical',
    createdDate: '2026-02-18',
    description: 'Users are unable to log in using the mobile app. The authentication API returns a 401 error even with correct credentials. This issue affects both iOS and Android platforms.',
    stepsToReproduce: '1. Open mobile app\n2. Enter valid credentials\n3. Tap login button\n4. Observe error message',
    environment: 'Production - Mobile App v2.1.0',
    priority: 'Critical',
  };

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
                <p className="text-[14px] text-[#1F2937] whitespace-pre-wrap">{issue.description}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Steps to Reproduce</p>
                <p className="text-[14px] text-[#1F2937] whitespace-pre-wrap">{issue.stepsToReproduce}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Environment</p>
                <p className="text-[14px] text-[#1F2937]">{issue.environment}</p>
              </div>
            </div>
          </Card>

          <Card title="Activity Log">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#059669] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[12px] font-medium">J</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-medium text-[#1F2937]">John Doe</span>
                    <span className="text-[12px] text-[#6B7280]">created this issue</span>
                  </div>
                  <span className="text-[12px] text-[#6B7280]">2026-02-18 10:30 AM</span>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#059669] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[12px] font-medium">M</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-medium text-[#1F2937]">Michael Chen</span>
                    <span className="text-[12px] text-[#6B7280]">was assigned</span>
                  </div>
                  <span className="text-[12px] text-[#6B7280]">2026-02-18 11:15 AM</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Issue Information">
            <div className="space-y-4">
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Issue ID</p>
                <p className="text-[14px] font-medium text-[#1F2937]">{issue.id}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Project</p>
                <p className="text-[14px] font-medium text-[#1F2937]">{issue.project}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Status</p>
                <StatusBadge status={issue.status} variant="status" />
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Severity</p>
                <StatusBadge status={issue.severity} variant="priority" />
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Reporter</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 bg-[#059669] rounded-full flex items-center justify-center">
                    <span className="text-white text-[12px] font-medium">{issue.reporter[0]}</span>
                  </div>
                  <span className="text-[14px] font-medium text-[#1F2937]">{issue.reporter}</span>
                </div>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Assignee</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 bg-[#059669] rounded-full flex items-center justify-center">
                    <span className="text-white text-[12px] font-medium">{issue.assignee[0]}</span>
                  </div>
                  <span className="text-[14px] font-medium text-[#1F2937]">{issue.assignee}</span>
                </div>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Created Date</p>
                <p className="text-[14px] font-medium text-[#1F2937]">{issue.createdDate}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

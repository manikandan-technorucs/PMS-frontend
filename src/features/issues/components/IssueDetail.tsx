import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { Badge } from '@/components/data-display/Badge';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { Card } from '@/components/layout/Card';
import { ArrowLeft, Edit, Clock, Download, ImageIcon, Trash2, Calendar, FolderKanban, Hash, AlertCircle } from 'lucide-react';
import { issuesService, Issue } from '@/features/issues/api/issues.api';
import { timelogsService } from '@/features/timelogs/api/timelogs.api';
import { useStatuses } from '@/features/masters/hooks/useMasters';
import { useToast } from '@/providers/ToastContext';

export function IssueDetail() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [actualHours, setActualHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reopening, setReopening] = useState(false);
  const { data: statuses = [] } = useStatuses();
  const { showToast } = useToast();

  useEffect(() => {
    if (issueId) fetchIssue();
  }, [issueId]);

  const fetchIssue = async () => {
    try {
      const parsedId = parseInt(issueId as string, 10);
      const [data, logs] = await Promise.all([
        issuesService.getIssue(parsedId),
        timelogsService.getTimelogs(0, 2000)
      ]);
      setIssue(data);
      const issueLogs = logs.filter((l: any) => l.issue_id === parsedId);
      setActualHours(issueLogs.reduce((sum: number, l: any) => sum + l.hours, 0));
    } catch (error) {
      console.error('Failed to fetch issue detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReOpen = async () => {
    if (!issue) return;
    const reopenStatus = statuses.find((s: any) => s.name.toLowerCase() === 're-opened');
    if (!reopenStatus) { showToast('error', 'Error', 'Re-Opened status not found. Please run seed.'); return; }
    setReopening(true);
    try {
      await issuesService.updateIssue(issue.id, { status_id: reopenStatus.id });
      showToast('success', 'Issue Re-Opened', 'The issue is now Re-Opened.');
      fetchIssue();
    } catch {
      showToast('error', 'Error', 'Failed to re-open issue.');
    } finally {
      setReopening(false);
    }
  };

  if (loading) return <PageSpinner fullPage label="Loading issue" />;
  if (!issue) return <PageSpinner fullPage label="Issue not found" />;

  const isClosed = issue.status?.name?.toLowerCase() === 'closed';

  return (
    <PageLayout
      title={issue.title}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate('/issues')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {isClosed && (
            <Button
              variant="secondary"
              onClick={handleReOpen}
              className="!border-amber-400 !text-amber-600 hover:!bg-amber-50"
            >
              {reopening ? 'Reopening…' : 'Re-Open Issue'}
            </Button>
          )}
          <Button variant="primary" onClick={() => navigate(`/issues/${issueId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Issue
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-10">
        { }
        <div className="relative overflow-hidden rounded-3xl border border-teal-500/20 shadow-xl px-8 py-6"
          style={{ background: 'var(--brand-gradient)', boxShadow: '0 10px 30px -5px rgba(12, 209, 195, 0.25)' }}>
          <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #ffffff 0%, transparent 50%)' }} />
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center flex-shrink-0 border border-white/50 backdrop-blur-md shadow-sm">
                <AlertCircle className="w-7 h-7 text-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-[24px] md:text-[28px] leading-none tracking-tight font-black text-slate-900">{issue.title}</h1>
                </div>
                <div className="flex flex-wrap items-center mt-3 gap-3 text-[13px] font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full"><Hash className="w-4 h-4 opacity-70" /> {issue.public_id}</span>
                  <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full"><FolderKanban className="w-4 h-4 opacity-70" /> {issue.project?.name || 'Unassigned'}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 opacity-70" /> Created: {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right flex flex-col items-end">
                <p className="text-[12px] font-black text-slate-800 mb-2 uppercase tracking-widest">Time Spent</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-800" />
                  <span className="text-[18px] font-black text-slate-900 tabular-nums">{actualHours.toFixed(1)}h / {issue.estimated_hours || 0}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            { }
            <Card title="About Issue">
              <p className="text-[14px] leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {issue.description || <span className="italic text-slate-400">No description provided for this issue.</span>}
              </p>
            </Card>

            {issue.documents && issue.documents.length > 0 && (
              <Card title={`Attachments (${issue.documents.length})`}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                  {issue.documents.map((doc: any) => {
                    const isImage = (doc.file_type && doc.file_type.startsWith('image/')) || doc.file_url?.match(/\.(jpeg|jpg|gif|png)$/i);
                    const fileUrl = doc.file_url?.startsWith('/') ? `http://localhost:8000${doc.file_url}` : doc.file_url;
                    return (
                      <a
                        key={doc.id}
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex flex-col items-center bg-theme-surface border border-theme-border rounded-xl overflow-hidden hover:border-brand-teal-400 hover:shadow-md transition-all duration-200"
                      >
                        <div className="w-full h-32 bg-theme-neutral/30 flex items-center justify-center overflow-hidden relative">
                          {isImage ? (
                            <img src={fileUrl} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-theme-muted group-hover:text-brand-teal-500 transition-colors" />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Download className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 drop-shadow-md" />
                          </div>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              try {
                                await import('@/features/documents/api/documents.api').then(m => m.documentsService.deleteDocument(doc.id));
                                window.location.reload();
                              } catch (err) {
                                console.error(err);
                                showToast('error', 'Notification', 'Failed to delete attachment.');
                              }
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            title="Delete Attachment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="w-full p-3 bg-white/50 backdrop-blur border-t border-white/20 dark:bg-theme-neutral/50 dark:border-white/5">
                          <p className="text-[12px] font-medium text-theme-primary truncate w-full" title={doc.title}>{doc.title}</p>
                          <p className="text-[10px] text-theme-muted mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis shadow-sm">
                            {doc.uploaded_by ? `${doc.uploaded_by.first_name} ${doc.uploaded_by.last_name}` : 'System'} • {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card title="Information">
              <div className="space-y-5">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Assignee</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white font-black text-[12px] shadow-sm">
                      {issue.assignee ? issue.assignee.first_name[0] : '?'}
                    </div>
                    <div>
                      <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                        {issue.assignee ? `${issue.assignee.first_name} ${issue.assignee.last_name}` : 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Reporter</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-black text-[12px] shadow-sm">
                      {issue.reporter ? issue.reporter.first_name[0] : '?'}
                    </div>
                    <div>
                      <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                        {issue.reporter ? `${issue.reporter.first_name} ${issue.reporter.last_name}` : 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</p>
                  <Badge value={issue.status?.name || 'Unknown'} variant="status" />
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Priority</p>
                  <Badge value={issue.priority?.name || 'Unknown'} variant="priority" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

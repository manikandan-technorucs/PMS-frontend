import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Avatar } from 'primereact/avatar';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { EntityDetailTemplate } from '@/components/layout/EntityDetailTemplate';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { DetailViewSkeleton } from '@/components/feedback/Skeleton/DetailViewSkeleton';
import { Button } from '@/components/forms/Button';
import { useIssue } from '../../hooks/useIssues';
import { useIssueActions } from '../../hooks/useIssueActions';
import { useStatuses } from '@/features/masters/hooks/useMasters';
import { useToast } from '@/providers/ToastContext';
import { timelogsService } from '@/api/services/timelogs.service';
import { format, parseISO, isValid } from 'date-fns';
import {
    Edit, AlertCircle, Calendar, Clock, Hash, FolderKanban,
    User2, Users, Tag, Layout, Info, ShieldAlert, Download, ImageIcon
} from 'lucide-react';
import { statusStr } from '@/utils/statusHelpers';
import { formatLocalDate, calculateDaysLeft, formatDaysLeftText } from '@/utils/dateHelpers';

const TEAL = 'hsl(160 60% 45%)';
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/v1$/, '') ?? '';
function resolveUrl(url: string) { return url?.startsWith('http') ? url : `${API_BASE}${url}`; }

function fmtDate(raw?: string | null) {
    if (!raw) return '—';
    try { const d = parseISO(raw); return isValid(d) ? format(d, 'MMM d, yyyy') : raw; } catch { return raw; }
}

import { PropRow } from '@/components/data-display/PropRow';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { SeverityBadge } from '@/components/data-display/SeverityBadge';
import { PersonAvatar } from '@/components/data-display/PersonAvatar';

function formatHHMM(h: number) { const hh = Math.floor(h); const mm = Math.round((h - hh) * 60); return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`; }

export function IssueDetailView() {
    const { issueId }   = useParams<{ issueId: string }>();
    const navigate      = useNavigate();
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'Overview';
    const id = parseInt(issueId ?? '0', 10);

    const { data: issue, isLoading, refetch } = useIssue(id);
    const { data: statuses = [] } = useStatuses();
    const { data: timelogs = [] } = useQuery({
        queryKey: ['timelogs-issue', id],
        queryFn:  () => timelogsService.getTimelogs(0, 2000),
        enabled: !!id,
    });
    const { updateIssue } = useIssueActions();
    const [reopening, setReopening] = React.useState(false);

    if (isLoading) return <PageLayout><DetailViewSkeleton /></PageLayout>;
    if (!issue)   return <PageSpinner fullPage label="Issue not found" />;

    const rawTimelogs   = Array.isArray(timelogs) ? timelogs : (timelogs as any)?.items || [];
    const issueTimelogs = (rawTimelogs as any[]).filter(l => Number(l.issue_id) === id);
    const actualHours   = issueTimelogs.reduce((s, l) => s + Number(l.daily_log_hours ?? l.hours ?? 0), 0);
    const isClosed = statusStr(issue.status) === 'closed';
    const backPath = issue.project_id ? `/projects/${issue.project_id}?tab=Bugs` : '/issues';
    
    const daysLeft = calculateDaysLeft(issue.due_date);
    

    const severityLabel = (issue.severity && typeof issue.severity === 'object') ? (issue.severity as any).label ?? (issue.severity as any).name : (issue.severity ?? 'Normal');
    const projectName = issue.project?.project_name ?? issue.project?.name ?? 'General Issue';

    const handleReOpen = async () => {
        const s = (statuses as any[]).find(s => s.name.toLowerCase() === 're-opened');
        if (!s) { showToast('error', 'Error', '"Re-Opened" status not found'); return; }
        setReopening(true);
        try {
            await updateIssue.mutateAsync({ id: issue.id, data: { status_id: s.id } });
            showToast('success', 'Re-Opened', 'Defect restored to active status.');
            refetch();
        } catch { showToast('error', 'Error', 'Failed to update status.'); }
        finally { setReopening(false); }
    };

    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate(backPath, { replace: true });
        }
    };

    return (
        <PageLayout showBackButton onBack={handleBack} isFullHeight>
            <EntityDetailTemplate
                title={issue.bug_name}
                subtitle={projectName}
                icon={<AlertCircle size={20} />}
                color="red"
                badge={<StatusBadge status={(issue as any).status_master ?? issue.status} />}
                actions={
                    <div className="flex gap-2">
                        {isClosed && (
                            <Button variant="outline" size="sm" onClick={handleReOpen} loading={reopening}>
                                Re-Open
                            </Button>
                        )}
                        <Button variant="gradient" size="sm" icon={<Edit size={14} />} onClick={() => navigate(`/issues/${issueId}/edit`)}>
                            Edit
                        </Button>
                    </div>
                }
                stats={[
                    { label: 'Logged Hours', value: `${actualHours.toFixed(1)}h`, color: '#8b5cf6', icon: <Clock size={14} /> },
                    { label: 'Severity',     value: severityLabel, color: '#ef4444', icon: <ShieldAlert size={14} /> },
                    { label: 'Deadline',     value: formatDaysLeftText(daysLeft), color: (daysLeft !== null && daysLeft < 0) ? '#ef4444' : '#f59e0b', icon: <Calendar size={14} /> }
                ]}
                tabs={[
                    { label: 'Overview' },
                    { label: 'Time Logs' },
                    { label: 'Attachments' }
                ]}
            >
                <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
                    <div className="flex-1 space-y-6">
                        {activeTab === 'Overview' && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4">Description</h3>
                                {issue.description ? (
                                    <div className="text-[14px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                        {issue.description}
                                    </div>
                                ) : (
                                    <p className="text-sm italic text-slate-400">No description provided.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'Time Logs' && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <h3 className="text-[14px] font-bold">Issue Logs ({issueTimelogs.length})</h3>
                                    <span className="font-bold" style={{ color: TEAL }}>{Number(actualHours || 0).toFixed(2)}h total</span>
                                </div>
                                {issueTimelogs.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400">No logs found.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-[13px]">
                                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                                <tr>
                                                    <th className="text-left px-6 py-3 text-[10px] uppercase text-slate-500">Date</th>
                                                    <th className="text-left px-6 py-3 text-[10px] uppercase text-slate-500">User</th>
                                                    <th className="text-left px-6 py-3 text-[10px] uppercase text-slate-500">Hours</th>
                                                    <th className="text-left px-6 py-3 text-[10px] uppercase text-slate-500">Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {issueTimelogs.map(l => (
                                                    <tr key={l.id}>
                                                        <td className="px-6 py-4">{fmtDate(l.date)}</td>
                                                        <td className="px-6 py-4">{l.user?.first_name} {l.user?.last_name}</td>
                                                        <td className="px-6 py-4 font-bold" style={{ color: TEAL }}>{Number(l.daily_log_hours ?? l.hours ?? 0).toFixed(2)}h</td>
                                                        <td className="px-6 py-4 text-slate-500">{l.description || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'Attachments' && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h3 className="text-[14px] font-bold mb-4">Attachments ({issue.documents?.length ?? 0})</h3>
                                {issue.documents?.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {issue.documents.map((doc: any) => (
                                            <a key={doc.id} href={resolveUrl(doc.file_url)} target="_blank" rel="noreferrer"
                                               className="block border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                                <div className="h-24 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                                    <ImageIcon size={24} className="text-slate-300" />
                                                </div>
                                                <div className="p-3">
                                                    <p className="text-[12px] font-semibold truncate">{doc.title}</p>
                                                    <p className="text-[10px] text-slate-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-400">No attachments found.</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4 px-1">Issue Metadata</h3>
                            <PropRow icon={<Hash size={13} />} label="Public ID" color="#ef4444">
                                <span className="font-mono">{issue.public_id}</span>
                            </PropRow>
                            <PropRow icon={<ShieldAlert size={13} />} label="Severity" color="#ef4444">
                                <SeverityBadge severity={issue.severity} />
                            </PropRow>
                            <PropRow icon={<Info size={13} />} label="Classification" color="#ef4444">
                                {issue.classification || 'Bug'}
                            </PropRow>
                            <PropRow icon={<Layout size={13} />} label="Module / Section" color="#ef4444">
                                {issue.module || 'Root'}
                            </PropRow>
                            <PropRow icon={<Users size={13} />} label="Assignees" color="#ef4444">
                                {issue.assignees && issue.assignees.length > 0 ? (
                                    <div className="flex flex-col gap-1.5 mt-1">
                                        {issue.assignees.map((a: any, i: number) => <PersonAvatar key={i} person={a} />)}
                                    </div>
                                ) : 'Unassigned'}
                            </PropRow>
                            <PropRow icon={<User2 size={13} />} label="Reporter" color="#ef4444">
                                <PersonAvatar person={issue.reporter} />
                            </PropRow>
                            {issue.followers && issue.followers.length > 0 && (
                                <PropRow icon={<Users size={13} />} label="Followers" color="#ef4444">
                                    <div className="flex flex-col gap-1.5 mt-1">
                                        {issue.followers.map((f: any, i: number) => <PersonAvatar key={i} person={f} />)}
                                    </div>
                                </PropRow>
                            )}
                            <PropRow icon={<Tag size={13} />} label="Tags" color="#ef4444">
                                {issue.tags ? (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {issue.tags.split(',').map((t: string, i: number) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-[10px] font-bold">
                                                {t.trim()}
                                            </span>
                                        ))}
                                    </div>
                                ) : '—'}
                            </PropRow>
                            <PropRow icon={<Calendar size={13} />} label="Target Date" color="#ef4444">
                                {fmtDate(issue.due_date)}
                            </PropRow>
                        </div>
                    </div>
                </div>
            </EntityDetailTemplate>
        </PageLayout>
    );
}

import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { Badge } from '@/components/data-display/Badge';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { DataTable } from '@/components/data-display/DataTable';
import { DetailViewSkeleton } from '@/components/feedback/Skeleton/DetailViewSkeleton';
import { Card } from '@/components/layout/Card';
import { EmptyState } from '@/components/data-display/EmptyState';
import { PersonRow } from '@/components/data-display/PersonRow';
import { EntityDetailTemplate } from '@/components/layout/EntityDetailTemplate';
import { StatCardProps } from '@/components/data-display/StatCard';
import {
    AlertCircle, ArrowLeft, Calendar, Clock, Download,
    Edit, FolderKanban, Hash, ImageIcon,
    ShieldAlert, Zap, Info, FileText, Layout,
    History
} from 'lucide-react';
import { useIssue } from '../../hooks/useIssues';
import { useIssueActions } from '../../hooks/useIssueActions';
import { useStatuses } from '@/features/masters/hooks/useMasters';
import { useToast } from '@/providers/ToastContext';
import { timelogsService } from '@/api/services/timelogs.service';

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace('/api/v1', '');

function resolveUrl(url: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

const TABS = [{ label: 'Overview' }, { label: 'Time Logs' }, { label: 'Attachments' }];

export function IssueDetailView() {
    const { issueId } = useParams<{ issueId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'Overview';
    const id = parseInt(issueId ?? '0', 10);

    const { data: issue, isLoading, refetch } = useIssue(id);
    const { data: statuses = [] } = useStatuses();
    const { data: timelogs = [] } = useQuery({
        queryKey: ['timelogs-issue', id],
        queryFn: () => timelogsService.getTimelogs(0, 2000),
        enabled: !!id,
    });
    const { updateIssue } = useIssueActions();
    const [reopening, setReopening] = React.useState(false);

    const issueTimelogs = (timelogs as any[]).filter((l) => l.issue_id === id);
    const actualHours = issueTimelogs.reduce((sum, l) => sum + (l.hours ?? 0), 0);

    const handleReOpen = async () => {
        if (!issue) return;
        const s = (statuses as any[]).find((s) => s.name.toLowerCase() === 're-opened');
        if (!s) { showToast('error', 'Error', '"Re-Opened" status not configured.'); return; }
        setReopening(true);
        try {
            await updateIssue.mutateAsync({ id: issue.id, data: { status_id: s.id } });
            showToast('success', 'Re-Opened', 'Issue is now re-opened.');
            refetch();
        } catch {
            showToast('error', 'Error', 'Failed to re-open issue.');
        } finally { setReopening(false); }
    };

    if (isLoading) return <PageLayout><DetailViewSkeleton /></PageLayout>;
    if (!issue) return <PageSpinner fullPage label="Issue not found" />;

    const isClosed = issue.status?.name?.toLowerCase() === 'closed';

    const metadataNodes = [
        <span key="id" className="flex items-center gap-1.5"><Hash className="w-4 h-4 opacity-70" /> {issue.public_id}</span>,
        <span key="project" className="flex items-center gap-1.5"><FolderKanban className="w-4 h-4 opacity-70" /> {issue.project?.name || 'General Issue'}</span>,
        <span key="created" className="flex items-center gap-1.5"><Calendar className="w-4 h-4 opacity-70" /> Created {new Date(issue.created_at || '').toLocaleDateString()}</span>
    ];

    const statsProps: StatCardProps[] = [
        { label: 'Actual Hours', value: `${actualHours.toFixed(1)}h`, icon: <Clock size={18} strokeWidth={2}/>, accentVariant: 'violet' },
        { label: 'Priority', value: issue.priority?.name || 'Normal', icon: <Zap size={18} strokeWidth={2}/>, accentVariant: 'amber' },
        { label: 'Status', value: issue.status?.name || 'Open', icon: <ShieldAlert size={18} strokeWidth={2}/>, accentVariant: 'teal' },
        { label: 'Type', value: issue.classification || 'Bug', icon: <Info size={18} strokeWidth={2}/>, accentVariant: 'rose' },
    ];

    return (
        <PageLayout
            title={issue.title}
            subtitle={issue.public_id}
            isFullHeight
            showBackButton
            backPath={issue.project_id ? `/projects/${issue.project_id}?tab=Bugs` : '/issues'}
            actions={
                <div className="flex items-center gap-2">
                    {isClosed && (
                        <button
                            onClick={handleReOpen}
                            disabled={reopening}
                            className="inline-flex items-center justify-center gap-2 font-bold px-4 rounded-lg transition-all hover:bg-amber-50 hover:border-transparent dark:hover:bg-amber-900/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ height: '36px', border: '1px solid #fbbf24', color: '#d97706' }}
                        >
                            {reopening ? 'Reopening…' : 'Re-Open Issue'}
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`/issues/${issueId}/edit`)}
                        className="inline-flex items-center justify-center gap-2 font-bold px-4 rounded-lg text-slate-900 text-[13px] transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{
                           height: '36px',
                           background: 'linear-gradient(135deg, #B3F57B 0%, #0CD1C3 100%)',
                           boxShadow: '0 4px 15px rgba(12, 209, 195, 0.35)',
                        }}
                     >
                        <Edit size={15} /> Edit Issue
                     </button>
                </div>
            }
        >
            <EntityDetailTemplate
                title={issue.title}
                icon={<AlertCircle className="w-6 h-6 text-slate-900" />}
                badges={[<Badge key="status" value={issue.status?.name || 'Open'} variant="status" />]}
                metadata={metadataNodes}
                progressPercent={isClosed ? 100 : 0}
                tabs={TABS}
                stats={statsProps}
                users={issue.assignees || (issue.assignee ? [issue.assignee] : [])}
            >
                {activeTab === 'Overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {}
                        <div className="lg:col-span-8 space-y-5">
                            <div>
                                <h3 className="text-[11px] font-black tracking-widest uppercase text-theme-muted mb-2.5 flex items-center gap-2">
                                    <div className="w-1 h-3 rounded-full bg-brand-teal-400" />
                                    Issue Description
                                </h3>
                                <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/50">
                                    {issue.description ? (
                                        <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                            {issue.description}
                                        </p>
                                    ) : (
                                        <p className="text-[11px] text-theme-muted font-medium w-full text-center py-4">No descriptive details provided.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {}
                        <div className="lg:col-span-4 space-y-5">
                            <div>
                                <h3 className="text-[11px] font-black tracking-widest uppercase text-theme-muted mb-2.5 flex items-center gap-2">
                                    <div className="w-1 h-3 rounded-full bg-indigo-400" />
                                    Personnel
                                </h3>
                                <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/50 space-y-4">
                                    <PersonRow
                                        label="Assigned Expert"
                                        firstName={issue.assignee?.first_name}
                                        lastName={issue.assignee?.last_name}
                                    />
                                    <PersonRow
                                        label="Reporter"
                                        firstName={issue.reporter?.first_name}
                                        lastName={issue.reporter?.last_name}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[11px] font-black tracking-widest uppercase text-theme-muted mb-2.5 flex items-center gap-2">
                                    <div className="w-1 h-3 rounded-full bg-amber-400" />
                                    Intelligence
                                </h3>
                                <div className="p-2 space-y-1.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/50">
                                    {[
                                        { icon: <Layout className="w-3 h-3 text-slate-400" />, label: 'Module', value: issue.module || 'Root' },
                                        { icon: <Hash className="w-3 h-3 text-slate-400" />, label: 'Classification', value: issue.classification || 'General' },
                                        { icon: <Info className="w-3 h-3 text-slate-400" />, label: 'Tags', value: issue.tags || 'None' },
                                    ].map(({ icon, label, value }) => (
                                        <div key={label} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-white/50 dark:bg-slate-800/50 shadow-sm border border-slate-100/60 dark:border-slate-700/30">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-md bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                                                {icon}
                                            </div>
                                            <div className="min-w-0 flex-1 flex justify-between items-center">
                                                <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wide">{label}</p>
                                                <p className="text-[11px] font-black text-slate-700 dark:text-slate-200">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[11px] font-black tracking-widest uppercase text-theme-muted mb-2.5 flex items-center gap-2">
                                    <div className="w-1 h-3 rounded-full bg-rose-400" />
                                    Timeline
                                </h3>
                                <div className="p-2 space-y-1.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/50">
                                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/50 dark:bg-slate-800/50 shadow-sm border border-slate-100/60 dark:border-slate-700/30">
                                        <Calendar className="w-3 h-3 text-brand-teal-500 flex-shrink-0" />
                                        <div className="min-w-0 flex-1 flex justify-between items-center">
                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Reported</p>
                                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{new Date(issue.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/50 dark:bg-slate-800/50 shadow-sm border border-slate-100/60 dark:border-slate-700/30">
                                        <Clock className="w-3 h-3 text-brand-teal-500 flex-shrink-0" />
                                        <div className="min-w-0 flex-1 flex justify-between items-center">
                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Updated</p>
                                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{new Date(issue.updated_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Time Logs' && (
                    <Card glass={true} className="p-0">
                        <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-brand-teal-500" />
                                <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Issue Time Logs</h3>
                            </div>
                        </div>
                        <div className="p-0">
                            {issueTimelogs.length > 0 ? (
                                <DataTable
                                    data={issueTimelogs}
                                    columns={[
                                        { key: 'date', header: 'Date', render: (val) => <span className="font-bold text-slate-700 dark:text-slate-300">{new Date(val as string).toLocaleDateString()}</span> },
                                        { key: 'user', header: 'User', render: (val) => <PersonRow firstName={val?.first_name} lastName={val?.last_name} label="" /> },
                                        { key: 'hours', header: 'Time', render: (val) => <span className="font-black text-brand-teal-600">{Number(val).toFixed(2)}h</span> },
                                        { key: 'notes', header: 'Notes', render: (val) => <span className="text-slate-500 truncate max-w-xs block">{val as string || '-'}</span> },
                                    ]}
                                    itemsPerPage={5}
                                />
                            ) : (
                                <EmptyState 
                                    icon={<Clock className="w-10 h-10 text-slate-200" />} 
                                    title="No time logged" 
                                    description="No time logged for this issue yet." 
                                />
                            )}
                        </div>
                    </Card>
                )}

                {activeTab === 'Attachments' && (
                    <Card glass={true} className="p-0">
                        <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                            <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Evidence & Attachments</h3>
                            <span className="text-[11px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">{issue.documents?.length || 0} FILES</span>
                        </div>
                        {issue.documents && issue.documents.length > 0 ? (
                            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-5">
                                {issue.documents.map((doc: any) => {
                                    const isImage =
                                        doc.file_type?.startsWith('image/') ||
                                        /\.(jpeg|jpg|gif|png|webp)$/i.test(doc.file_url ?? '');
                                    const href = resolveUrl(doc.file_url);
                                    return (
                                        <a
                                            key={doc.id}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[20px] overflow-hidden hover:border-brand-teal-500 hover:shadow-xl hover:shadow-brand-teal-500/10 transition-all duration-300"
                                        >
                                            {}
                                            <div className="w-full h-32 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800 relative">
                                                {isImage ? (
                                                    <img src={href} alt={doc.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <ImageIcon className="w-10 h-10 text-slate-300 group-hover:text-brand-teal-500 transition-colors" />
                                                )}
                                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-[2px]">
                                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-900 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                        <Download className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white dark:bg-slate-900">
                                                <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate" title={doc.title}>{doc.title}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                                        {(doc.uploaded_by?.first_name?.[0] || 'S')}{(doc.uploaded_by?.last_name?.[0] || '')}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-medium"> {new Date(doc.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-6">
                                <EmptyState 
                                    icon={<ImageIcon className="w-8 h-8 text-slate-300" />} 
                                    title="No Attachments" 
                                    description="No evidence or attachments uploaded yet." 
                                />
                            </div>
                        )}
                    </Card>
                )}
            </EntityDetailTemplate>
        </PageLayout>
    );
}

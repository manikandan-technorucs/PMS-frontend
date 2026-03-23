import React from 'react';
import { Issue } from '../services/issues.api';
import { Card } from '@/components/ui/Card/Card';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { AlertCircle, User, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IssueCardProps {
    issue: Issue;
    className?: string;
    isDragging?: boolean;
    dragRef?: React.Ref<HTMLDivElement>;
}

export function IssueCard({ issue, className = '', isDragging, dragRef }: IssueCardProps) {
    const navigate = useNavigate();

    const accentColor = issue.status?.name?.toLowerCase() === 'completed' || issue.status?.name?.toLowerCase() === 'closed'
        ? 'bg-emerald-500'
        : issue.priority?.name?.toLowerCase() === 'critical' || issue.priority?.name?.toLowerCase() === 'high'
            ? 'bg-rose-500'
            : 'bg-amber-500';

    return (
        <Card
            onClick={() => navigate(`/issues/${issue.id}`)}
            id={issue.public_id || `ISS-${issue.id}`}
            title={issue.title}
            accentColor={accentColor}
            className={`${className} ${isDragging ? 'opacity-50 grayscale' : 'opacity-100'} transition-all`}
            actions={<StatusBadge status={issue.priority?.name || 'Medium'} variant="priority" />}
        >
            <div ref={dragRef as any} className="space-y-4">
                <div className="flex items-center justify-between text-[12px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                            {issue.assignee ? `${issue.assignee.first_name[0]}${issue.assignee.last_name[0]}` : '??'}
                        </div>
                        <span className="font-medium truncate max-w-[100px]">
                            {issue.assignee ? `${issue.assignee.first_name} ${issue.assignee.last_name}` : 'Unassigned'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{issue.reporter ? issue.reporter.first_name : 'System'}</span>
                    </div>
                </div>

                {issue.description && (
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {issue.description}
                    </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800/50">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{issue.end_date || 'No Deadline'}</span>
                    </div>
                    <StatusBadge status={issue.status?.name || 'Open'} variant="status" />
                </div>
            </div>
        </Card>
    );
}

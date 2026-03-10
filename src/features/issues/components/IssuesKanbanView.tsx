import React from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import { Issue, issuesService } from '../services/issues.api';
import { useStatuses } from '@/shared/hooks/useMasterData';
import { StatusBadge } from '@/shared/components/ui/Badge/StatusBadge';
import { Clock, User } from 'lucide-react';

const ITEM_TYPE = 'ISSUE_CARD';

interface IssuesKanbanViewProps {
    issues: Issue[];
    onUpdate: () => void;
}

interface KanbanCardProps {
    issue: Issue;
}

function KanbanCard({ issue }: KanbanCardProps) {
    const navigate = useNavigate();
    const [{ isDragging }, dragRef] = useDrag({
        type: ITEM_TYPE,
        item: { id: issue.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={dragRef as any}
            onClick={() => navigate(`/issues/${issue.id}`)}
            className={`bg-white p-4 rounded-lg border shadow-sm mb-3 cursor-pointer hover:border-[#059669] transition-all ${isDragging ? 'opacity-50 grayscale' : 'opacity-100'
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-[12px] text-[#6B7280] font-mono">{issue.public_id}</span>
                <StatusBadge status={issue.priority?.name || 'Medium'} variant="priority" />
            </div>
            <h4 className="text-[14px] font-semibold text-[#1F2937] mb-3 line-clamp-2">
                {issue.title}
            </h4>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-[#6B7280]">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-[12px]">
                        {issue.assignee ? `${issue.assignee.first_name[0]}${issue.assignee.last_name[0]}` : '??'}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-[#6B7280]">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[12px]">{issue.end_date || 'No date'}</span>
                </div>
            </div>
        </div>
    );
}

interface KanbanColumnProps {
    status: { id: number; name: string };
    issues: Issue[];
    onDrop: (issueId: number, statusId: number) => void;
}

function KanbanColumn({ status, issues, onDrop }: KanbanColumnProps) {
    const [{ isOver }, dropRef] = useDrop({
        accept: ITEM_TYPE,
        drop: (item: { id: number }) => onDrop(item.id, status.id),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <div
            ref={dropRef as any}
            className={`flex-shrink-0 w-80 flex flex-col rounded-xl bg-[#F9FAFB] border border-gray-100 p-4 min-h-[500px] transition-colors ${isOver ? 'bg-[#ECFDF5] ring-2 ring-[#059669] ring-inset' : ''
                }`}
        >
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#374151] text-[15px] uppercase tracking-wider">{status.name}</h3>
                    <span className="bg-gray-200 text-gray-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {issues.length}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {issues.map((issue) => (
                    <KanbanCard key={issue.id} issue={issue} />
                ))}
                {issues.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm italic">
                        No issues here
                    </div>
                )}
            </div>
        </div>
    );
}

export function IssuesKanbanView({ issues, onUpdate }: IssuesKanbanViewProps) {
    const { data: statuses = [] } = useStatuses();

    const handleDrop = async (issueId: number, statusId: number) => {
        const issue = issues.find((i) => i.id === issueId);
        if (issue && issue.status_id !== statusId) {
            try {
                await issuesService.updateIssue(issueId, { status_id: statusId });
                onUpdate();
            } catch (error) {
                console.error('Failed to update issue status', error);
            }
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex gap-6 overflow-x-auto p-2 min-h-full h-full">
                {statuses.map((s) => (
                    <KanbanColumn
                        key={s.id}
                        status={s}
                        issues={issues.filter((i) => i.status_id === s.id)}
                        onDrop={handleDrop}
                    />
                ))}
            </div>
        </DndProvider>
    );
}

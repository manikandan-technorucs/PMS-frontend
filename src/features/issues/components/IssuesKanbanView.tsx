import React from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import { Issue, issuesService } from '../services/issues.api';
import { useStatuses } from '@/shared/hooks/useMasterData';
import { StatusBadge } from '@/shared/components/ui/Badge/StatusBadge';
import { Clock, User } from 'lucide-react';
import { IssueCard } from './IssueCard';

const ITEM_TYPE = 'ISSUE_CARD';

interface IssuesKanbanViewProps {
    issues: Issue[];
    onUpdate: () => void;
}

interface KanbanCardProps {
    issue: Issue;
}

function KanbanCard({ issue }: KanbanCardProps) {
    const [{ isDragging }, dragRef] = useDrag({
        type: ITEM_TYPE,
        item: { id: issue.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <IssueCard
            issue={issue}
            isDragging={isDragging}
            dragRef={dragRef as any}
            className="mb-3"
        />
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
            className={`flex-shrink-0 w-80 flex flex-col rounded-xl bg-[#F9FAFB] border border-gray-100 p-4 min-h-[500px] transition-colors ${isOver ? 'bg-[#f0fdfa] ring-2 ring-[#14b8a6] ring-inset' : ''
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

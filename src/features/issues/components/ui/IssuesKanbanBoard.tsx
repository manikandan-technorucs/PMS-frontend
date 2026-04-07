import React from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import { Issue } from '../../api/issues.api';
import { Badge } from '@/components/data-display/Badge';
import { Card } from '@/components/layout/Card';
import { AlertCircle, Calendar } from 'lucide-react';

const ITEM_TYPE = 'ISSUE_CARD';

interface KanbanCardProps {
  issue: Issue;
}

interface KanbanColumnProps {
  status: { id: number; name: string };
  issues: Issue[];
  onDrop: (issueId: number, statusId: number) => void;
}

export interface IssuesKanbanBoardProps {
  issues: Issue[];
  statuses: { id: number; name: string }[];
  
  onDrop: (issueId: number, statusId: number) => void;
}

function KanbanCard({ issue }: KanbanCardProps) {
  const navigate = useNavigate();
  const [{ isDragging }, dragRef] = useDrag({
    type: ITEM_TYPE,
    item: { id: issue.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const accentColor =
    issue.status?.name?.toLowerCase() === 'completed' ||
    issue.status?.name?.toLowerCase() === 'closed'
      ? 'bg-emerald-500'
      : issue.priority?.name?.toLowerCase() === 'critical' ||
        issue.priority?.name?.toLowerCase() === 'high'
      ? 'bg-rose-500'
      : 'bg-amber-500';

  return (
    <Card
      onClick={() => navigate(`/issues/${issue.id}`)}
      subtitle={issue.public_id || `ISS-${issue.id}`}
      title={issue.title}
      accentColor={accentColor}
      className={`mb-3 cursor-pointer ${
        isDragging ? 'opacity-50 grayscale' : 'opacity-100'
      } transition-all`}
      actions={<Badge value={issue.priority?.name || 'Medium'} variant="priority" />}
    >
      <div ref={dragRef as any} className="space-y-3">
        {}
        <div className="flex items-center justify-between text-[12px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black">
              {issue.assignee
                ? `${issue.assignee.first_name[0]}${issue.assignee.last_name[0]}`
                : '??'}
            </div>
            <span className="font-medium truncate max-w-[100px]">
              {issue.assignee
                ? `${issue.assignee.first_name} ${issue.assignee.last_name}`
                : 'Unassigned'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">
              {issue.reporter ? issue.reporter.first_name : 'System'}
            </span>
          </div>
        </div>

        {issue.description && (
          <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2">
            {issue.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{issue.end_date || 'No Deadline'}</span>
          </div>
          <Badge value={issue.status?.name || 'Open'} variant="status" />
        </div>
      </div>
    </Card>
  );
}

function KanbanColumn({ status, issues, onDrop }: KanbanColumnProps) {
  const [{ isOver }, dropRef] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: number }) => onDrop(item.id, status.id),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  return (
    <Card
      className={`flex-shrink-0 w-80 flex flex-col min-h-[500px] transition-all ${
        isOver ? 'ring-2 ring-brand-teal-500 ring-inset bg-brand-teal-50/30' : ''
      }`}
      pt={{
        root: { ref: dropRef as any },
        content: { className: 'p-0 flex flex-col h-full' },
      }}
    >
      {}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-[15px] text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            {status.name}
          </h3>
          <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
            {issues.length}
          </span>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {issues.map((issue) => (
          <KanbanCard key={issue.id} issue={issue} />
        ))}
        {issues.length === 0 && (
          <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 text-[13px] italic">
            No issues here
          </div>
        )}
      </div>
    </Card>
  );
}

export function IssuesKanbanBoard({ issues, statuses, onDrop }: IssuesKanbanBoardProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-6 overflow-x-auto p-2 min-h-full h-full">
        {statuses.map((s) => (
          <KanbanColumn
            key={s.id}
            status={s}
            issues={issues.filter((i) => i.status_id === s.id)}
            onDrop={onDrop}
          />
        ))}
      </div>
    </DndProvider>
  );
}

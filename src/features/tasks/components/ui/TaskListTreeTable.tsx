import React from 'react';
import { TreeTable } from '@/components/data-display/TreeTable';
import { Column } from 'primereact/column';
import { Badge } from '@/components/data-display/Badge';
import { Task } from '@/api/services/tasks.service';
import { TimeLog } from '@/api/services/timelogs.service';
import { Card } from '@/components/layout/Card';
import { Calendar, Clock, User2, MessageSquare } from 'lucide-react';
import { differenceInDays, format, isBefore, startOfToday } from 'date-fns';

interface TaskListTreeTableProps {
  treeData: any[];
  timelogs?: TimeLog[];
  onRowClick?: (task: Task) => void;
  loading?: boolean;
}

export function TaskListTreeTable({ treeData, timelogs = [], onRowClick, loading }: TaskListTreeTableProps) {

  const idBody = (node: any) => (
    <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-lg font-bold shadow-sm whitespace-nowrap">
      {node.data.public_id || `TSK-${node.data.id}`}
    </span>
  );

  const titleBody = (node: any) => (
    <div className="flex flex-col py-0.5">
      <span className="font-bold text-[14px] text-slate-800 dark:text-slate-100 group-hover:text-brand-teal-600 transition-colors cursor-pointer truncate">
        {node.data.title}
      </span>
      {node.data.description && (
        <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[300px]">
          {node.data.description}
        </span>
      )}
    </div>
  );

  const projectBody = (node: any) => (
    <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-400">
      {node.data.project?.name || '—'}
    </span>
  );

  const assigneeBody = (node: any) => {
    const a = node.data.assignee;
    if (!a) return <span className="text-slate-300 dark:text-slate-700 text-[12px] italic">Unassigned</span>;
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 border border-white/20">
          {a.first_name?.[0]}{a.last_name?.[0]}
        </div>
        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
          {a.first_name}
        </span>
      </div>
    );
  };

  const statusBody = (node: any) => <Badge value={node.data.status?.name || 'Pending'} variant="status" />;

  const hoursBody = (node: any) => {
    const actual = timelogs.filter(l => l.task_id === node.data.id).reduce((s, l) => s + (l.hours || 0), 0);
    const estimate = node.data.estimated_hours || 0;
    return (
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="font-bold text-slate-700 dark:text-slate-200 text-[13px]">{actual.toFixed(1)}h</span>
        <span className="text-slate-400 text-[11px] font-medium">/ {estimate}h</span>
      </div>
    );
  };

  const deadlineBody = (node: any) => {
    const dateStr = node.data.due_date;
    if (!dateStr) return <span className="text-slate-400 text-[13px]">—</span>;
    
    const dDate = new Date(dateStr);
    const today = startOfToday();
    const isOverdue = isBefore(dDate, today) && node.data.status?.name !== 'Completed';
    const days = Math.abs(differenceInDays(dDate, today));

    return (
      <div className="flex flex-col leading-tight">
        <span className="text-[12px] text-slate-700 dark:text-slate-300 font-semibold">{format(dDate, 'dd MMM yyyy')}</span>
        <span className={`text-[11px] font-bold ${isOverdue ? 'text-rose-500' : 'text-emerald-600'}`}>
          {isOverdue ? `${days}d overdue` : `${days}d left`}
        </span>
      </div>
    );
  };

  const progressBody = (node: any) => {
    const pct = node.data.progress || 0;
    return (
      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-brand-teal-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[11px] font-bold text-slate-500 tabular-nums w-8 text-right">{pct}%</span>
      </div>
    );
  };

  return (
    <div className="w-full">
      <Card noPadding hoverEffect={false} className="border-slate-100 dark:border-slate-800">
        <TreeTable
            value={treeData}
            loading={loading}
            selectionMode={onRowClick ? 'single' : undefined}
            onSelect={(e: any) => { if (onRowClick && e.node?.data) onRowClick(e.node.data as Task); }}
        >
            <Column expander field="public_id" header="ID" body={idBody} style={{ width: '10rem' }} />
            <Column field="title" header="Task Title" body={titleBody} />
            <Column header="Project" body={projectBody} style={{ width: '11rem' }} />
            <Column header="Assignee" body={assigneeBody} style={{ width: '10rem' }} />
            <Column header="Status" body={statusBody} style={{ width: '8rem' }} />
            <Column header="Logged" body={hoursBody} style={{ width: '8rem' }} />
            <Column header="Deadline" body={deadlineBody} style={{ width: '10rem' }} />
            <Column header="Progress" body={progressBody} style={{ width: '9rem' }} />
        </TreeTable>
      </Card>
    </div>
  );
}

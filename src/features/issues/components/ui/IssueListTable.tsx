import React from 'react';
import { Issue } from '../../api/issues.api';
import { DataTable, DataTableColumn, LazyParams } from '@/components/data-display/DataTable';
import { Badge } from '@/components/data-display/Badge';
import { format, differenceInDays, isBefore, startOfToday } from 'date-fns';
import { Card } from '@/components/layout/Card';

interface IssueListTableProps {
  issues: Issue[];
  timelogs: any[];
  totalRecords: number;
  lazyParams: LazyParams;
  onLazyLoad: (params: LazyParams) => void;
  onRowClick: (issue: Issue) => void;
}

function UserCell({ user, email }: { user?: { first_name?: string; last_name?: string; email?: string; name?: string } | null, email?: string | null }) {
  const mail = user?.email || email;
  if (!user && !mail) return <span className="text-slate-400 text-[12px] italic">—</span>;
  
  const name = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : mail || 'Mystery User');
  const initial = user?.first_name?.[0] || user?.name?.[0] || mail?.[0] || '?';
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-teal-400 to-indigo-500 flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 border border-white/20">
        {String(initial).toUpperCase()}
      </div>
      <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]" title={String(mail)}>
        {name}
      </span>
    </div>
  );
}

export function IssueListTable({ issues, timelogs, totalRecords, lazyParams, onLazyLoad, onRowClick }: IssueListTableProps) {
  const columns: DataTableColumn<Issue>[] = [
    {
      key: 'public_id',
      header: 'ID',
      sortable: true,
      render: (_, row) => (
        <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-lg font-bold shadow-sm whitespace-nowrap">
          {row.public_id || `ISS-${row.id}`}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Issue Description',
      sortable: true,
      render: (_, row) => (
        <div className="flex flex-col py-0.5">
          <p className="font-bold text-[14px] text-slate-800 dark:text-slate-100 group-hover:text-brand-teal-600 transition-colors">
            {row.title}
          </p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[250px]">
            {row.project?.name || 'Local Scope Issue'}
          </span>
        </div>
      ),
    },
    {
        key: 'assignee',
        header: 'Responsible',
        render: (_, row) => <UserCell user={row.assignee} email={row.assignee_email} />,
        width: '10rem'
    },
    {
      key: 'status',
      header: 'Workflow',
      sortable: true,
      render: (_, row) => <Badge value={row.status?.name || 'New'} variant="status" />,
      width: '8rem'
    },
    {
      key: 'priority',
      header: 'Severity',
      sortable: true,
      render: (_, row) => <Badge value={row.priority?.name || 'Normal'} variant="priority" />,
      width: '8rem'
    },
    {
      key: 'end_date',
      header: 'Deadline',
      sortable: true,
      render: (_, row) => {
        const dateStr = row.end_date || (row as any).due_date;
        if (!dateStr) return <span className="text-slate-400 text-[13px]">—</span>;
        
        let dDate;
        try {
          dDate = new Date(dateStr);
          if (isNaN(dDate.getTime())) throw new Error();
        } catch (e) {
          return <span className="text-slate-400 text-[13px]">{dateStr}</span>;
        }

        const today = startOfToday();
        const isOverdue = isBefore(dDate, today) && row.status?.name !== 'Completed' && row.status?.name !== 'Closed';
        const days = Math.abs(differenceInDays(dDate, today));

        return (
          <div className="flex flex-col leading-tight whitespace-nowrap">
            <span className="text-[12px] text-slate-700 dark:text-slate-300 font-semibold">{format(dDate, 'dd MMM yyyy')}</span>
            <span className={`text-[11px] font-bold ${isOverdue ? 'text-rose-500' : 'text-emerald-600'}`}>
              {isOverdue ? `${days}d overdue` : `${days}d left`}
            </span>
          </div>
        );
      },
      width: '10rem'
    },
    {
      key: 'created_at',
      header: 'Created On',
      sortable: true,
      render: (_, row: any) => {
        const val = row.created_at || row.createdAt || row.created_on || row.CreatedOn || row.id_date || row.date_added;
        if (!val) return <span className="text-slate-400 text-[12px] italic">—</span>;
        
        try {
          const d = new Date(val);
          if (isNaN(d.getTime())) {
             
             return <span className="text-[12px] text-slate-400 font-medium whitespace-nowrap">{val}</span>;
          }
          return (
            <span className="text-[12px] text-slate-400 font-medium whitespace-nowrap">
               {format(d, 'dd MMM yyyy')}
            </span>
          );
        } catch {
          return <span className="text-[12px] text-slate-400 font-medium whitespace-nowrap">{val}</span>;
        }
      },
      width: '9rem'
    },
  ];

  return (
    <Card noPadding hoverEffect={false} className="border-slate-100 dark:border-slate-800">
        <DataTable
            columns={columns}
            data={issues}
            selectable
            onRowClick={onRowClick}
            itemsPerPage={lazyParams.rows}
            lazy
            totalRecords={totalRecords}
            lazyParams={lazyParams}
            onLazyLoad={onLazyLoad}
        />
    </Card>
  );
}

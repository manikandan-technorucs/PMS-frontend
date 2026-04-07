import React, { useRef } from 'react';
import { TimeLog } from '../../api/timelogs.api';
import { DataTable, DataTableColumn } from '@/components/data-display/DataTable';
import { Button } from '@/components/forms/Button';
import { Badge } from '@/components/data-display/Badge';
import { Menu } from 'primereact/menu';
import { Edit2, MoreVertical, Trash2, Clock, FolderKanban } from 'lucide-react';

interface TimeLogTableProps {
  timelogs: TimeLog[];
  onDelete: (id: number) => void;
  onEdit?: (log: TimeLog) => void;
}

const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');

function formatHHMM(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${pad(h)}:${pad(m)}`;
}

function ActionMenu({
  entry,
  onEdit,
  onDelete,
}: {
  entry: TimeLog;
  onEdit?: (log: TimeLog) => void;
  onDelete: (id: number) => void;
}) {
  const menu = useRef<Menu>(null);

  const items = [
    ...(onEdit
      ? [{ label: 'Edit', icon: <Edit2 size={13} />, command: () => onEdit(entry) }]
      : []),
    {
      label: 'Delete',
      icon: <Trash2 size={13} className="text-red-500" />,
      command: () => onDelete(entry.id),
      className: '!text-red-600',
    },
  ] as any[];

  return (
    <div className="flex justify-end">
      <Menu
        model={items}
        popup
        ref={menu}
        id={`tl_menu_${entry.id}`}
        pt={{
          menu:    { className: 'p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[var(--shadow-elevated)]' },
          content: { className: 'text-[13px] font-medium rounded-lg' },
          action:  { className: 'px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-2' },
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={(e) => menu.current?.toggle(e)}
        aria-controls={`tl_menu_${entry.id}`}
        aria-haspopup
        className="!w-8 !h-8 !p-0 flex items-center justify-center"
      >
        <MoreVertical size={15} className="text-slate-400" />
      </Button>
    </div>
  );
}

export function TimeLogTable({ timelogs, onDelete, onEdit }: TimeLogTableProps) {
  const columns: DataTableColumn<TimeLog>[] = [
    {
      key: 'public_id',
      header: 'ID',
      width: '90px',
      render: (_, entry) => (
        <span
          className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md"
          style={{
            background: 'var(--primary-subtle)',
            color: 'var(--primary)',
          }}
        >
          #{entry.id}
        </span>
      ),
    },
    {
      key: 'log_title',
      header: 'Log Title',
      render: (_, entry) => (
        <div>
          <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)', lineHeight: '1.4' }}>
            {entry.log_title || entry.task?.title || entry.issue?.title || 'Untitled'}
          </p>
          {entry.description && (
            <p
              className="text-[11px] mt-0.5 truncate max-w-[260px] italic"
              style={{ color: 'var(--text-muted)' }}
            >
              {entry.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'project',
      header: 'Project',
      render: (_, entry) => {
        const name = entry.project?.name || entry.task?.project?.name;
        if (!name) return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>;
        return (
          <div className="flex items-center gap-1.5">
            <FolderKanban
              size={11}
              style={{ color: 'var(--primary)', flexShrink: 0 }}
            />
            <span className="text-[12px] font-medium truncate max-w-[180px]" style={{ color: 'var(--primary)' }}>
              {name}
            </span>
          </div>
        );
      },
    },
    {
      key: 'hours',
      header: 'Daily Log',
      sortable: true,
      width: '110px',
      render: (_, entry) => (
        <div className="flex items-center gap-1.5">
          <Clock size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span
            className="text-[15px] font-bold tabular-nums"
            style={{ color: 'var(--primary)' }}
          >
            {formatHHMM(Number(entry.hours ?? 0))}
          </span>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Time Period',
      sortable: true,
      width: '130px',
      render: (_, entry) => {
        if (!entry.date) return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>;
        const d = new Date(entry.date);
        return (
          <span className="text-[12px] font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        );
      },
    },
    {
      key: 'user',
      header: 'User',
      render: (_, entry) =>
        entry.user ? (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #6366f1 100%)' }}
            >
              {entry.user.first_name?.[0]}
              {entry.user.last_name?.[0]}
            </div>
            <span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
              {entry.user.first_name} {entry.user.last_name}
            </span>
          </div>
        ) : (
          <span className="text-[12px] italic" style={{ color: 'var(--text-muted)' }}>Unknown</span>
        ),
    },
    {
      key: 'billing_type',
      header: 'Billing Type',
      width: '130px',
      render: (_, entry) => (
        <Badge
          value={entry.billing_type || 'Billable'}
          severity={
            entry.billing_type === 'Billable'
              ? 'success'
              : entry.billing_type === 'Non-Billable'
              ? 'secondary'
              : 'info'
          }
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '50px',
      render: (_, entry) => (
        <ActionMenu entry={entry} onEdit={onEdit} onDelete={onDelete} />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={timelogs}
      itemsPerPage={20}
    />
  );
}

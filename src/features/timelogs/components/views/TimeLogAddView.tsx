import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { FormField } from '@/components/forms/FormField';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { useTimelogActions } from '../../hooks/useTimelogActions';
import { useToast } from '@/providers/ToastContext';
import { timelogsService } from '../../api/timelogs.api';
import { projectsService } from '@/api/services/projects.service';
import { useAuth } from '@/auth/AuthProvider';
import {
  Clock,
  Timer,
  Zap,
  FolderKanban,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

const addSchema = z.object({
  project_id:   z.any().refine((v) => !!v, { message: 'Project is required' }),
  work_item:    z.any().optional().nullable(),
  log_title:    z.string().trim().min(1, 'Log title is required'),
  date:         z.string().min(1, 'Date is required'),
  billing_type: z.enum(['Billable', 'Non-Billable', 'Internal']).default('Billable'),
  description:  z.string().trim().optional(),
  duration_h:   z.coerce.number().min(0).max(23).optional(),
  duration_m:   z.coerce.number().min(0).max(59).optional(),
  start_h:      z.coerce.number().min(0).max(23).optional(),
  start_m:      z.coerce.number().min(0).max(59).optional(),
  start_ampm:   z.enum(['am', 'pm']).optional(),
  end_h:        z.coerce.number().min(0).max(23).optional(),
  end_m:        z.coerce.number().min(0).max(59).optional(),
  end_ampm:     z.enum(['am', 'pm']).optional(),
});

type AddFormValues = z.infer<typeof addSchema>;

const extractId = (val: any): number | null =>
  val && typeof val === 'object' ? val.id : val ?? null;

const pad = (n: number) => String(n).padStart(2, '0');

const hoursOpts  = Array.from({ length: 24 }, (_, i) => ({ label: pad(i), value: i }));
const minuteOpts = Array.from({ length: 60 }, (_, i) => ({ label: pad(i), value: i }));
const ampmOpts   = [{ label: 'am', value: 'am' }, { label: 'pm', value: 'pm' }];
const billingOpts = [
  { label: 'Billable',     value: 'Billable' },
  { label: 'Non-Billable', value: 'Non-Billable' },
  { label: 'Internal',     value: 'Internal' },
];

function toDecimalHours(h: number, m: number, startH: number, startM: number, sa: 'am'|'pm', endH: number, endM: number, ea: 'am'|'pm', mode: 'duration'|'range'): number {
  if (mode === 'duration') {
    return h + m / 60;
  }
  const to24 = (hour: number, ampm: 'am'|'pm') => {
    if (ampm === 'pm' && hour !== 12) return hour + 12;
    if (ampm === 'am' && hour === 12) return 0;
    return hour;
  };
  const startMin = to24(startH, sa) * 60 + startM;
  const endMin   = to24(endH, ea) * 60 + endM;
  const diff = endMin - startMin;
  return diff > 0 ? diff / 60 : 0;
}

interface CapacityBannerProps {
  projectId: number | null;
}

function CapacityBanner({ projectId }: CapacityBannerProps) {
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsService.getProject(projectId!),
    enabled: !!projectId,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['timelogs', 'project', projectId],
    queryFn: () => timelogsService.getTimelogs(0, 2000, projectId!),
    enabled: !!projectId,
  });

  if (!projectId || !project) return null;

  const estimated  = Number(project.estimated_hours ?? 0);
  const logged     = logs.reduce((sum, l) => sum + Number(l.hours ?? 0), 0);
  const remaining  = estimated - logged;
  const pct        = estimated > 0 ? Math.min((logged / estimated) * 100, 100) : 0;

  const status: 'ok' | 'warn' | 'over' =
    pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'ok';

  const statusCfg = {
    ok:   { icon: <CheckCircle2 size={16} />,  label: 'On Track',   bar: 'from-teal-400 to-teal-500' },
    warn: { icon: <AlertTriangle size={16} />, label: 'Near Limit', bar: 'from-amber-400 to-orange-500' },
    over: { icon: <TrendingUp size={16} />,    label: 'Exceeded',   bar: 'from-red-400 to-red-600' },
  }[status];

  return (
    <div
      className="rounded-2xl overflow-hidden mb-6"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
      }}
    >
      <div
        className="px-5 py-3 flex items-center gap-2.5"
        style={{ background: 'linear-gradient(135deg, #B3F57B 0%, #0CD1C3 100%)' }}
      >
        <Zap size={15} className="text-slate-800" />
        <span className="text-[13px] font-bold text-slate-900 tracking-wide">
          Project Capacity — {project.name}
        </span>
        <span
          className="ml-auto flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(0,0,0,0.1)', color: '#1e293b' }}
        >
          {statusCfg.icon}
          {statusCfg.label}
        </span>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center gap-6 flex-wrap mb-3">
          <StatChip label="Estimated" value={`${estimated.toFixed(1)}h`} color="var(--text-secondary)" />
          <StatChip label="Logged" value={`${logged.toFixed(1)}h`} color="#14b8a6" />
          <StatChip
            label="Remaining"
            value={remaining >= 0 ? `${remaining.toFixed(1)}h` : `−${Math.abs(remaining).toFixed(1)}h`}
            color={status === 'over' ? '#ef4444' : status === 'warn' ? '#f59e0b' : '#14b8a6'}
          />
        </div>

        {estimated > 0 && (
          <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
            <div
              className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${statusCfg.bar} transition-all duration-700`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
        {estimated === 0 && (
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            No estimated hours set for this project.
          </p>
        )}
      </div>
    </div>
  );
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span className="text-[20px] font-extrabold tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

// ── Select helpers ─────────────────────────────────────────────────────────────────

const dropdownPt = {
  root: {
    style: {
      background: 'var(--input-bg)',
      border: '1px solid var(--input-border)',
      borderRadius: '8px',
      color: 'var(--text-primary)',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },
  },
  label: { style: { color: 'var(--text-primary)', fontSize: '13px', padding: '0 10px', lineHeight: '1' } },
  trigger: { style: { color: 'var(--text-secondary)', width: '30px' } },
  panel: {
    style: {
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
      marginTop: '4px',
    },
  },
  item: { style: { color: 'var(--text-primary)', fontSize: '13px', padding: '9px 14px' } },
};

const compactDropdownPt = {
  root: {
    style: {
      background: 'var(--input-bg)',
      border: '1px solid var(--input-border)',
      borderRadius: '8px',
      color: 'var(--text-primary)',
      height: '38px',
      display: 'flex',
      alignItems: 'center',
    },
  },
  label: { style: { color: 'var(--text-primary)', fontSize: '13px', padding: '0 8px', lineHeight: '1', minWidth: '36px' } },
  trigger: { style: { color: 'var(--text-secondary)', width: '22px', flexShrink: 0 } },
  panel: {
    style: {
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
      marginTop: '4px',
      minWidth: '80px',
    },
  },
  item: { style: { color: 'var(--text-primary)', fontSize: '13px', padding: '8px 12px' } },
};

// ── Main view ─────────────────────────────────────────────────────────────────────

export function TimeLogAddView() {
  const navigate            = useNavigate();
  const [searchParams]      = useSearchParams();
  const { showToast }       = useToast();
  const { user }            = useAuth();
  const { createTimelog }   = useTimelogActions();

  const [timeMode, setTimeMode]   = useState<'duration' | 'range'>('duration');
  const [submitting, setSubmitting] = useState(false);

  const preselectedProjectId = searchParams.get('project_id');

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddFormValues>({
    resolver: zodResolver(addSchema) as any,
    defaultValues: {
      project_id:   preselectedProjectId ? Number(preselectedProjectId) : null,
      work_item:    null,
      log_title:    '',
      date:         new Date().toISOString().split('T')[0],
      billing_type: 'Billable',
      description:  '',
      duration_h:   0,
      duration_m:   30,
      start_h:      9,
      start_m:      0,
      start_ampm:   'am',
      end_h:        10,
      end_m:        0,
      end_ampm:     'am',
    },
  });

  const watchedProject = watch('project_id');
  const projectId      = extractId(watchedProject);

  const onSubmit = async (data: AddFormValues) => {
    setSubmitting(true);
    try {
      const pid  = extractId(data.project_id);
      let tId: number | null = null;
      let iId: number | null = null;

      if (data.work_item) {
        if ((data.work_item as any).type === 'issue') iId = extractId(data.work_item);
        else                                          tId = extractId(data.work_item);
      }

      const totalHours = toDecimalHours(
        data.duration_h ?? 0,
        data.duration_m ?? 0,
        data.start_h    ?? 9,
        data.start_m    ?? 0,
        data.start_ampm ?? 'am',
        data.end_h      ?? 10,
        data.end_m      ?? 0,
        data.end_ampm   ?? 'am',
        timeMode,
      );

      if (totalHours <= 0) {
        showToast('error', 'Validation', 'Hours logged must be greater than 0.');
        return;
      }

      await createTimelog.mutateAsync({
        project_id:      pid!,
        task_id:         tId,
        issue_id:        iId,
        user_email:      user?.email || '',
        date:            data.date,
        hours:           totalHours,
        log_title:       data.log_title,
        description:     data.description,
        billing_type:    data.billing_type,
        approval_status: 'Pending',
        general_log:     !tId && !iId,
      });

      showToast('success', 'Time Logged', 'Entry recorded successfully.');
      navigate('/time-log');
    } catch (err: any) {
      showToast('error', 'Error', err?.message || 'Failed to log time.');
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || createTimelog.isPending;

  return (
    <PageLayout
      title="Add Time Log"
      showBackButton
      backPath="/time-log"
      actions={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/time-log')} disabled={isBusy}>
            Cancel
          </Button>
          <button
            type="button"
            disabled={isBusy}
            onClick={handleSubmit(onSubmit as any)}
            className="inline-flex items-center justify-center gap-2 font-bold px-5 rounded-lg text-slate-900 text-[13px] transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              height: '40px',
              background: 'linear-gradient(135deg, #B3F57B 0%, #0CD1C3 100%)',
              boxShadow: '0 4px 15px rgba(12, 209, 195, 0.35)',
            }}
          >
            <Clock size={15} />
            {isBusy ? 'Saving…' : 'Log Time'}
          </button>
        </div>
      }
    >
      <div
        className="max-w-3xl mx-auto rounded-2xl"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        }}
      >
        <div
          className="px-6 py-4 flex items-center gap-3 rounded-t-2xl"
          style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #B3F57B 0%, #0CD1C3 100%)' }}
          >
            <Clock size={15} className="text-slate-900" />
          </div>
          <div>
            <p className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>New Time Log</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Time logging is not allowed for future dates and times • Log hours cannot exceed the allotted Task work hours.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit as any)} className="p-6 space-y-5">

          <CapacityBanner projectId={projectId} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Project" required error={errors.project_id?.message as string}>
              <Controller
                name="project_id"
                control={control}
                render={({ field }) => (
                  <ServerSearchDropdown
                    entityType="projects"
                    placeholder="Select Project"
                    value={field.value}
                    onChange={(v) => {
                      field.onChange(v);
                      setValue('work_item', null);
                    }}
                    className="w-full"
                  />
                )}
              />
            </FormField>

            <Controller
              name="project_id"
              control={control}
              render={({ field: pf }) => {
                const pId = extractId(pf.value);
                return (
                  <FormField label="Task / Bug">
                    <Controller
                      name="work_item"
                      control={control}
                      render={({ field }) => (
                        <ServerSearchDropdown
                          entityType="workitems"
                          endpoint="/search/work-items"
                          field="name"
                          project_id={pId}
                          disabled={!pId}
                          placeholder="Search task or bug…"
                          value={field.value}
                          onChange={field.onChange}
                          className="w-full"
                        />
                      )}
                    />
                  </FormField>
                );
              }}
            />
          </div>

          <FormField label="Log Title" required error={errors.log_title?.message}>
            <InputText
              {...register('log_title')}
              placeholder="e.g. Client meeting, Sprint planning…"
              className="w-full"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                height: '40px',
                padding: '0 12px',
                fontSize: '13px',
                width: '100%',
              }}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Date" required error={errors.date?.message}>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <Calendar
                    value={field.value ? new Date(field.value) : null}
                    onChange={(e) =>
                      field.onChange(
                        e.value
                          ? new Date(e.value as Date).toISOString().split('T')[0]
                          : '',
                      )
                    }
                    maxDate={new Date()}
                    dateFormat="dd-mm-yy"
                    showIcon
                    inputStyle={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      borderRadius: '8px 0 0 8px',
                      color: 'var(--text-primary)',
                      height: '40px',
                      fontSize: '13px',
                      width: '100%',
                    }}
                    panelStyle={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                    }}
                    className="w-full"
                  />
                )}
              />
            </FormField>

            <FormField label="User">
              <InputText
                value={user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email : ''}
                readOnly
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--input-border)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  height: '40px',
                  padding: '0 12px',
                  fontSize: '13px',
                  width: '100%',
                  cursor: 'default',
                }}
              />
            </FormField>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Daily Log
              </span>
              <div
                className="flex rounded-lg overflow-hidden"
                style={{ border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}
              >
                <button
                  type="button"
                  onClick={() => setTimeMode('duration')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold transition-all"
                  style={{
                    background: timeMode === 'duration' ? 'linear-gradient(135deg, #B3F57B 0%, #0CD1C3 100%)' : 'transparent',
                    color: timeMode === 'duration' ? '#1e293b' : 'var(--text-secondary)',
                  }}
                >
                  <Clock size={12} /> Duration
                </button>
                <button
                  type="button"
                  onClick={() => setTimeMode('range')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold transition-all"
                  style={{
                    background: timeMode === 'range' ? 'linear-gradient(135deg, #B3F57B 0%, #0CD1C3 100%)' : 'transparent',
                    color: timeMode === 'range' ? '#1e293b' : 'var(--text-secondary)',
                  }}
                >
                  <Timer size={12} /> Start & End
                </button>
              </div>
            </div>

            {timeMode === 'duration' ? (
              <div className="flex items-center gap-2">
                <Controller name="duration_h" control={control} render={({ field }) => (
                  <Dropdown
                    value={field.value}
                    options={hoursOpts}
                    onChange={(e) => field.onChange(e.value)}
                    pt={compactDropdownPt}
                    style={{ minWidth: '80px' }}
                  />
                )} />
                <span className="text-[16px] font-bold" style={{ color: 'var(--text-muted)' }}>h</span>
                <Controller name="duration_m" control={control} render={({ field }) => (
                  <Dropdown
                    value={field.value}
                    options={minuteOpts}
                    onChange={(e) => field.onChange(e.value)}
                    pt={compactDropdownPt}
                    style={{ minWidth: '80px' }}
                  />
                )} />
                <span className="text-[16px] font-bold" style={{ color: 'var(--text-muted)' }}>m</span>
                <span className="ml-2 text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {`${pad(watch('duration_h') ?? 0)}:${pad(watch('duration_m') ?? 0)}`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[12px] font-semibold w-10" style={{ color: 'var(--text-muted)' }}>From</span>
                <div className="flex items-center gap-1">
                  <Controller name="start_h" control={control} render={({ field }) => (
                    <Dropdown value={field.value} options={Array.from({ length: 12 }, (_, i) => ({ label: pad(i + 1), value: i + 1 }))}
                      onChange={(e) => field.onChange(e.value)} pt={compactDropdownPt} style={{ minWidth: '70px' }} />
                  )} />
                  <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>:</span>
                  <Controller name="start_m" control={control} render={({ field }) => (
                    <Dropdown value={field.value} options={minuteOpts} onChange={(e) => field.onChange(e.value)}
                      pt={compactDropdownPt} style={{ minWidth: '70px' }} />
                  )} />
                  <Controller name="start_ampm" control={control} render={({ field }) => (
                    <Dropdown value={field.value} options={ampmOpts} onChange={(e) => field.onChange(e.value)}
                      pt={compactDropdownPt} style={{ minWidth: '65px' }} />
                  )} />
                </div>
                <span className="text-[12px] font-semibold w-4" style={{ color: 'var(--text-muted)' }}>to</span>
                <div className="flex items-center gap-1">
                  <Controller name="end_h" control={control} render={({ field }) => (
                    <Dropdown value={field.value} options={Array.from({ length: 12 }, (_, i) => ({ label: pad(i + 1), value: i + 1 }))}
                      onChange={(e) => field.onChange(e.value)} pt={compactDropdownPt} style={{ minWidth: '70px' }} />
                  )} />
                  <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>:</span>
                  <Controller name="end_m" control={control} render={({ field }) => (
                    <Dropdown value={field.value} options={minuteOpts} onChange={(e) => field.onChange(e.value)}
                      pt={compactDropdownPt} style={{ minWidth: '70px' }} />
                  )} />
                  <Controller name="end_ampm" control={control} render={({ field }) => (
                    <Dropdown value={field.value} options={ampmOpts} onChange={(e) => field.onChange(e.value)}
                      pt={compactDropdownPt} style={{ minWidth: '65px' }} />
                  )} />
                </div>
                <span
                  className="ml-1 text-[12px] font-bold px-2 py-1 rounded-lg"
                  style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}
                >
                  {(() => {
                    const to24 = (h: number, ampm: 'am' | 'pm') => {
                      if (ampm === 'pm' && h !== 12) return h + 12;
                      if (ampm === 'am' && h === 12) return 0;
                      return h;
                    };
                    const sm = to24(watch('start_h') ?? 9, watch('start_ampm') ?? 'am') * 60 + (watch('start_m') ?? 0);
                    const em = to24(watch('end_h') ?? 10, watch('end_ampm') ?? 'am') * 60 + (watch('end_m') ?? 0);
                    const diff = em - sm;
                    if (diff <= 0) return '0:00';
                    return `${Math.floor(diff / 60)}:${pad(diff % 60)}`;
                  })()}
                </span>
              </div>
            )}
          </div>

          <FormField label="Billing Type" required error={errors.billing_type?.message}>
            <Controller
              name="billing_type"
              control={control}
              render={({ field }) => (
                <Dropdown
                  value={field.value}
                  options={billingOpts}
                  onChange={(e) => field.onChange(e.value)}
                  filter
                  pt={dropdownPt}
                  className="w-full"
                />
              )}
            />
          </FormField>

          <FormField label="Notes" error={errors.description?.message}>
            <InputTextarea
              {...register('description')}
              rows={4}
              placeholder="Describe what you worked on… (supports markdown notes)"
              autoResize
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                padding: '10px 12px',
                fontSize: '13px',
                width: '100%',
                resize: 'vertical',
              }}
            />
          </FormField>

          <div
            className="flex items-center justify-between pt-4"
            style={{ borderTop: '1px solid var(--border-color)' }}
          >
            <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
              <FolderKanban size={13} />
              Logged as <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" type="button" onClick={() => navigate('/time-log')} disabled={isBusy}>
                Cancel
              </Button>
              <button
                type="submit"
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-2 font-bold px-5 rounded-lg text-slate-900 text-[13px] transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  height: '40px',
                  background: 'linear-gradient(135deg, #B3F57B 0%, #0CD1C3 100%)',
                  boxShadow: '0 4px 15px rgba(12, 209, 195, 0.35)',
                }}
              >
                <Clock size={15} />
                {isBusy ? 'Saving…' : 'Add'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}

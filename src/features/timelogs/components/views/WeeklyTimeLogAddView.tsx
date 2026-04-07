// src/features/timelogs/components/views/WeeklyTimeLogAddView.tsx
import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { WeeklyMatrixForm } from '../ui/WeeklyMatrixForm';
import { useTimelogActions } from '../../hooks/useTimelogActions';
import { useToast } from '@/providers/ToastContext';

const rowSchema = z.object({
  project: z.any().refine(val => !!val, { message: 'Project is required' }),
  task: z.any().optional(),
  hours: z.array(z.coerce.number().min(0).max(24, 'Max 24h/day')),
});

const weeklySchema = z.object({
  logs: z.array(rowSchema).min(1, 'At least one row required'),
});

type WeeklyFormValues = z.infer<typeof weeklySchema>;

const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

export function WeeklyTimeLogAddView() {
  const navigate = useNavigate();
  const { bulkCreateTimelogs } = useTimelogActions();
  const { showToast } = useToast();
  const [dateReference, setDateReference] = useState(new Date());

  const weekDays = useMemo(() => {
    const dates = [];
    const dt = new Date(dateReference);
    const day = dt.getDay(); // 0-6
    dt.setDate(dt.getDate() - day);
    for (let i = 0; i < 7; i++) {
      const nd = new Date(dt);
      nd.setDate(nd.getDate() + i);
      dates.push(nd);
    }
    return dates;
  }, [dateReference]);

  const { control, register, handleSubmit, setValue, formState: { errors } } = useForm<WeeklyFormValues>({
    resolver: zodResolver(weeklySchema) as any,
    defaultValues: {
      logs: [{ project: null, task: null, hours: [0, 0, 0, 0, 0, 0, 0] }],
    },
  });

  const handleDateShift = (direction: 'prev' | 'next') => {
    setDateReference(prev => {
      const nd = new Date(prev);
      nd.setDate(nd.getDate() + (direction === 'next' ? 7 : -7));
      return nd;
    });
  };

  const onSubmit = async (data: WeeklyFormValues) => {
    const payloads: any[] = [];
    let hasHours = false;

    for (const row of data.logs) {
      const projectId = extractId(row.project);
      if (!projectId) continue;

      let tId = null, iId = null;
      if (row.task) {
        if (row.task.type === 'issue') iId = extractId(row.task);
        else tId = extractId(row.task);
      }

      for (let i = 0; i < 7; i++) {
        if (row.hours[i] && row.hours[i] > 0) {
          hasHours = true;
          const logDate = new Date(weekDays[i]);
          const dateStr = [
            logDate.getFullYear(),
            String(logDate.getMonth() + 1).padStart(2, '0'),
            String(logDate.getDate()).padStart(2, '0')
          ].join('-');

          payloads.push({
            project_id: projectId,
            task_id: tId,
            issue_id: iId,
            date: dateStr,
            hours: row.hours[i],
            billing_type: 'Billable',
            approval_status: 'Pending',
            general_log: !tId && !iId,
            description: '',
            log_title: ''
          });
        }
      }
    }

    if (!hasHours) {
      showToast('error', 'Validation', 'No hours entered on any filled rows.');
      return;
    }

    try {
      await bulkCreateTimelogs.mutateAsync({ logs: payloads });
      showToast('success', 'Saved', 'Weekly time logs saved.');
      navigate('/time-log');
    } catch (err: any) {
      showToast('error', 'Error', err?.message || 'Failed to save periodic time logs.');
    }
  };

  const isBusy = bulkCreateTimelogs.isPending;

  return (
    <PageLayout
      title="Weekly Time Log"
      showBackButton
      backPath="/time-log"
      actions={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/time-log')}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit as any)} loading={isBusy} disabled={isBusy}>
            Save Logs
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit as any)}>
        <WeeklyMatrixForm
          control={control}
          register={register}
          setValue={setValue}
          days={weekDays}
          onDateShift={handleDateShift}
          errors={errors}
        />
      </form>
    </PageLayout>
  );
}

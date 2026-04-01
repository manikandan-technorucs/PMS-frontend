import React, { useState, useEffect } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/providers/ToastContext';
import { useAuth } from '@/auth/AuthProvider';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface TimeLogDrawerFormProps {
  visible: boolean;
  onHide: () => void;
  onSuccess?: () => void;
  initialDate?: Date;
  initialProjectId?: number | null;
  initialTaskId?: number | null;
}

const BILLING_TYPES = ['Billable', 'Non-Billable', 'Internal'];

export function TimeLogDrawerForm({
  visible,
  onHide,
  onSuccess,
  initialDate = new Date(),
  initialProjectId = null,
  initialTaskId = null,
}: TimeLogDrawerFormProps) {
  const { post, isSubmitting } = useApi();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [form, setForm] = useState({
    project_id: null as any,
    task_id: null as any,
    issue_id: null as any,
    date: initialDate,
    hours: '1.0',
    billing_type: 'Billable',
    log_title: '',
    description: '',
  });

  const [dateStr, setDateStr] = useState(format(initialDate, 'yyyy-MM-dd'));

  useEffect(() => {
    if (visible) {
      setForm((prev) => ({
        ...prev,
        date: initialDate,
        project_id: initialProjectId ? { id: initialProjectId } : null,
        task_id: initialTaskId ? { id: initialTaskId } : null,
      }));
      setDateStr(format(initialDate, 'yyyy-MM-dd'));
    }
  }, [visible, initialDate, initialProjectId, initialTaskId]);

  const set = (field: string, val: any) => setForm((prev) => ({ ...prev, [field]: val }));

  const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

  const handleWorkItemChange = (val: any) => {
    if (!val) {
      set('task_id', null);
      set('issue_id', null);
      return;
    }
    if (val.type === 'issue') {
      setForm((prev) => ({ ...prev, task_id: null, issue_id: val }));
    } else {
      setForm((prev) => ({ ...prev, task_id: val, issue_id: null }));
    }
  };

  const isFormValid = !!(form.project_id && dateStr && form.hours && Number(form.hours) > 0);

  const handleSave = async () => {
    if (!isFormValid) return;
    try {
      await post('/timelogs/', {
        project_id: extractId(form.project_id),
        task_id: extractId(form.task_id),
        issue_id: extractId(form.issue_id),
        user_email: user?.email || '',
        date: dateStr,
        hours: Number(form.hours),
        description: form.description,
        log_title: form.log_title || form.description.substring(0, 50),
        billing_type: form.billing_type,
        approval_status: 'Pending',
        general_log: !form.task_id && !form.issue_id,
      });
      showToast('success', 'Time Log Created', 'Successfully logged hours');
      if (onSuccess) onSuccess();
      onHide();
    } catch (err: any) {
      showToast('error', 'Error', err?.message || 'Failed to create time log');
    }
  };

  const drawerHeader = (
    <div className="flex items-center gap-2 px-2 text-slate-800 dark:text-slate-100">
      <Clock className="w-5 h-5 text-teal-500" />
      <h2 className="text-lg font-bold">Log Time</h2>
    </div>
  );

  return (
    <Sidebar
      visible={visible}
      position="right"
      onHide={onHide}
      header={drawerHeader}
      className="w-full md:w-[450px] lg:w-[500px] border-l border-white/10 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl backdrop-blur-xl"
      pt={{
        content: { className: 'p-0 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 hide-scrollbar' },
        header: { className: 'border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur pb-3 pt-4 px-6' },
        closeButton: { className: 'hover:bg-slate-100 dark:hover:bg-slate-800 w-8 h-8 rounded-lg outline-none' }
      }}
    >
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        
        {}
        <div className="space-y-4 p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Project <span className="text-red-500">*</span></label>
            <ServerSearchDropdown
              endpoint="/projects/search"
              placeholder="Search project..."
              value={form.project_id}
              onChange={(v) => {
                set('project_id', v);
                if (!v) { set('task_id', null); set('issue_id', null); }
              }}
              labelField="name"
              entityType="projects"
              className="w-full"
            />
          </div>

          <div>
             <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Job / Task / Issue</label>
             <ServerSearchDropdown
              endpoint="/search/workitems"
              placeholder={form.project_id ? "Search tasks or issues..." : "Select project first"}
              disabled={!form.project_id}
              project_id={extractId(form.project_id)}
              value={form.issue_id || form.task_id}
              onChange={handleWorkItemChange}
              labelField="title"
              entityType="tasks"
              className="w-full"
            />
          </div>
        </div>

        {}
        <div className="space-y-4 p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={dateStr}
                onChange={(e) => {
                  setDateStr(e.target.value);
                  set('date', new Date(e.target.value));
                }}
                className="w-full !rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Daily Hours <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                max="24"
                value={form.hours}
                onChange={(e) => set('hours', e.target.value)}
                placeholder="e.g. 2.5"
                className="w-full !rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        {}
        <div className="space-y-4 p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Billing Type</label>
            <Select
              options={BILLING_TYPES.map(t => ({ label: t, value: t }))}
              value={form.billing_type}
              onChange={(e) => set('billing_type', e.target.value)}
              className="w-full !rounded-xl"
            />
          </div>

          <div>
             <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Notes</label>
             <Textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="What did you work on?"
              rows={4}
              className="w-full !rounded-xl resize-none text-sm leading-relaxed"
            />
          </div>
        </div>

      </div>

      {}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 z-10 shrink-0">
        <Button 
          label="Cancel" 
          onClick={onHide} 
          disabled={isSubmitting}
          className="p-button-text p-button-secondary !font-semibold !px-5"
        />
        <Button 
          label={isSubmitting ? "Saving..." : "Save Time Log"} 
          icon={isSubmitting ? "pi pi-spinner pi-spin" : "pi pi-check"} 
          onClick={handleSave} 
          disabled={!isFormValid || isSubmitting}
          loading={isSubmitting}
          className="btn-gradient !font-semibold !px-6 !py-2.5 !rounded-xl shadow-lg shadow-teal-500/20"
        />
      </div>
    </Sidebar>
  );
}

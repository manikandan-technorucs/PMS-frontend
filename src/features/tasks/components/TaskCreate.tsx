import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntity } from '@/hooks/useEntity';
import { useApi } from '@/hooks/useApi';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import CoreSearchableMultiSelect from '@/components/core/SearchableMultiSelect';
import SharedCalendar from '@/components/core/SharedCalendar';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Input } from '@/components/ui/Input/Input';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { FormHeader, FormField, FormCard } from '@/components/ui/Form';
import { ClipboardList, Plus } from 'lucide-react';
import { z } from 'zod';

const BILLING_TYPES = ['Billable', 'Non-Billable', 'Internal'];
const TASK_STATUSES = ['Open', 'In Progress', 'In Review', 'To Be Tested', 'Completed', 'On Hold', 'Closed'];
const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  start_date: z.any().refine((val) => val !== null && val !== '', { message: 'Start Date is required' }),
  end_date: z.any().refine((val) => val !== null && val !== '', { message: 'End Date is required' }),
  estimated_hours: z.any().refine((val) => val !== null && val !== '', { message: 'Estimated Hours is required' }),
});

export function TaskCreate() {
  const navigate = useNavigate();
  const { create, loading } = useEntity('tasks');
  const { post: apiPost } = useApi();

  const [formData, setFormData] = useState({
    title: '',
    project_id: null as any,
    assignee_email: null as any,
    task_list_id: null as any,
    status_id: null as any,
    priority_id: null as any,
    start_date: new Date(),
    end_date: null as any,
    estimated_hours: '',
    actual_hours: '',
    description: '',
    billing_type: 'Billable',
  });
  const [owners, setOwners] = useState<any[]>([]);
  const [assignees, setAssignees] = useState<any[]>([]);
  const [newTaskListName, setNewTaskListName] = useState('');
  const [showTaskListInput, setShowTaskListInput] = useState(false);
  const [creatingTaskList, setCreatingTaskList] = useState(false);

  const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);
  const extractEmail = (val: any) => (val && typeof val === 'object' ? val.email : val);

  const handleCreateTaskList = async () => {
    if (!newTaskListName.trim() || !formData.project_id) return;
    setCreatingTaskList(true);
    try {
      const result = await apiPost('/tasklists/', {
        name: newTaskListName.trim(),
        project_id: extractId(formData.project_id),
      });
      set('task_list_id', result);
      setNewTaskListName('');
      setShowTaskListInput(false);
    } catch (err) {
      console.error('Failed to create task list:', err);
    } finally {
      setCreatingTaskList(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault();

    const valResult = taskSchema.safeParse(formData);
    if (!valResult.success) {
      alert('Validation Error: ' + valResult.error.issues[0].message);
      return;
    }

    try {
      const payload = {
        ...formData,
        project_id: extractId(formData.project_id),
        assignee_email: extractEmail(formData.assignee_email),
        task_list_id: extractId(formData.task_list_id),
        status_id: extractId(formData.status_id),
        priority_id: extractId(formData.priority_id),
        owner_ids: owners.map((o: any) => (typeof o === 'object' ? o.id : o)),
        assignee_ids: assignees.map((a: any) => (typeof a === 'object' ? a.id : a)),
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        actual_hours: formData.actual_hours ? parseFloat(formData.actual_hours) : null,
        start_date: formData.start_date?.toISOString().split('T')[0],
        end_date: formData.end_date
          ? formData.end_date instanceof Date
            ? formData.end_date.toISOString().split('T')[0]
            : formData.end_date
          : null,
        progress: 0,
      };
      await create(payload);
      navigate('/tasks');
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const set = (field: string, val: any) => setFormData(prev => ({ ...prev, [field]: val }));

  return (
    <PageLayout title="Create New Task" showBackButton backPath="/tasks">
      <form onSubmit={handleSave} className="max-w-[1200px] mx-auto">
        <FormHeader icon={ClipboardList} title="Task Details" subtitle="Fill in the details below to create a new task" color="blue" />

        <FormCard
          columns={3}
          footer={{ onCancel: () => navigate('/tasks'), submitLabel: 'Create Task', submittingLabel: 'Creating...', isSubmitting: loading, isDisabled: !formData.title.trim() }}
        >
          {/* ── Row 1: Title ── */}
          <FormField label="Task Title" required className="md:col-span-2 lg:col-span-3">
            <Input name="title" value={formData.title} onChange={handleChange} required placeholder="Enter task title" className="h-10" />
          </FormField>

          {/* ── Row 2: Project / Assignee / Task List ── */}
          <FormField label="Project">
            <ServerSearchDropdown entityType="projects" value={formData.project_id} onChange={v => { set('project_id', v); set('task_list_id', null); }} placeholder="Select Project" />
          </FormField>

          <FormField label="Assignees (Multi-Select)">
            <CoreSearchableMultiSelect
              entityType="users"
              value={assignees}
              onChange={setAssignees}
              placeholder="Select assignees..."
              field="email"
            />
          </FormField>

          <FormField label="Task List">
            {showTaskListInput ? (
              <div className="flex gap-2 w-full">
                <Input
                  value={newTaskListName}
                  onChange={e => setNewTaskListName(e.target.value)}
                  placeholder="New task list name..."
                  className="h-10 flex-1"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateTaskList(); } }}
                  autoFocus
                />
                <button type="button" onClick={handleCreateTaskList} disabled={creatingTaskList || !newTaskListName.trim()}
                  className="px-3 py-1.5 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50">
                  {creatingTaskList ? '...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowTaskListInput(false)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-2 w-full">
                <div className="flex-1">
                  <ServerSearchDropdown
                    entityType="tasklists"
                    value={formData.task_list_id}
                    onChange={v => set('task_list_id', v)}
                    placeholder="Select Task List"
                    disabled={!formData.project_id}
                    filters={formData.project_id ? { project_id: extractId(formData.project_id) } : {}}
                  />
                </div>
                <button
                  type="button"
                  disabled={!formData.project_id}
                  onClick={() => setShowTaskListInput(true)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-teal-500 text-teal-600 rounded text-xs hover:bg-teal-50 disabled:opacity-40"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>
            )}
          </FormField>

          {/* ── Row 3: Owners (multi), Status, Priority ── */}
          <FormField label="Owners (Multi-Select)" className="lg:col-span-1">
            <CoreSearchableMultiSelect
              entityType="users"
              value={owners}
              onChange={setOwners}
              placeholder="Select owners..."
              field="email"
            />
          </FormField>

          <FormField label="Status">
            <ServerSearchDropdown entityType="masters/statuses" value={formData.status_id} onChange={v => set('status_id', v)} placeholder="Select Status" />
          </FormField>

          <FormField label="Priority">
            <ServerSearchDropdown entityType="masters/priorities" value={formData.priority_id} onChange={v => set('priority_id', v)} placeholder="Select Priority" />
          </FormField>

          {/* ── Row 4: Hours, Dates, Billing ── */}
          <FormField label="Estimated Hours" required>
            <Input name="estimated_hours" type="number" value={formData.estimated_hours} onChange={handleChange} placeholder="e.g. 10" className="h-10" />
          </FormField>

          <FormField label="Actual Hours">
            <Input name="actual_hours" type="number" step="0.5" min="0" value={formData.actual_hours} onChange={handleChange} placeholder="e.g. 10.5" className="h-10" />
          </FormField>

          <FormField label="Billing Type">
            <select name="billing_type" value={formData.billing_type} onChange={handleChange}
              className="w-full h-10 rounded-lg border border-theme-border bg-theme-surface text-theme-primary text-[13px] px-3 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
            >
              {BILLING_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </FormField>

          <FormField label="Start Date" required>
            <SharedCalendar value={formData.start_date} onChange={v => set('start_date', v)} />
          </FormField>

          <FormField label="End Date" required>
            <SharedCalendar value={formData.end_date} onChange={v => set('end_date', v)} />
          </FormField>

          {/* ── Row 5: Description ── */}
          <FormField label="Description" className="md:col-span-2 lg:col-span-3">
            <Textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Detailed description of the task" />
          </FormField>
        </FormCard>
      </form>
    </PageLayout>
  );
}

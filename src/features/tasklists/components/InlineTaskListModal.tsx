import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Input } from '@/components/ui/Input/Input';
import { FormField } from '@/components/ui/Form';
import { useCreateTaskList } from '@/features/tasklists/hooks/useTaskLists';
import { useToast } from '@/providers/ToastContext';

interface InlineTaskListModalProps {
  visible: boolean;
  onHide: () => void;
  projectId: number | null;
  onCreated: (taskListId: number) => void;
}

export function InlineTaskListModal({ visible, onHide, projectId, onCreated }: InlineTaskListModalProps) {
  const [name, setName] = useState('');
  const createTaskList = useCreateTaskList();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Validation Error', 'Task List name is required');
      return;
    }
    if (!projectId) {
      showToast('error', 'Validation Error', 'Please select a Project first');
      return;
    }

    try {
      const response = await createTaskList.mutateAsync({ 
        name: name.trim(), 
        project_id: projectId 
      });
      showToast('success', 'Created', 'Task List created successfully');
      setName('');
      onCreated(response.id);
      onHide();
    } catch (error) {
      showToast('error', 'Error', 'Failed to create Task List');
    }
  };

  return (
    <Dialog 
      header="Create New Task List" 
      visible={visible} 
      onHide={onHide}
      className="w-full max-w-[400px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        {!projectId && (
          <div className="p-3 mb-2 rounded border border-orange-200 bg-orange-50 text-orange-800 text-[13px] font-medium">
            You must select a Project in the main form before creating a Task List!
          </div>
        )}
        <FormField label="Task List Name" required>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Phase 1 Deliverables" 
            autoFocus 
            disabled={!projectId}
          />
        </FormField>
        
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-theme-border">
          <Button type="button" text label="Cancel" onClick={onHide} />
          <Button 
            type="submit" 
            label="Save Task List" 
            className="btn-gradient" 
            loading={createTaskList.isPending} 
            disabled={!projectId || !name.trim()}
          />
        </div>
      </form>
    </Dialog>
  );
}

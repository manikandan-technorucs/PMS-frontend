import React from 'react';
import { RegistryDrivenView } from '@/shared/components/RegistryDrivenView/RegistryDrivenView';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button/Button';

/**
 * TasksListView — Modular "List View" driving the RegistryDrivenView for Tasks.
 */
export function TasksListView() {
  const navigate = useNavigate();
  
  const config = {
    entity: 'tasks',
    title: 'Tasks',
    columns: [
      { field: 'id', header: 'ID', sortable: true },
      { field: 'name', header: 'Task Name', sortable: true },
      { field: 'project.name', header: 'Project' },
      { field: 'priority.name', header: 'Priority' },
      { field: 'status.name', header: 'Status' },
    ]
  };

  return (
    <RegistryDrivenView 
      moduleConfig={config}
      onRowClick={(row) => navigate(`/tasks/${row.id}`)}
      actions={
        <Button 
          onClick={() => navigate('/tasks/create')}
          variant="primary"
          className="rounded-xl flex items-center gap-2"
        >
          <i className="pi pi-plus text-xs" />
          Create Task
        </Button>
      }
    />
  );
}

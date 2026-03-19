import React from 'react';
import { RegistryDrivenView } from '@/shared/components/RegistryDrivenView/RegistryDrivenView';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button/Button';

/**
 * ProjectsListView — Modular "List View" driving the RegistryDrivenView for Projects.
 */
export function ProjectsListView() {
  const navigate = useNavigate();
  
  const config = {
    entity: 'projects',
    title: 'Projects',
    columns: [
      { field: 'public_id', header: 'ID', sortable: true },
      { field: 'name', header: 'Name', sortable: true },
      { field: 'status.name', header: 'Status' },
      { field: 'created_at', header: 'Created At' },
    ]
  };

  return (
    <RegistryDrivenView 
      moduleConfig={config}
      onRowClick={(row) => navigate(`/projects/${row.id}`)}
      actions={
        <Button 
          onClick={() => navigate('/projects/create')}
          variant="primary"
          className="rounded-xl flex items-center gap-2"
        >
          <i className="pi pi-plus text-xs" />
          Create Project
        </Button>
      }
    />
  );
}

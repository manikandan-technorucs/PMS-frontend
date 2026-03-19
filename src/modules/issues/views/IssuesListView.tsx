import React from 'react';
import { RegistryDrivenView } from '@/shared/components/RegistryDrivenView/RegistryDrivenView';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button/Button';

/**
 * IssuesListView — Modular "List View" driving the RegistryDrivenView for Issues.
 */
export function IssuesListView() {
  const navigate = useNavigate();
  
  const config = {
    entity: 'issues',
    title: 'Issues',
    columns: [
      { field: 'public_id', header: 'ID', sortable: true },
      { field: 'title', header: 'Title', sortable: true },
      { field: 'priority.name', header: 'Priority' },
      { field: 'status.name', header: 'Status' },
      { field: 'created_at', header: 'Reported At' },
    ]
  };

  return (
    <RegistryDrivenView 
      moduleConfig={config}
      onRowClick={(row) => navigate(`/issues/${row.id}`)}
      actions={
        <Button 
          onClick={() => navigate('/issues/create')}
          className="bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center gap-2"
        >
          <i className="pi pi-exclamation-triangle text-xs" />
          Report Issue
        </Button>
      }
    />
  );
}

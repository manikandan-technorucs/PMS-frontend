import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { format } from 'date-fns';
import { api } from '@/api/axiosInstance';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';

interface AuditDetail {
  id: number;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
}

interface AuditLog {
  id: number;
  user_id: string;
  action_type: string;
  resource_name: string;
  resource_id: number;
  record_id: number;
  created_at: string;
  details: AuditDetail[];
}

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/audit', {
        params: {
          skip: lazyParams.first,
          limit: lazyParams.rows
        }
      });
      setLogs(response.data);
      // Backend doesn't return total yet, so we'll just use a large number or current count
      setTotalRecords(1000); 
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [lazyParams]);

  const onPage = (event: any) => {
    setLazyParams(event);
  };

  const actionTemplate = (rowData: AuditLog) => {
    const colorMap: any = {
      CREATE: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
      UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      ASSIGN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
    };
    return (
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${colorMap[rowData.action_type] || 'bg-slate-100 text-slate-700'}`}>
        {rowData.action_type}
      </span>
    );
  };

  const dateTemplate = (rowData: AuditLog) => {
    return format(new Date(rowData.created_at), 'MMM dd, yyyy HH:mm:ss');
  };

  const rowExpansionTemplate = (data: AuditLog) => {
    return (
      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
        <h5 className="text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">Changes for {data.resource_name} (ID: {data.record_id})</h5>
        <DataTable value={data.details} className="text-xs">
          <Column field="field_name" header="Field" className="font-medium"></Column>
          <Column field="old_value" header="Old Value" body={(d) => <span className="line-through opacity-60">{d.old_value || 'null'}</span>}></Column>
          <Column field="new_value" header="New Value" className="text-green-600 dark:text-green-400 font-medium"></Column>
        </DataTable>
      </div>
    );
  };

  return (
    <PageLayout title="System Audit Logs">
      <div className="space-y-6">
        <Card className="shadow-sm border-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
          <DataTable 
            value={logs} 
            lazy 
            paginator 
            first={lazyParams.first} 
            rows={lazyParams.rows} 
            totalRecords={totalRecords} 
            onPage={onPage}
            loading={loading}
            expandedRows={null}
            rowExpansionTemplate={rowExpansionTemplate}
            dataKey="id"
            className="text-sm"
            emptyMessage="No audit logs found."
            rowsPerPageOptions={[10, 25, 50]}
          >
            <Column expander style={{ width: '3em' }} />
            <Column field="created_at" header="Timestamp" body={dateTemplate} sortable style={{ minWidth: '12rem' }}></Column>
            <Column field="user_id" header="Actor OID" className="font-mono text-[11px]" style={{ minWidth: '10rem' }}></Column>
            <Column field="action_type" header="Action" body={actionTemplate} style={{ minWidth: '8rem' }}></Column>
            <Column field="resource_name" header="Resource" className="capitalize" style={{ minWidth: '8rem' }}></Column>
            <Column field="record_id" header="Record ID" style={{ minWidth: '6rem' }}></Column>
          </DataTable>
        </Card>
      </div>
    </PageLayout>
  );
};

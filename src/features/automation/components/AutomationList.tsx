import React from 'react';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { StatCard } from '@/shared/components/ui/Card/StatCard';
import { Button } from '@/shared/components/ui/Button/Button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Settings, Zap, Edit, Trash2, Plus, Terminal } from 'lucide-react';
import { useAutomationRules, useDeleteAutomationRule } from '../hooks/useAutomation';
import { AutomationRule } from '../types';

interface AutomationListProps {
    onCreate: () => void;
    onEdit: (rule: AutomationRule) => void;
    onViewLogs: (rule: AutomationRule) => void;
}

export function AutomationList({ onCreate, onEdit, onViewLogs }: AutomationListProps) {
    const { data: rules = [], isLoading } = useAutomationRules();
    const deleteMutation = useDeleteAutomationRule();

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this automation rule?')) {
            deleteMutation.mutate(id);
        }
    };

    const actionBodyTemplate = (rowData: AutomationRule) => {
        return (
            <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => onViewLogs(rowData)} title="View Logs">
                    <Terminal className="w-4 h-4 text-theme-primary" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onEdit(rowData)} title="Edit Rule">
                    <Edit className="w-4 h-4 text-theme-secondary" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(rowData.id)} title="Delete">
                    <Trash2 className="w-4 h-4 text-theme-danger" />
                </Button>
            </div>
        );
    };

    const templateBodyTemplate = (rowData: AutomationRule) => {
        return rowData.template ? rowData.template.name : <span className="text-theme-muted">None</span>;
    };

    const statusBodyTemplate = (rowData: AutomationRule) => {
        return (
            <span className={`px-2 py-1 text-xs rounded-full ${rowData.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {rowData.is_active ? 'Active' : 'Disabled'}
            </span>
        );
    };

    return (
        <PageLayout
            title="Automation Rules"
            actions={
                <Button onClick={onCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Rule
                </Button>
            }
        >
            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Rules" value={rules.length} icon={<Settings className="w-5 h-5" />} />
                    <StatCard label="Active Rules" value={rules.filter(r => r.is_active).length} icon={<Zap className="w-5 h-5 text-yellow-500" />} />
                </div>

                <Card>
                    {isLoading ? (
                        <div className="p-8 text-center text-theme-muted">Loading automation rules...</div>
                    ) : (
                        <div className="custom-datatable border rounded-lg overflow-hidden bg-theme-surface">
                            <DataTable
                                value={rules}
                                paginator
                                rows={10}
                                className="w-full"
                                emptyMessage="No automation rules found."
                                pt={{
                                    headerRow: { className: 'bg-theme-neutral border-b border-theme-border' },
                                    bodyRow: { className: 'border-b border-theme-border hover:bg-theme-neutral/50 transition-colors' },
                                    bodyCell: { className: 'p-4 text-sm text-theme-primary whitespace-nowrap' },
                                    headerCell: { className: 'p-4 text-left font-medium text-sm text-theme-secondary' }
                                }}
                            >
                                <Column field="trigger_event" header="Trigger Event" sortable />
                                <Column body={templateBodyTemplate} header="Linked Template" />
                                <Column body={statusBodyTemplate} header="Status" sortable />
                                <Column body={actionBodyTemplate} header="Actions" exportable={false} style={{ minWidth: '10rem' }} />
                            </DataTable>
                        </div>
                    )}
                </Card>
            </div>
        </PageLayout>
    );
}

import React from 'react';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { StatCard } from '@/shared/components/ui/Card/StatCard';
import { Button } from '@/shared/components/ui/Button/Button';
import { DataTable, Column } from '@/shared/components/lists/DataTable/DataTable';
import { Settings, Zap, Edit, Trash2, Plus, Terminal } from 'lucide-react';
import { useAutomationRules, useDeleteAutomationRule } from '../hooks/useAutomation';
import { AutomationRule } from '../types';
import { formatSnakeCase } from '@/shared/utils/stringHelpers';

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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ring-inset ${rowData.is_active ? 'bg-brand-teal-50 text-brand-teal-700 ring-1 ring-brand-teal-200/60' : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200/60'}`}>
                {rowData.is_active ? 'Active' : 'Disabled'}
            </span>
        );
    };

    const columns: Column<AutomationRule>[] = [
        { key: "trigger_event", header: "Trigger Event", sortable: true, render: (_, row) => <span className="font-medium text-theme-primary">{formatSnakeCase(row.trigger_event)}</span> },
        { key: "template", header: "Linked Template", render: (_, row) => templateBodyTemplate(row) },
        { key: "is_active", header: "Status", sortable: true, render: (_, row) => statusBodyTemplate(row) },
        { key: "actions", header: "Actions", render: (_, row) => actionBodyTemplate(row) }
    ];

    return (
        <PageLayout
            title="Automation Rules"
            actions={
                <Button onClick={onCreate} variant="gradient">
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
                        <div className="overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={rules}
                                itemsPerPage={10}
                                emptyMessage="No automation rules found."
                            />
                        </div>
                    )}
                </Card>
            </div>
        </PageLayout>
    );
}

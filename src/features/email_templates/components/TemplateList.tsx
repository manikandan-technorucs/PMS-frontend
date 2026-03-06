import React from 'react';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { StatCard } from '@/shared/components/ui/Card/StatCard';
import { Button } from '@/shared/components/ui/Button/Button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Mail, BarChart3, Edit, Trash2, Plus } from 'lucide-react';
import { useEmailTemplates, useDeleteEmailTemplate } from '../hooks/useEmailTemplates';
import { EmailTemplate } from '../types';

interface TemplateListProps {
    onCreate: () => void;
    onEdit: (template: EmailTemplate) => void;
}

export function TemplateList({ onCreate, onEdit }: TemplateListProps) {
    const { data: templates = [], isLoading } = useEmailTemplates();
    const deleteMutation = useDeleteEmailTemplate();

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this template?')) {
            deleteMutation.mutate(id);
        }
    };

    const actionBodyTemplate = (rowData: EmailTemplate) => {
        return (
            <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => onEdit(rowData)}>
                    <Edit className="w-4 h-4 text-theme-secondary" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(rowData.id)}>
                    <Trash2 className="w-4 h-4 text-theme-danger" />
                </Button>
            </div>
        );
    };

    const dateTemplate = (rowData: EmailTemplate) => {
        return <span>{new Date(rowData.created_at).toLocaleDateString()}</span>;
    };

    return (
        <PageLayout
            title="Email Templates"
            actions={
                <Button onClick={onCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                </Button>
            }
        >
            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Templates" value={templates.length} icon={<Mail className="w-5 h-5" />} />
                    <StatCard label="Total Usage" value={templates.reduce((sum, tpl) => sum + (tpl.usageCount || 0), 0)} icon={<BarChart3 className="w-5 h-5" />} />
                </div>

                <Card>
                    {isLoading ? (
                        <div className="p-8 text-center text-theme-muted">Loading templates...</div>
                    ) : (
                        <div className="custom-datatable border rounded-lg overflow-hidden bg-theme-surface">
                            <DataTable
                                value={templates}
                                paginator
                                rows={10}
                                className="w-full"
                                emptyMessage="No templates found."
                                pt={{
                                    headerRow: { className: 'bg-theme-neutral border-b border-theme-border' },
                                    bodyRow: { className: 'border-b border-theme-border hover:bg-theme-neutral/50 transition-colors' },
                                    bodyCell: { className: 'p-4 text-sm text-theme-primary whitespace-nowrap' },
                                    headerCell: { className: 'p-4 text-left font-medium text-sm text-theme-secondary' }
                                }}
                            >
                                <Column field="id" header="ID" sortable />
                                <Column field="name" header="Template Name" sortable />
                                <Column field="subject" header="Subject Line" />
                                <Column field="created_at" header="Created" body={dateTemplate} sortable />
                                <Column body={actionBodyTemplate} header="Actions" exportable={false} style={{ minWidth: '8rem' }} />
                            </DataTable>
                        </div>
                    )}
                </Card>
            </div>
        </PageLayout>
    );
}

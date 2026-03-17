import React from 'react';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { StatCard } from '@/shared/components/ui/Card/StatCard';
import { Button } from '@/shared/components/ui/Button/Button';
import { DataTable, Column } from '@/shared/components/lists/DataTable/DataTable';
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

    const columns: Column<EmailTemplate>[] = [
        { key: "id", header: "ID", sortable: true, render: (val) => <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-theme-secondary border border-slate-200 dark:border-slate-700">{val}</span> },
        { key: "name", header: "Template Name", sortable: true, render: (val) => <span className="font-medium text-theme-primary">{val}</span> },
        { key: "subject", header: "Subject Line" },
        { key: "created_at", header: "Created At", sortable: true, render: (_, row) => dateTemplate(row) },
        { key: "actions", header: "Actions", render: (_, row) => actionBodyTemplate(row) }
    ];

    return (
        <PageLayout
            title="Email Templates"
            actions={
                <Button onClick={onCreate} variant="gradient">
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
                        <div className="overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={templates}
                                itemsPerPage={10}
                                emptyMessage="No templates found."
                            />
                        </div>
                    )}
                </Card>
            </div>
        </PageLayout>
    );
}

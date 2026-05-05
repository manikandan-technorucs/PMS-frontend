import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Avatar } from 'primereact/avatar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tooltip } from 'primereact/tooltip';
import {
    LayoutTemplate, Plus, Trash2,
    Layers, Clock, Globe2, Lock, ChevronDown, ChevronRight,
} from 'lucide-react';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { useTemplates, useDeleteTemplate } from '../../hooks/useTemplates';
import type { ProjectTemplate } from '../../types/template.types';

const TEAL = 'hsl(160 60% 45%)';

function TemplateCard({ template, onDelete, expanded, onToggle }: {
    template: ProjectTemplate;
    onDelete: (t: ProjectTemplate) => void;
    expanded: boolean;
    onToggle: () => void;
}) {
    const navigate = useNavigate();

    const creatorName = template.created_by
        ? `${template.created_by.first_name ?? ''} ${template.created_by.last_name ?? ''}`.trim()
        : 'Unknown';

    const taskCount = template.tasks.length;
    const totalHours = template.tasks.reduce((s, t) => s + (t.estimated_hours ?? 0), 0);

    return (
        <div
            className="rounded-2xl overflow-hidden transition-shadow hover:shadow-lg"
            style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                boxShadow: 'var(--card-shadow)',
            }}
        >
            {}
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div className="flex items-start justify-between gap-3">
                    <button
                        type="button"
                        className="flex items-center gap-3 min-w-0 text-left hover:opacity-80 transition-opacity"
                        onClick={() => navigate(`/templates/${template.id}`)}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `${TEAL}18`, color: TEAL }}
                        >
                            <LayoutTemplate size={18} />
                        </div>
                        <div className="min-w-0">
                            <h3
                                className="font-bold text-sm truncate"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {template.name}
                            </h3>
                            {template.description && (
                                <p className="text-xs mt-0.5" style={{ 
                                    color: 'var(--text-muted)',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {template.description}
                                </p>
                            )}
                        </div>
                    </button>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Tooltip target=".tpl-public-ico" />
                        {template.is_public ? (
                            <Globe2
                                size={14}
                                className="tpl-public-ico"
                                data-pr-tooltip="Public template"
                                style={{ color: TEAL }}
                            />
                        ) : (
                            <Lock
                                size={14}
                                className="tpl-public-ico"
                                data-pr-tooltip="Private template"
                                style={{ color: 'var(--text-muted)' }}
                            />
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 size={13} />}
                            onClick={(e) => { e.stopPropagation(); onDelete(template); }}
                            className="text-red-400 hover:text-red-600 px-2"
                        />
                    </div>
                </div>
            </div>

            {}
            <div className="flex items-center gap-4 px-5 py-3">
                <StatChip icon={<Layers size={12} />} value={`${taskCount} task${taskCount !== 1 ? 's' : ''}`} color={TEAL} />
                {totalHours > 0 && (
                    <StatChip icon={<Clock size={12} />} value={`${totalHours}h total`} color="var(--text-secondary)" />
                )}
                {template.billing_type && (
                    <Tag value={template.billing_type} severity="info" rounded className="text-[10px]" />
                )}
                <div className="ml-auto flex items-center gap-1.5">
                    {template.created_by && (
                        <Avatar
                            label={`${template.created_by.first_name?.[0] ?? ''}${template.created_by.last_name?.[0] ?? ''}`.toUpperCase() || '?'}
                            size="normal"
                            shape="circle"
                            style={{
                                width: 24, height: 24, fontSize: 10, fontWeight: 700,
                                background: 'linear-gradient(135deg,#0CD1C3,#6366f1)', color: '#fff'
                            }}
                        />
                    )}
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{creatorName}</span>
                </div>
            </div>

            {}
            {taskCount > 0 && (
                <>
                    <button
                        type="button"
                        className="flex items-center gap-1.5 w-full px-5 py-2 text-xs font-semibold transition-colors"
                        style={{
                            color: 'var(--text-muted)',
                            borderTop: '1px solid var(--border-color)',
                            background: 'var(--bg-secondary)',
                        }}
                        onClick={onToggle}
                    >
                        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        {expanded ? 'Hide tasks' : 'Show tasks'}
                    </button>

                    {expanded && (
                        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                            {template.tasks.map((t, i) => (
                                <div key={t.id} className="flex items-center gap-3 px-5 py-2.5">
                                    <span
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                        style={{ background: `${TEAL}18`, color: TEAL }}
                                    >
                                        {i + 1}
                                    </span>
                                    <span className="text-sm flex-1 truncate"
                                          style={{ color: 'var(--text-primary)' }}>
                                        {t.title}
                                    </span>
                                    {t.estimated_hours != null && (
                                        <span className="text-[11px] flex-shrink-0"
                                              style={{ color: TEAL }}>
                                            {t.estimated_hours}h
                                        </span>
                                    )}
                                    {t.duration != null && (
                                        <span className="text-[11px] flex-shrink-0"
                                              style={{ color: 'var(--text-muted)' }}>
                                            {t.duration}d
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function StatChip({ icon, value, color }: { icon: React.ReactNode; value: string; color: string }) {
    return (
        <div className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color }}>
            {icon}
            {value}
        </div>
    );
}

export function TemplatesListView() {
    const navigate = useNavigate();
    const { data: templates = [], isLoading } = useTemplates();
    const deleteTemplate = useDeleteTemplate();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<ProjectTemplate | null>(null);

    const handleDelete = (t: ProjectTemplate) => setConfirmDelete(t);
    const confirmDeleteNow = async () => {
        if (confirmDelete) {
            await deleteTemplate.mutateAsync(confirmDelete.id);
            setConfirmDelete(null);
        }
    };

    return (
        <PageLayout
            title="Project Templates"
            subtitle="Reusable task sets for faster project setup"
            actions={
                <Button
                    variant="gradient"
                    size="sm"
                    icon={<Plus size={14} />}
                    onClick={() => navigate('/templates/create')}
                >
                    New Template
                </Button>
            }
        >
            <div className="px-4 py-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <ProgressSpinner style={{ width: 40, height: 40 }} />
                    </div>
                ) : templates.length === 0 ? (
                    <div className="flex flex-col items-center py-24 gap-4" style={{ color: 'var(--text-muted)' }}>
                        <LayoutTemplate size={48} strokeWidth={1} />
                        <div className="text-center">
                            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                No templates yet
                            </p>
                            <p className="text-sm mt-1">Create a template to speed up project creation</p>
                        </div>
                        <Button variant="gradient" icon={<Plus size={14} />}
                                onClick={() => navigate('/templates/create')}>
                            Create First Template
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
                        {templates.map(t => (
                            <TemplateCard 
                                key={t.id} 
                                template={t} 
                                onDelete={handleDelete}
                                expanded={expandedId === t.id}
                                onToggle={() => setExpandedId(prev => prev === t.id ? null : t.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {}
            <Dialog
                visible={!!confirmDelete}
                header="Delete Template"
                onHide={() => setConfirmDelete(null)}
                style={{ width: '380px' }}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                        <Button
                            variant="danger"
                            loading={deleteTemplate.isPending}
                            onClick={confirmDeleteNow}
                        >
                            Delete
                        </Button>
                    </div>
                }
            >
                <div className="flex items-start gap-3 py-2">
                    <Trash2 size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Delete "{confirmDelete?.name}"?
                        </p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            This will permanently remove the template and its {confirmDelete?.tasks.length ?? 0} task(s).
                            Projects already created from this template will not be affected.
                        </p>
                    </div>
                </div>
            </Dialog>
        </PageLayout>
    );
}

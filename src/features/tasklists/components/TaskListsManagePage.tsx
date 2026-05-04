import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { EmptyState } from '@/components/data-display/EmptyState';
import { tasklistsService, TaskList } from '@/api/services/tasklists.service';
import { useToast } from '@/providers/ToastContext';
import { Plus, Layers, Trash2, FolderKanban, Search } from 'lucide-react';

export function TaskListsManagePage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');

    const { data: taskLists = [], isLoading } = useQuery<TaskList[]>({
        queryKey: ['tasklists'],
        queryFn: () => tasklistsService.getTaskLists(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => tasklistsService.deleteTaskList(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasklists'] });
            showToast('success', 'Deleted', 'Task list removed.');
        },
        onError: () => showToast('error', 'Error', 'Failed to delete task list.'),
    });

    const filtered = taskLists.filter(tl =>
        tl.name.toLowerCase().includes(search.toLowerCase()) ||
        (tl.project as any)?.project_name?.toLowerCase().includes(search.toLowerCase())
    );

    const grouped = filtered.reduce<Record<string, TaskList[]>>((acc, tl) => {
        const key = (tl.project as any)?.project_name || 'No Project';
        if (!acc[key]) acc[key] = [];
        acc[key].push(tl);
        return acc;
    }, {});

    return (
        <PageLayout
            title="Task Lists"
            actions={
                <Button variant="primary" onClick={() => navigate('/tasklists/create')} className="!h-9 !px-4 !rounded-lg">
                    <Plus size={15} /> Add Task List
                </Button>
            }
        >
            <div className="max-w-[1100px] mx-auto px-4 pb-16">

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search task lists or projects…"
                        className="w-full pl-10 pr-4 py-2.5 text-[13px] rounded-xl border focus:outline-none focus:ring-2"
                        style={{
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-color)',
                        }}
                    />
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)' }} />
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={<Layers />}
                        title="No task lists found"
                        description={search ? "Try a different search term." : "Create a task list to organise tasks within your projects."}
                        action={
                            !search && (
                                <Button variant="primary" onClick={() => navigate('/tasklists/create')} className="!h-10 !px-5 !rounded-lg">
                                    <Plus size={15} /> Add Task List
                                </Button>
                            )
                        }
                    />
                ) : (
                    <div className="space-y-8">
                        {Object.entries(grouped).map(([projectName, lists]) => (
                            <div key={projectName}>

                                <div className="flex items-center gap-2 mb-3">
                                    <FolderKanban size={14} style={{ color: 'var(--primary)' }} />
                                    <span className="text-[13px] font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
                                        {projectName}
                                    </span>
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                        style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                                        {lists.length}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {lists.map(tl => (
                                        <div
                                            key={tl.id}
                                            className="rounded-xl p-4 flex flex-col gap-2 transition-all hover:shadow-md cursor-default"
                                            style={{
                                                background: 'var(--card-bg)',
                                                border: '1px solid var(--border-color)',
                                                boxShadow: 'var(--card-shadow)',
                                            }}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                        style={{ background: 'var(--primary-subtle)' }}>
                                                        <Layers size={13} style={{ color: 'var(--primary)' }} />
                                                    </div>
                                                    <span className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                                        {tl.name}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => deleteMutation.mutate(tl.id)}
                                                    className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
                                                    title="Delete task list"
                                                    style={{ color: '#ef4444' }}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                            {tl.description && (
                                                <p className="text-[12px] line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                                                    {tl.description}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between pt-1 mt-auto">
                                                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>ID: {tl.id}</span>
                                                <button
                                                    onClick={() => deleteMutation.mutate(tl.id)}
                                                    className="text-[11px] font-medium px-2 py-0.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    style={{ color: '#ef4444' }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PageLayout>
    );
}

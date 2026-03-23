import React from 'react';
import { Project } from '../services/projects.api';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { Card } from '@/components/ui/Card/Card';
import { Calendar, User, Clock, Layout, Target } from 'lucide-react';

interface ProjectCardProps {
    project: Project;
    onClick?: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
    const progress = project.estimated_hours && project.estimated_hours > 0
        ? Math.min(Math.round(((project.actual_hours || 0) / project.estimated_hours) * 100), 100)
        : 0;

    const accentColor = project.status?.name?.toLowerCase() === 'completed'
        ? 'bg-emerald-500'
        : project.priority?.name?.toLowerCase() === 'high'
            ? 'bg-rose-500'
            : 'bg-brand-teal-500';

    return (
        <Card
            onClick={onClick}
            id={project.public_id || `PRJ-${project.id}`}
            title={project.name}
            subtitle={project.client || 'Internal Project'}
            accentColor={accentColor}
            className="h-full cursor-pointer"
            actions={<StatusBadge status={project.priority?.name || 'Medium'} variant="priority" />}
        >
            <div className="flex flex-col h-full">
                <p className="text-[13px] text-slate-600 dark:text-slate-400 line-clamp-2 mb-6 flex-1">
                    {project.description || 'No description provided for this project.'}
                </p>

                <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                            <span className="text-slate-400 dark:text-slate-500">Resource Utilization</span>
                            <span className={progress > 90 ? 'text-rose-500' : 'text-brand-teal-600 dark:text-brand-teal-400'}>{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/50">
                            <div
                                className={`h-full rounded-full transition-all duration-700 shadow-sm ${progress > 90 ? 'bg-rose-500 shadow-rose-500/20' : 'bg-brand-teal-500 shadow-brand-teal-500/20'}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="flex items-center gap-2.5 text-[12px] text-slate-500 dark:text-slate-400">
                            <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                <User className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate font-medium">
                                {project.manager ? `${project.manager.first_name[0]}. ${project.manager.last_name}` : 'Unassigned'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[12px] text-slate-500 dark:text-slate-400">
                            <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                <Calendar className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-medium">{project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex -space-x-2">
                        {(project.users || []).slice(0, 4).map((u, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 shadow-sm" title={`${u.first_name} ${u.last_name}`}>
                                {u.first_name[0]}{u.last_name[0]}
                            </div>
                        ))}
                        {(project.users?.length || 0) > 4 && (
                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm">
                                +{(project.users?.length || 0) - 4}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={project.status?.name || 'Planning'} variant="status" />
                    </div>
                </div>
            </div>
        </Card>
    );
}

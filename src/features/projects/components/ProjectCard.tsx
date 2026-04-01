import React from 'react';
import { Project } from '../services/projects.api';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { Calendar, User, FolderKanban } from 'lucide-react';

interface ProjectCardProps {
    project: Project;
    onClick?: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
    const progress = project.estimated_hours && project.estimated_hours > 0
        ? Math.min(Math.round(((project.actual_hours || 0) / project.estimated_hours) * 100), 100)
        : 0;

    return (
        <div
            onClick={onClick}
            className="group card-base flex flex-col h-full p-6 hover:shadow-xl hover:border-brand-teal-500/50 transition-all duration-500 cursor-pointer overflow-hidden relative"
        >
            {}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-teal-500/5 rounded-full blur-2xl group-hover:bg-brand-teal-500/10 transition-all duration-500" />

            {}
            <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-teal-50 to-brand-teal-100/50 dark:from-brand-teal-900/40 dark:to-brand-teal-800/20 flex items-center justify-center text-brand-teal-600 dark:text-brand-teal-400 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-brand-teal-500/20 transition-all duration-300 border border-brand-teal-200/50 dark:border-brand-teal-700/30">
                        <FolderKanban className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] uppercase font-bold text-brand-teal-600 bg-brand-teal-50 dark:bg-brand-teal-900/30 dark:text-brand-teal-400 px-2 py-0.5 rounded-md tracking-wider flex-shrink-0">
                                {project.public_id || `PRJ-${project.id}`}
                            </span>
                        </div>
                        <h4 className="text-[17px] font-extrabold text-theme-primary truncate group-hover:text-brand-teal-600 dark:group-hover:text-brand-teal-400 transition-colors leading-tight">
                            {project.name}
                        </h4>
                        <p className="text-[13px] text-theme-secondary font-medium mt-1 truncate">
                            {project.client || 'Internal Project'}
                        </p>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <StatusBadge status={project.status?.name || 'Planning'} variant="status" />
                </div>
            </div>

            {}
            <div className="relative z-10 flex-1">
                <p className="text-[13.5px] text-theme-muted leading-relaxed line-clamp-2 mb-6 h-10">
                    {project.description || 'No description provided for this project. Add details to help your team understand the goal.'}
                </p>
            </div>

            {}
            <div className="space-y-5 relative z-10 mt-auto">
                {}
                <div className="bg-theme-neutral/50 dark:bg-slate-800/50 rounded-xl p-3 border border-theme-border/30">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider mb-2">
                        <span className="text-theme-muted">Time Utilization</span>
                        <span className={progress > 90 ? 'text-rose-500' : 'text-brand-teal-600 dark:text-brand-teal-400'}>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${progress > 90 ? 'bg-gradient-to-r from-rose-400 to-rose-500' : 'bg-gradient-to-r from-brand-teal-400 to-brand-teal-500'}`}
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                        </div>
                    </div>
                </div>

                {}
                <div className="flex justify-between items-center pt-2">
                    <div className="flex -space-x-2.5">
                        {(project.users || []).slice(0, 4).map((u, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-teal-100 to-brand-teal-50 dark:from-brand-teal-900/80 dark:to-brand-teal-800/50 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold text-brand-teal-700 dark:text-brand-teal-300 shadow-sm relative z-10 hover:z-20 hover:scale-110 transition-transform" title={`${u.first_name} ${u.last_name}`}>
                                {u.first_name[0]}{u.last_name[0]}
                            </div>
                        ))}
                        {(project.users?.length || 0) > 4 && (
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[11px] font-bold text-slate-600 dark:text-slate-300 shadow-sm relative z-10">
                                +{(project.users?.length || 0) - 4}
                            </div>
                        )}
                        {(!project.users || project.users.length === 0) && (
                            <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-[12px] font-bold text-slate-400 shadow-sm relative z-10">
                                <User className="w-3.5 h-3.5" />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-[12px] font-medium text-theme-secondary bg-theme-neutral/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-theme-border/30">
                        <Calendar className="w-3.5 h-3.5 text-brand-teal-500" />
                        <span>{project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

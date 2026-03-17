import React from 'react';
import { Project } from '../services/projects.api';
import { StatusBadge } from '@/shared/components/ui/Badge/StatusBadge';
import { Calendar, User, Clock, MoreVertical, Layout, Target } from 'lucide-react';

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
            className="card-base rounded-[8px] p-5 hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full border-t-[3px]"
            style={{ borderTopColor: project.status?.name?.toLowerCase() === 'completed' ? '#059669' : '#14b8a6' }}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 mr-2">
                    <h3 className="text-[16px] font-bold text-[#1F2937] truncate group-hover:text-[#059669] transition-colors">
                        {project.name}
                    </h3>
                    <p className="text-[12px] text-[#6B7280] truncate mt-0.5">{project.client || 'No Client'}</p>
                </div>
                <StatusBadge status={project.priority?.name || 'Medium'} variant="priority" />
            </div>

            <p className="text-[13px] text-[#4B5563] line-clamp-2 mb-6 flex-1">
                {project.description || 'No description provided for this project.'}
            </p>

            <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium">
                        <span className="text-[#6B7280]">Budget Utilization</span>
                        <span className={progress > 90 ? 'text-red-500' : 'text-[#059669]'}>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${progress > 90 ? 'bg-red-500' : 'bg-[#059669]'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-y-3 pt-2">
                    <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                        <User className="w-3.5 h-3.5" />
                        <span className="truncate">
                            {project.manager ? `${project.manager.first_name[0]}. ${project.manager.last_name}` : 'Unassigned'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{project.actual_hours?.toFixed(1) || '0.0'}h logged</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                        <Target className="w-3.5 h-3.5" />
                        <StatusBadge status={project.status?.name || 'Planning'} variant="status" />
                    </div>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#F3F4F6] flex justify-between items-center">
                <div className="flex -space-x-2">
                    {(project.users || []).slice(0, 3).map((u, i) => (
                        <div key={i} className="w-7 h-7 rounded-full bg-[#ECFDF5] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#059669]" title={`${u.first_name} ${u.last_name}`}>
                            {u.first_name[0]}{u.last_name[0]}
                        </div>
                    ))}
                    {(project.users?.length || 0) > 3 && (
                        <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-400">
                            +{(project.users?.length || 0) - 3}
                        </div>
                    )}
                </div>
                <button className="text-[12px] font-semibold text-[#059669] hover:underline flex items-center gap-1">
                    Details <Layout className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}

import React from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate, useLocation } from 'react-router-dom';
import { Project } from '@/features/projects/types/project.types';
import { useStatuses } from '@/features/masters/hooks/useMasters';
import { useProjectActions } from '@/features/projects/hooks/useProjectActions';
import { Card } from '@/components/layout/Card';
import { Badge } from '@/components/data-display/Badge';
import { FolderKanban, Users, Clock, MoreHorizontal, Layout, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ITEM_TYPE = 'PROJECT_CARD';

interface ProjectKanbanBoardProps {
    projects: Project[];
}

interface ProjectCardProps {
    project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [{ isDragging }, dragRef] = useDrag({
        type: ITEM_TYPE,
        item: { id: project.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const statusLabel = project.status_master?.label || project.status_master?.name || (typeof project.status === 'string' ? project.status : (project.status?.label || project.status?.name || 'Active'));

    return (
        <motion.div
            ref={dragRef as any}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4 }}
            className="group cursor-grab active:cursor-grabbing mb-4"
            onClick={() => navigate(`/projects/${project.id}`, { state: { from: location.pathname + location.search } })}
        >
            <Card 
                glass={true} 
                className="p-4 border-slate-200/60 dark:border-slate-800/60 hover:border-brand-teal-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all bg-white/70 dark:bg-slate-900/70"
            >
                <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="font-mono text-[9px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wider truncate max-w-[120px]">
                        {project.public_id}
                    </span>
                    <Badge value={statusLabel} variant="status" />
                </div>

                <h4 className="font-bold text-[13.5px] text-slate-800 dark:text-slate-100 leading-snug group-hover:text-brand-teal-600 transition-colors line-clamp-2 mb-2">
                    {project.project_name}
                </h4>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 line-clamp-1 flex items-center gap-1.5">
                    <Target size={12} className="opacity-70" />
                    {project.client_name || 'Internal Project'}
                </p>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 pt-3 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    <div className="flex items-center gap-2">
                        {project.project_manager ? (
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <div className="w-5 h-5 rounded-full bg-brand-teal-100 dark:bg-brand-teal-900/30 flex items-center justify-center text-[8px] font-black text-brand-teal-600">
                                    {(project.project_manager.first_name?.[0] || 'P')}{(project.project_manager.last_name?.[0] || 'M')}
                                </div>
                                <span className="max-w-[80px] truncate">{project.project_manager.first_name}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-slate-300 italic">
                                <Users size={12} />
                                <span>No PM</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                        <Clock size={12} className="opacity-70" />
                        <span>{project.expected_end_date ? new Date(project.expected_end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '--'}</span>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

interface KanbanColumnProps {
    status: { id: number; label: string };
    projects: Project[];
    onDrop: (projectId: number, statusId: number) => void;
}

function KanbanColumn({ status, projects, onDrop }: KanbanColumnProps) {
    const [{ isOver }, dropRef] = useDrop({
        accept: ITEM_TYPE,
        drop: (item: { id: number }) => onDrop(item.id, status.id),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <div 
            ref={dropRef as any}
            className={`flex-shrink-0 w-80 flex flex-col rounded-3xl p-3 transition-colors duration-200 ${
                isOver ? 'bg-brand-teal-50/50 dark:bg-brand-teal-900/10' : 'bg-transparent'
            }`}
        >
            <div className="flex items-center justify-between mb-5 px-2">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-brand-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                    <h3 className="font-black text-slate-800 dark:text-slate-200 text-[12px] uppercase tracking-[0.2em] truncate max-w-[180px]">
                        {status.label}
                    </h3>
                    <span className="bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-full tabular-nums">
                        {projects.length}
                    </span>
                </div>
                <button className="text-slate-300 hover:text-slate-500 transition-colors">
                    <MoreHorizontal size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-10 min-h-[200px]">
                <AnimatePresence initial={false}>
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </AnimatePresence>
                {projects.length === 0 && !isOver && (
                    <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-800/60 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 p-6 text-center">
                        <FolderKanban size={24} className="mb-2 opacity-20" />
                        <span className="text-[11px] font-bold uppercase tracking-widest leading-tight">No Projects</span>
                    </div>
                )}
                {isOver && (
                    <div className="h-32 border-2 border-dashed border-brand-teal-300 dark:border-brand-teal-700 rounded-[2rem] bg-brand-teal-50/30 dark:bg-brand-teal-900/10" />
                )}
            </div>
        </div>
    );
}

export function ProjectKanbanBoard({ projects }: ProjectKanbanBoardProps) {
    const { data: statusesData = [] } = useStatuses();
    const { updateProject } = useProjectActions();

    // Filter only relevant project statuses
    const relevantStatusNames = ['Planning', 'In Progress', 'Completed', 'On Hold', 'Closed', 'Cancelled'];
    const statuses = statusesData
        .filter(s => relevantStatusNames.includes(s.label || s.name || ''))
        .map(s => ({ id: s.id, label: s.label || s.name || 'Unknown' }));

    const handleDrop = (projectId: number, statusId: number) => {
        const project = projects.find((p) => p.id === projectId);
        if (project && project.status_id !== statusId) {
            updateProject.mutate({ id: projectId, data: { status_id: statusId } as any });
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex gap-4 overflow-x-auto p-4 min-h-full h-full pb-8 no-scrollbar bg-slate-50/50 dark:bg-slate-900/30">
                {statuses.length > 0 ? (
                    statuses.map((s) => (
                        <KanbanColumn
                            key={s.id}
                            status={s}
                            projects={projects.filter((p) => p.status_id === s.id)}
                            onDrop={handleDrop}
                        />
                    ))
                ) : (
                    <div className="w-full flex items-center justify-center h-64 text-slate-400">
                        <Layout size={40} className="mb-3 opacity-20" />
                        <p>No statuses available for Kanban view.</p>
                    </div>
                )}
            </div>
        </DndProvider>
    );
}

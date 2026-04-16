import React from 'react';
import { Task } from '../services/tasks.api';
import { Card } from '@/components/ui/Card/Card';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { Clock, User, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TaskCardProps {
    task: Task;
    className?: string;
    isDragging?: boolean;
    dragRef?: React.Ref<HTMLDivElement>;
}

export function TaskCard({ task, className = '', isDragging, dragRef }: TaskCardProps) {
    const navigate = useNavigate();

    const accentColor = task.status?.name?.toLowerCase() === 'completed'
        ? 'bg-emerald-500'
        : task.priority?.name?.toLowerCase() === 'high'
            ? 'bg-rose-500'
            : 'bg-brand-teal-500';

    return (
        <Card
            onClick={() => navigate(`/tasks/${task.id}`)}
            id={task.public_id || `TSK-${task.id}`}
            title={task.title}
            accentColor={accentColor}
            className={`${className} ${isDragging ? 'opacity-50 grayscale' : 'opacity-100'} transition-all`}
            actions={<StatusBadge status={task.priority?.name || 'Medium'} variant="priority" />}
        >
            <div ref={dragRef as any} className="space-y-4">
                <div className="flex items-center justify-between text-[12px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                            {task.assignee ? `${task.assignee.first_name[0]}${task.assignee.last_name[0]}` : '??'}
                        </div>
                        <span className="font-medium truncate max-w-[100px]">
                            {task.assignee ? `${task.assignee.first_name} ${task.assignee.last_name}` : 'Unassigned'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-medium">{task.end_date || 'No Deadline'}</span>
                    </div>
                </div>

                {task.description && (
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                        {task.description}
                    </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800/50">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{task.estimated_hours || 0}h estimated</span>
                    </div>
                    <StatusBadge status={task.status?.name || 'Pending'} variant="status" />
                </div>
            </div>
        </Card>
    );
}

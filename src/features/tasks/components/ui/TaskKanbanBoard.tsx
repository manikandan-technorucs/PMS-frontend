import React from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate, useLocation } from 'react-router-dom';
import { Task } from '@/api/services/tasks.service';
import { useStatuses } from '@/features/masters/hooks/useMasters';
import { useUpdateTask } from '@/features/tasks/hooks/useTasks';
import { Card } from '@/components/layout/Card';
import { Badge } from '@/components/data-display/Badge';
import { Clock, User, Hash, MoreHorizontal, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ITEM_TYPE = 'TASK_CARD';

interface KanbanViewProps {
    tasks: Task[];
}

interface KanbanCardProps {
    task: Task;
}

function KanbanCard({ task }: KanbanCardProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [{ isDragging }, dragRef] = useDrag({
        type: ITEM_TYPE,
        item: { id: task.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <motion.div
            ref={dragRef as any}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4 }}
            className="group cursor-grab active:cursor-grabbing mb-4"
            onClick={() => navigate(`/tasks/${task.id}`, { state: { from: location.pathname + location.search } })}
        >
            <Card 
                glass={true} 
                className="p-4 border-slate-200/60 dark:border-slate-800/60 hover:border-brand-teal-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all bg-white/70 dark:bg-slate-900/70"
            >
                <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="font-mono text-[9px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {task.public_id || `TS-${task.id}`}
                    </span>
                    <Badge value={task.priority?.name || 'Normal'} variant="priority" />
                </div>

                <h4 className="font-bold text-[13.5px] text-slate-800 dark:text-slate-100 leading-snug group-hover:text-brand-teal-600 transition-colors line-clamp-2 mb-4">
                    {task.title}
                </h4>

                {}
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div 
                        className="h-full bg-brand-teal-500 rounded-full transition-all duration-500" 
                        style={{ width: `${task.progress || 0}%` }}
                    />
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 pt-3 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    <div className="flex items-center gap-2">
                        {task.assignee ? (
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <div className="w-5 h-5 rounded-full bg-brand-teal-100 dark:bg-brand-teal-900/30 flex items-center justify-center text-[8px] font-black text-brand-teal-600">
                                    {task.assignee.first_name?.[0]}{task.assignee.last_name?.[0]}
                                </div>
                                <span>{task.assignee.first_name}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-slate-300 italic">
                                <User size={12} />
                                <span>Void</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                        <Clock size={12} className="opacity-70" />
                        <span>{task.due_date ? task.due_date : '--'}</span>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

interface KanbanColumnProps {
    status: { id: number; name: string };
    tasks: Task[];
    onDrop: (taskId: number, statusId: number) => void;
}

function KanbanColumn({ status, tasks, onDrop }: KanbanColumnProps) {
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
                    <h3 className="font-black text-slate-800 dark:text-slate-200 text-[12px] uppercase tracking-[0.2em]">
                        {status.name}
                    </h3>
                    <span className="bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-full tabular-nums">
                        {tasks.length}
                    </span>
                </div>
                <button className="text-slate-300 hover:text-slate-500 transition-colors">
                    <MoreHorizontal size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                <AnimatePresence initial={false}>
                    {tasks.map((task) => (
                        <KanbanCard key={task.id} task={task} />
                    ))}
                </AnimatePresence>
                {tasks.length === 0 && !isOver && (
                    <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-800/60 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 p-6 text-center">
                        <Layers size={24} className="mb-2 opacity-20" />
                        <span className="text-[11px] font-bold uppercase tracking-widest leading-tight">Empty Stack</span>
                    </div>
                )}
                {isOver && (
                    <div className="h-32 border-2 border-dashed border-brand-teal-300 dark:border-brand-teal-700 rounded-[2rem] bg-brand-teal-50/30 dark:bg-brand-teal-900/10" />
                )}
            </div>
        </div>
    );
}

export function TaskKanbanBoard({ tasks }: KanbanViewProps) {
    const { data: statuses = [] } = useStatuses();
    const { mutate: updateTask } = useUpdateTask();

    const handleDrop = (taskId: number, statusId: number) => {
        const task = tasks.find((t) => t.id === taskId);
        if (task && task.status_id !== statusId) {
            updateTask({ id: taskId, data: { status_id: statusId } });
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex gap-4 overflow-x-auto p-4 min-h-full h-full pb-8 no-scrollbar bg-slate-50/50 dark:bg-slate-900/30">
                {statuses.map((s) => (
                    <KanbanColumn
                        key={s.id}
                        status={s}
                        tasks={tasks.filter((t) => t.status_id === s.id)}
                        onDrop={handleDrop}
                    />
                ))}
            </div>
        </DndProvider>
    );
}

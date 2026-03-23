import React from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import { Task } from '../services/tasks.api';
import { useStatuses } from '@/hooks/useMasterData';
import { useUpdateTask } from '../hooks/useTasks';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { Clock, User } from 'lucide-react';
import { TaskCard } from './TaskCard';

const ITEM_TYPE = 'TASK_CARD';

interface KanbanViewProps {
    tasks: Task[];
}

interface KanbanCardProps {
    task: Task;
}

function KanbanCard({ task }: KanbanCardProps) {
    const [{ isDragging }, dragRef] = useDrag({
        type: ITEM_TYPE,
        item: { id: task.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <TaskCard
            task={task}
            isDragging={isDragging}
            dragRef={dragRef as any}
            className="mb-3"
        />
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
            className={`flex-shrink-0 w-80 flex flex-col rounded-xl bg-[#F9FAFB] border border-gray-100 p-4 min-h-[500px] transition-colors ${isOver ? 'bg-[#f0fdfa] ring-2 ring-[#14b8a6] ring-inset' : ''
                }`}
        >
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#374151] text-[15px] uppercase tracking-wider">{status.name}</h3>
                    <span className="bg-gray-200 text-gray-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {tasks.map((task) => (
                    <KanbanCard key={task.id} task={task} />
                ))}
                {tasks.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm italic">
                        No tasks here
                    </div>
                )}
            </div>
        </div>
    );
}

export function KanbanView({ tasks }: KanbanViewProps) {
    const { data: statuses = [] } = useStatuses();
    const { mutate: updateTask } = useUpdateTask();

    const handleDrop = (taskId: number, statusId: number) => {
        // Only update if status actually changed
        const task = tasks.find((t) => t.id === taskId);
        if (task && task.status_id !== statusId) {
            updateTask({ id: taskId, data: { status_id: statusId } });
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex gap-6 overflow-x-auto p-2 min-h-full h-full">
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

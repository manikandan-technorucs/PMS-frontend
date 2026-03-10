import React from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Clock, Calendar, User, Hash } from 'lucide-react';
import { TimeLog as ITimeLog } from '../services/timelogs.api';

const ITEM_TYPE = 'TIMELOG_CARD';

interface TimeLogsKanbanViewProps {
    timelogs: ITimeLog[];
    onUpdate: () => void;
}

interface KanbanCardProps {
    entry: ITimeLog;
}

function KanbanCard({ entry }: KanbanCardProps) {
    const [{ isDragging }, dragRef] = useDrag({
        type: ITEM_TYPE,
        item: { id: entry.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={dragRef as any}
            className={`bg-white p-4 rounded-lg border shadow-sm mb-3 cursor-pointer hover:border-[#059669] transition-all ${isDragging ? 'opacity-50 grayscale' : 'opacity-100'
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1.5 text-[#6B7280]">
                    <Hash className="w-3.5 h-3.5" />
                    <span className="text-[12px] font-mono">TL-{entry.id}</span>
                </div>
                <span className="bg-[#ECFDF5] text-[#059669] text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {entry.hours.toFixed(1)}h
                </span>
            </div>
            <h4 className="text-[14px] font-semibold text-[#1F2937] mb-2 line-clamp-2">
                {entry.task?.title || entry.issue?.title || entry.description || 'Time Entry'}
            </h4>
            <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-50 mt-2">
                <div className="flex items-center gap-2 text-[#6B7280]">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-[12px] truncate">{entry.user ? `${entry.user.first_name} ${entry.user.last_name}` : 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#6B7280]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[12px]">{entry.date.split('T')[0]}</span>
                </div>
            </div>
        </div>
    );
}

interface KanbanColumnProps {
    status: string;
    entries: ITimeLog[];
}

function KanbanColumn({ status, entries }: KanbanColumnProps) {
    return (
        <div
            className="flex-shrink-0 w-80 flex flex-col rounded-xl bg-[#F9FAFB] border border-gray-100 p-4 min-h-[500px]"
        >
            <div className="flex items-center gap-2 mb-4 px-1">
                <h3 className="font-bold text-[#374151] text-[15px] uppercase tracking-wider">{status}</h3>
                <span className="bg-gray-200 text-gray-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {entries.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {entries.map((entry) => (
                    <KanbanCard key={entry.id} entry={entry} />
                ))}
                {entries.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm italic">
                        No logs here
                    </div>
                )}
            </div>
        </div>
    );
}

export function TimeLogsKanbanView({ timelogs, onUpdate }: TimeLogsKanbanViewProps) {
    // For timelogs, columns could be by project or by billing status.
    // Given the previous summary mentioned billing status, let's use that if available,
    // otherwise group by billing type (Billable/Non-Billable).
    const billingTypes = ['Billable', 'Non-Billable'];

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex gap-6 overflow-x-auto p-2 min-h-full h-full">
                {billingTypes.map((type) => (
                    <KanbanColumn
                        key={type}
                        status={type}
                        // For now we assume all are billable as per TimeLog.tsx logic
                        entries={type === 'Billable' ? timelogs : []}
                    />
                ))}
            </div>
        </DndProvider>
    );
}

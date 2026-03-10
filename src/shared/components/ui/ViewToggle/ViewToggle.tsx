import React from 'react';
import { List, LayoutGrid } from 'lucide-react';
import { Button } from '../Button/Button';

export type ViewType = 'list' | 'kanban';

interface ViewToggleProps {
    view: ViewType;
    onViewChange: (view: ViewType) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div className="flex items-center p-1 bg-[#F3F4F6] rounded-lg border border-[#E5E7EB]">
            <button
                type="button"
                onClick={() => onViewChange('list')}
                className={`flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium transition-all rounded-md ${view === 'list'
                        ? 'bg-white text-theme-primary shadow-sm ring-1 ring-[#E5E7EB]'
                        : 'text-[#6B7280] hover:text-[#374151] hover:bg-white/50'
                    }`}
            >
                <List className={`w-4 h-4 ${view === 'list' ? 'text-theme-primary' : 'text-[#6B7280]'}`} />
                List
            </button>
            <button
                type="button"
                onClick={() => onViewChange('kanban')}
                className={`flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium transition-all rounded-md ${view === 'kanban'
                        ? 'bg-white text-theme-primary shadow-sm ring-1 ring-[#E5E7EB]'
                        : 'text-[#6B7280] hover:text-[#374151] hover:bg-white/50'
                    }`}
            >
                <LayoutGrid className={`w-4 h-4 ${view === 'kanban' ? 'text-theme-primary' : 'text-[#6B7280]'}`} />
                Kanban
            </button>
        </div>
    );
}

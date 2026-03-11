import React from 'react';
import { List, LayoutGrid } from 'lucide-react';
import { Button } from '../Button/Button';

export type ViewType = 'list' | 'kanban' | 'grid';

interface ViewToggleProps {
    view: ViewType;
    onViewChange: (view: ViewType) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div className="flex items-center p-1 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
            <button
                type="button"
                onClick={() => onViewChange('list')}
                className={`flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium transition-all rounded-md ${view === 'list'
                    ? 'bg-white dark:bg-slate-700 text-theme-primary shadow-sm ring-1 ring-inset'
                    : 'text-theme-secondary hover:text-theme-primary'
                    }`}
            >
                <List className={`w-4 h-4 ${view === 'list' ? 'text-theme-primary' : 'text-theme-secondary'}`} />
                List
            </button>
            <button
                type="button"
                onClick={() => onViewChange('kanban')}
                className={`flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium transition-all rounded-md ${view !== 'list'
                    ? 'bg-white dark:bg-slate-700 text-theme-primary shadow-sm ring-1 ring-inset'
                    : 'text-theme-secondary hover:text-theme-primary'
                    }`}
            >
                <LayoutGrid className={`w-4 h-4 ${view !== 'list' ? 'text-theme-primary' : 'text-theme-secondary'}`} />
                Kanban
            </button>
        </div>
    );
}

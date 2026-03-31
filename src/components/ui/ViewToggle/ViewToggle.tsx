import { Button } from 'primereact/button';

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div className="flex items-center p-1 rounded-lg border border-theme-border bg-theme-neutralShadow">
            <Button unstyled 
                type="button"
                onClick={() => onViewChange('list')}
                className={`flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium transition-all rounded-md ${view === 'list'
                    ? 'bg-theme-surface text-theme-primary shadow-sm ring-1 ring-inset ring-theme-border'
                    : 'text-theme-secondary hover:text-theme-primary'
                    }`}
            >
                <List className={`w-4 h-4 ${view === 'list' ? 'text-theme-primary' : 'text-theme-secondary'}`} />
                List
            </Button>
            <Button unstyled 
                type="button"
                onClick={() => onViewChange('kanban')}
                className={`flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium transition-all rounded-md ${view !== 'list'
                    ? 'bg-theme-surface text-theme-primary shadow-sm ring-1 ring-inset ring-theme-border'
                    : 'text-theme-secondary hover:text-theme-primary'
                    }`}
            >
                <LayoutGrid className={`w-4 h-4 ${view !== 'list' ? 'text-theme-primary' : 'text-theme-secondary'}`} />
                Kanban
            </Button>
        </div>
    );
}

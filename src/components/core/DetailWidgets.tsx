import React from 'react';
import { Avatar } from 'primereact/avatar';

const TEAL = 'hsl(160 60% 45%)';

export function PropRow({ icon, label, children, color = TEAL }: { icon: React.ReactNode; label: string; children: React.ReactNode; color?: string }) {
    const renderChildren = () => {
        if (children === null || children === undefined) return '—';
        if (typeof children === 'object' && !React.isValidElement(children)) {

            const obj = children as any;
            return obj.label ?? obj.name ?? obj.project_name ?? obj.value?.toString() ?? '—';
        }
        return children;
    };

    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
                 style={{ background: `${color}12`, color: color }}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5 text-slate-500">
                    {label}
                </p>
                <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                    {renderChildren()}
                </div>
            </div>
        </div>
    );
}

export function StatusBadge({ status, defaultColor = TEAL }: { status?: any; defaultColor?: string }) {
    const label = typeof status === 'string' ? status : status?.label ?? '—';
    const color = typeof status === 'object' ? status?.color ?? defaultColor : defaultColor;
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{ background: `${color}22`, color: color, border: `1px solid ${color}33` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            {label}
        </span>
    );
}

export function PriorityBadge({ priority }: { priority?: any }) {
    const label = typeof priority === 'string' ? priority : priority?.label ?? priority?.name ?? 'None';
    const color = typeof priority === 'object' ? priority?.color : undefined;
    const PRIORITY_COLORS: Record<string, string> = {
        critical: '#991b1b', high: '#9a3412', medium: '#854d0e', low: '#166534', none: '#6b7280',
    };
    const clr = color ?? PRIORITY_COLORS[label.toLowerCase()] ?? '#6b7280';
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
              style={{ background: `${clr}18`, color: clr }}>
            {label}
        </span>
    );
}

export function SeverityBadge({ severity }: { severity?: any }) {
    const label = typeof severity === 'string' ? severity : severity?.name ?? 'Normal';
    const key = label.toLowerCase();
    const clr = key === 'critical' ? '#ef4444' : key === 'high' ? '#f97316' : '#64748b';
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
              style={{ background: `${clr}18`, color: clr }}>
            {label}
        </span>
    );
}

export function PersonAvatar({ person }: { person?: any }) {
    if (!person) return <span className="text-slate-400">Unassigned</span>;
    

    if (typeof person === 'string') {
        return <span className="truncate min-w-0 font-medium" title={person}>{person}</span>;
    }

    const firstName = person.first_name || '';
    const lastName = person.last_name || '';
    const fallbackName = person.label || person.name || person.username || 'User';
    
    let name = `${firstName} ${lastName}`.trim();
    if (!name) name = fallbackName;

    const initials = name 
        ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : '?';

    return (
        <div className="flex items-center gap-2 max-w-full">
            <Avatar label={initials || '?'} shape="circle" size="normal"
                style={{ width: 24, height: 24, fontSize: 9, fontWeight: 700, flexShrink: 0,
                    background: 'linear-gradient(135deg,#0CD1C3,#6366f1)', color: '#fff' }} />
            <span className="truncate min-w-0 font-medium" title={name}>{name}</span>
        </div>
    );
}

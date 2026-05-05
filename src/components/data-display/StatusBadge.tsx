import React from 'react';
import { THEME_COLORS } from '@/constants/constants';

interface StatusBadgeProps {
    status?: any;
    defaultColor?: string;
}

export function StatusBadge({ status, defaultColor = THEME_COLORS.TEAL }: StatusBadgeProps) {
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

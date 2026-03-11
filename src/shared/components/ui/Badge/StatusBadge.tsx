import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'status' | 'priority' | 'phase';
}

export function StatusBadge({ status, variant = 'status' }: StatusBadgeProps) {
  const getStyles = () => {
    const normalized = status.toLowerCase();

    if (variant === 'status') {
      switch (normalized) {
        case 'active':
        case 'in progress':
        case 'open':
          return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/60';
        case 'completed':
        case 'done':
        case 'resolved':
          return 'bg-lime-50 text-lime-700 ring-1 ring-lime-200/60';
        case 'pending':
        case 'on hold':
        case 'on leave':
          return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60';
        case 'blocked':
        case 'cancelled':
        case 'closed':
        case 'inactive':
          return 'bg-red-50 text-red-700 ring-1 ring-red-200/60';
        case 'planning':
          return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/60';
        default:
          return 'bg-slate-50 text-slate-600 ring-1 ring-slate-200/60';
      }
    }

    // Priority variants
    if (variant === 'priority') {
      switch (normalized) {
        case 'critical':
        case 'high':
          return 'bg-red-50 text-red-700 ring-1 ring-red-200/60';
        case 'medium':
          return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60';
        case 'low':
          return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/60';
        default:
          return 'bg-slate-50 text-slate-600 ring-1 ring-slate-200/60';
      }
    }

    if (variant === 'phase') {
      switch (normalized) {
        case 'planning':
          return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/60';
        case 'design':
          return 'bg-pink-50 text-pink-700 ring-1 ring-pink-200/60';
        case 'development':
          return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/60';
        case 'testing':
          return 'bg-orange-50 text-orange-700 ring-1 ring-orange-200/60';
        case 'deployment':
          return 'bg-lime-50 text-lime-700 ring-1 ring-lime-200/60';
        default:
          return 'bg-slate-50 text-slate-600 ring-1 ring-slate-200/60';
      }
    }

    return 'bg-slate-50 text-slate-600 ring-1 ring-slate-200/60';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ring-inset ${getStyles()}`}>
      {status}
    </span>
  );
}

import React from 'react';
import { Tag } from 'primereact/tag';

interface StatusBadgeProps {
  status: string;
  variant?: 'status' | 'priority' | 'phase';
}

export function StatusBadge({ status, variant = 'status' }: StatusBadgeProps) {
  const getSeverity = () => {
    const normalized = status.toLowerCase();

    if (variant === 'status') {
      switch (normalized) {
        case 'active':
        case 'in progress':
        case 'open':
          return 'info';
        case 'completed':
        case 'done':
        case 'resolved':
          return 'success';
        case 'pending':
        case 'on hold':
        case 'on leave':
          return 'warning';
        case 'blocked':
        case 'cancelled':
        case 'closed':
        case 'inactive':
          return 'danger';
        case 'planning':
          return 'info'; // Fallback for purple, using info
        default:
          return 'secondary';
      }
    }

    if (variant === 'priority') {
      switch (normalized) {
        case 'critical':
        case 'high':
          return 'danger';
        case 'medium':
          return 'warning';
        case 'low':
          return 'info';
        default:
          return 'secondary';
      }
    }

    if (variant === 'phase') {
      switch (normalized) {
        case 'deployment':
        case 'testing':
          return 'success';
        case 'development':
          return 'info';
        default:
          return 'secondary';
      }
    }

    return 'secondary';
  };

  return (
    <Tag 
      severity={getSeverity() as any} 
      value={status} 
      className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5" 
      pt={{
        root: { style: { borderRadius: '9999px', letterSpacing: '0.025em' } }
      }}
    />
  );
}

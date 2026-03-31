import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'status' | 'priority' | 'phase';
}

export function StatusBadge({ status, variant = 'status' }: StatusBadgeProps) {
  const getStyles = () => {
    const normalized = status.toLowerCase();

    // Status variants — Soft UI: light bg + dark text + subtle ring
    if (variant === 'status') {
      switch (normalized) {
        case 'active':
        case 'in progress':
        case 'open':
          return 'bg-blue-100 text-blue-700 ring-1 ring-blue-200/50';
        case 'completed':
        case 'done':
        case 'resolved':
          return 'bg-green-100 text-green-700 ring-1 ring-green-200/50';
        case 'pending':
        case 'on hold':
        case 'on leave':
          return 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200/50';
        case 'blocked':
        case 'cancelled':
        case 'closed':
        case 'inactive':
          return 'bg-red-100 text-red-700 ring-1 ring-red-200/50';
        case 'planning':
          return 'bg-purple-100 text-purple-700 ring-1 ring-purple-200/50';
        default:
          return 'bg-gray-100 text-gray-700 ring-1 ring-gray-200/50';
      }
    }

    // Priority variants
    if (variant === 'priority') {
      switch (normalized) {
        case 'critical':
        case 'high':
          return 'bg-red-100 text-red-700 ring-1 ring-red-200/50';
        case 'medium':
          return 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200/50';
        case 'low':
          return 'bg-blue-100 text-blue-700 ring-1 ring-blue-200/50';
        default:
          return 'bg-gray-100 text-gray-700 ring-1 ring-gray-200/50';
      }
    }

    // Phase variants
    if (variant === 'phase') {
      switch (normalized) {
        case 'planning':
          return 'bg-purple-100 text-purple-700 ring-1 ring-purple-200/50';
        case 'design':
          return 'bg-pink-100 text-pink-700 ring-1 ring-pink-200/50';
        case 'development':
          return 'bg-blue-100 text-blue-700 ring-1 ring-blue-200/50';
        case 'testing':
          return 'bg-orange-100 text-orange-700 ring-1 ring-orange-200/50';
        case 'deployment':
          return 'bg-green-100 text-green-700 ring-1 ring-green-200/50';
        default:
          return 'bg-gray-100 text-gray-700 ring-1 ring-gray-200/50';
      }
    }

    return 'bg-gray-100 text-gray-700 ring-1 ring-gray-200/50';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ring-inset ${getStyles()}`}>
      {status}
    </span>
  );
}

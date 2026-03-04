import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'status' | 'priority' | 'phase';
}

export function StatusBadge({ status, variant = 'status' }: StatusBadgeProps) {
  const getStyles = () => {
    const normalized = status.toLowerCase();

    // Status variants
    if (variant === 'status') {
      switch (normalized) {
        case 'active':
        case 'in progress':
        case 'open':
          return 'bg-blue-100 text-blue-700';
        case 'completed':
        case 'done':
        case 'resolved':
          return 'bg-green-100 text-green-700';
        case 'pending':
        case 'on hold':
        case 'on leave':
          return 'bg-yellow-100 text-yellow-700';
        case 'blocked':
        case 'cancelled':
        case 'closed':
        case 'inactive':
          return 'bg-red-100 text-red-700';
        default:
          return 'bg-gray-100 text-gray-700';
      }
    }

    // Priority variants
    if (variant === 'priority') {
      switch (normalized) {
        case 'critical':
        case 'high':
          return 'bg-red-100 text-red-700';
        case 'medium':
          return 'bg-yellow-100 text-yellow-700';
        case 'low':
          return 'bg-blue-100 text-blue-700';
        default:
          return 'bg-gray-100 text-gray-700';
      }
    }

    // Phase variants
    if (variant === 'phase') {
      switch (normalized) {
        case 'planning':
          return 'bg-purple-100 text-purple-700';
        case 'design':
          return 'bg-pink-100 text-pink-700';
        case 'development':
          return 'bg-blue-100 text-blue-700';
        case 'testing':
          return 'bg-orange-100 text-orange-700';
        case 'deployment':
          return 'bg-green-100 text-green-700';
        default:
          return 'bg-gray-100 text-gray-700';
      }
    }

    return 'bg-gray-100 text-gray-700';
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-[6px] text-[12px] font-medium ${getStyles()}`}>
      {status}
    </span>
  );
}

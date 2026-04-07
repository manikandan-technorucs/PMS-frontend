import React, { useMemo } from 'react';
import { useStatuses } from '@/features/masters/hooks/useMasters';

interface FilteredStatusSelectProps {
  module: 'tasks' | 'issues';
  value: any; // the whole status object
  onChange: (val: any) => void;
  className?: string;
  currentOriginalStatusName?: string; // used for issue logic
}

export const FilteredStatusSelect: React.FC<FilteredStatusSelectProps> = ({
  module,
  value,
  onChange,
  className,
  currentOriginalStatusName
}) => {
  const { data: statuses = [], isLoading } = useStatuses();

  const options = useMemo(() => {
    let allowed: string[] = [];
    
    if (module === 'tasks') {
      allowed = ['Open', 'In Progress', 'In Review', 'To Be Tested', 'Completed', 'On Hold', 'Closed'];
    } else if (module === 'issues') {
      const isCreate = !currentOriginalStatusName;
      const original = currentOriginalStatusName || '';

      if (isCreate) {
        allowed = ['Open', 'In Progress', 'In Review', 'To Be Tested', 'Closed'];
      } else {
        if (original.toLowerCase() === 'closed') {
          allowed = ['Closed', 'Re-Opened'];
        } else if (original.toLowerCase() === 're-opened') {
          allowed = ['Re-Opened', 'Open', 'In Progress', 'In Review', 'To Be Tested', 'Closed'];
        } else {
          allowed = ['Open', 'In Progress', 'In Review', 'To Be Tested', 'Closed'];
        }
      }
    }

    if (value && value.name && !allowed.some(a => a.toLowerCase() === value.name.toLowerCase())) {
        allowed.push(value.name);
    }

    return statuses.filter(s => allowed.some(a => a.toLowerCase() === s.name.toLowerCase()));
  }, [statuses, module, currentOriginalStatusName, value]);

  return (
    <select
      value={value?.id || ''}
      onChange={(e) => {
        const id = Number(e.target.value);
        const st = statuses.find(s => s.id === id);
        onChange(st || null);
      }}
      className={`w-full h-10 rounded-lg border border-theme-border bg-theme-surface text-theme-primary text-[13px] px-3 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 ${className || ''}`}
      disabled={isLoading}
    >
      <option value="" disabled>Select Status</option>
      {options.map(o => (
        <option key={o.id} value={o.id}>{o.name}</option>
      ))}
    </select>
  );
};

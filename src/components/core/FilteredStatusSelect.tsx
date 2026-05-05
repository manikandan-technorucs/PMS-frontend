import React, { useMemo } from 'react';
import { useStatuses } from '@/features/masters/hooks/useMasters';
import { Dropdown } from 'primereact/dropdown';

interface FilteredStatusSelectProps {
  module: 'tasks' | 'issues';
  value: any;
  onChange: (val: any) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  currentOriginalStatusName?: string;
}

export const FilteredStatusSelect: React.FC<FilteredStatusSelectProps> = ({
  module,
  value,
  onChange,
  className = '',
  placeholder = 'Select Status',
  disabled,
}) => {
  const { data: statuses = [], isLoading } = useStatuses();

  const options = useMemo(() => statuses, [statuses]);


  const currentId: number | null = useMemo(() => {
    if (!value) return null;
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && value?.id != null) return Number(value.id);
    if (typeof value === 'string' && !isNaN(Number(value))) return Number(value);

    const byName = options.find(o => o.name === value);
    return byName ? byName.id : null;
  }, [value, options]);

  return (
    <div className={`form-field-shell ${className}`}>
      <Dropdown
        value={currentId}
        options={options}
        optionLabel="name"
        optionValue="id"
        onChange={(e) => {
          const found = options.find(o => o.id === e.value) || null;
          onChange(found);
        }}
        itemTemplate={(option) => (
          <div className="flex items-center gap-2.5">
            {option.icon && (
              <i className={`${option.icon} text-[14px] flex-shrink-0 w-5 flex items-center justify-center opacity-80`} style={{ color: option.color || 'inherit' }} />
            )}
            {!option.icon && option.color && (
              <div className="w-2 h-2 rounded-full" style={{ background: option.color }} />
            )}
            <span>{option.name || option.label}</span>
          </div>
        )}
        valueTemplate={(option, props) => {
          if (!option) return <span>{props.placeholder}</span>;
          const fullOption = options.find(o => o.id === (typeof option === 'object' ? option.id : option));
          const opt = fullOption || option;
          return (
            <div className="flex items-center gap-2.5">
              {opt.icon && (
                <i className={`${opt.icon} text-[14px] flex-shrink-0 opacity-80`} style={{ color: opt.color || 'inherit' }} />
              )}
              {!opt.icon && opt.color && (
                <div className="w-2 h-2 rounded-full" style={{ background: opt.color }} />
              )}
              <span className="truncate">{opt.name || opt.label}</span>
            </div>
          );
        }}
        placeholder={isLoading ? 'Loading...' : placeholder}
        disabled={disabled || isLoading}
        className="w-full h-full"
        style={{ border: 'none', boxShadow: 'none', background: 'transparent', height: '44px' }}
        pt={{
          root: { style: { border: 'none', boxShadow: 'none', background: 'transparent', width: '100%', height: '44px' } },
          input: {
            className: 'text-[13px] font-medium text-slate-800 dark:text-white',
            style: { border: 'none', boxShadow: 'none', background: 'transparent', padding: '0 0 0 16px', display: 'flex', alignItems: 'center', height: '44px' }
          },
          trigger: { className: 'text-slate-400 dark:text-slate-500', style: { border: 'none', background: 'transparent', width: '40px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
          panel: { className: 'rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden', style: { marginTop: '4px' } },
          list: { className: 'p-1.5 flex flex-col gap-0.5' },
          item: { className: 'rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors' },
          emptyMessage: { className: 'px-3 py-4 text-[12px] text-slate-400 text-center' },
        }}
      />
    </div>
  );
};

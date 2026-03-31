import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primereact/autocomplete';
import { useEntity } from '@/hooks/useEntity';
import debounce from 'lodash.debounce';

interface ServerDropdownProps {
  entityType: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  field?: string;
  dropdown?: boolean;
  filters?: Record<string, any>;
  itemTemplate?: (item: any) => React.ReactNode;
  [key: string]: any;
}

const ServerDropdown: React.FC<ServerDropdownProps> = ({
  entityType,
  value,
  onChange,
  placeholder = 'Search...',
  field = 'name',
  dropdown = true,
  filters = {},
  itemTemplate,
  ...props
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { search, getAll } = useEntity(entityType);
  const prevFiltersRef = useRef(filters);

  const fetchInitial = useCallback(async () => {
    try {
      const data = await getAll({ limit: 5, ...filters });
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`Failed to fetch initial ${entityType}`, err);
    }
  }, [entityType, JSON.stringify(filters)]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  useEffect(() => {
    if (JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters)) {
      setSuggestions([]);
      prevFiltersRef.current = filters;
    }
  }, [filters]);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length >= 1) {
        try {
          const results = await search(query, filters);
          setSuggestions(Array.isArray(results) ? results : []);
        } catch (err) {
          console.error(`Search failed for ${entityType}`, err);
        }
      } else {
        fetchInitial();
      }
    }, 300),
    [entityType, search, fetchInitial, JSON.stringify(filters)]
  );

  const completeMethod = (event: AutoCompleteCompleteEvent) => {
    debouncedSearch(event.query);
  };

  return (
    <div className="flex flex-col gap-1">
      <AutoComplete
        {...props}
        value={value}
        suggestions={suggestions}
        completeMethod={completeMethod}
        onChange={(e) => onChange(e.value)}
        placeholder={placeholder}
        field={field}
        dropdown={dropdown}
        itemTemplate={itemTemplate}
        className="w-full"
        inputClassName="w-full text-[13px] px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400"
        panelClassName="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl mt-1 overflow-hidden"
      />
    </div>
  );
};

export default ServerDropdown;

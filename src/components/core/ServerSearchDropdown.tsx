import React, { useState, useCallback, useRef } from 'react';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primereact/autocomplete';
import { api } from '@/api/client';
import debounce from 'lodash.debounce';

interface ServerSearchDropdownProps {
  entityType: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  field?: string;
  dropdown?: boolean;
  filters?: Record<string, any>;
  itemTemplate?: (item: any) => React.ReactNode;
  disabled?: boolean;
  customSearchPath?: string | null;
  allowedValues?: string[];
  [key: string]: any;
}

const ServerSearchDropdown: React.FC<ServerSearchDropdownProps> = ({
  entityType,
  value,
  onChange,
  placeholder = 'Search...',
  field = 'name',
  dropdown = true,
  filters = {},
  itemTemplate,
  disabled = false,
  customSearchPath = null,
  endpoint = null,
  allowedValues,
  project_id,
  ...props
}) => {
  const isWorkItem = ['tasks', 'issues', 'workitems'].some(t => entityType.toLowerCase().includes(t));
  const defaultField = isWorkItem ? 'title' : 'name';
  const finalField = props.field || field || defaultField;

  const actualSearchPath = endpoint || customSearchPath;
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryText, setQueryText] = useState(() =>
    value && typeof value === 'object' ? (value[finalField] ?? '') : ''
  );

  const combinedFilters = React.useMemo(() => {
    const f = { ...filters };
    if (project_id) f.project_id = project_id;
    return f;
  }, [JSON.stringify(filters), project_id]);
  const didFetch = useRef(false);

  React.useEffect(() => {
    if (value && typeof value === 'object') {
      setQueryText(value[finalField] ?? '');
    } else if (!value) {
      setQueryText('');
    }
  }, [value, finalField]);

  React.useEffect(() => {
    
    
    didFetch.current = false;
    setSuggestions([]);
  }, [project_id]);

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    try {
      const basePath = actualSearchPath ? actualSearchPath : (entityType.includes('/') ? `/${entityType}` : `/${entityType}/`);
      const response = await api.get(basePath, { params: { limit: 50, ...combinedFilters } });
      const data = response.data;
      let items = Array.isArray(data) ? data : (data?.items ?? []);
      if (allowedValues && allowedValues.length > 0) {
        items = items.filter(item => allowedValues.includes(item[finalField]));
      }
      setSuggestions(items);
      didFetch.current = true;
    } catch (err) {
      console.error(`Failed to fetch initial ${entityType}`, err);
    } finally {
      setLoading(false);
    }
  }, [entityType, JSON.stringify(combinedFilters), allowedValues, field, actualSearchPath]);

  const debouncedSearch = useCallback(
    debounce(async (query: string, currentFilters: Record<string, any>, path: string | null) => {
      setLoading(true);
      try {
        const searchUrl = path || actualSearchPath || `/${entityType}/search`;
        const searchParams = { q: query, ...currentFilters };
        const response = await api.get(searchUrl, { params: searchParams });
        const result = response.data;
        let items = Array.isArray(result) ? result : (result?.items ?? []);
        if (allowedValues && allowedValues.length > 0) {
          items = items.filter(item => allowedValues.includes(item[finalField]));
        }
        setSuggestions(items);
      } catch (err) {
        console.error(`Search failed for ${entityType}`, err);
      } finally {
        setLoading(false);
      }
    }, 300),
    [entityType, actualSearchPath, finalField]
  );

  const defaultItemTemplate = (item: any) => {
    if (item && (item.type === 'task' || item.type === 'issue')) {
      const isIssue = item.type === 'issue';
      return (
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded ${isIssue ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400' : 'bg-brand-teal-100 dark:bg-brand-teal-900/40 text-brand-teal-600 dark:text-brand-teal-400'}`}>
            {item.type}
          </span>
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
            {item.title || item[finalField]}
          </span>
        </div>
      );
    }
    return <span className="text-[13px] font-medium">{item ? item[finalField] : ''}</span>;
  };

  const onSearch = (event: AutoCompleteCompleteEvent) => {
    if (event.query.trim().length === 0) {
      fetchInitial();
    } else {
      debouncedSearch(event.query, combinedFilters, customSearchPath);
    }
  };

  const onSelect = (event: AutoCompleteSelectEvent) => {
    const selected = event.value;
    setQueryText(selected?.[finalField] ?? '');
    onChange(selected);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQueryText(text);
    if (!text) {
      onChange(null);
    }
  };

  return (
    <div className="relative w-full group">
      <AutoComplete
        {...props}
        value={queryText}
        suggestions={suggestions}
        completeMethod={onSearch}
        onFocus={() => {
          if (!didFetch.current) fetchInitial();
          else if (!suggestions.length) fetchInitial();
        }}
        onDropdownClick={() => { fetchInitial(); }}
        onSelect={onSelect}
        onChange={(e) => {
          if (typeof e.value === 'string') {
            onInputChange({ target: { value: e.value } } as any);
          }
        }}
        onClear={() => {
          setQueryText('');
          onChange(null);
          setSuggestions([]);
          didFetch.current = false;
        }}
        placeholder={placeholder}
        itemTemplate={itemTemplate || defaultItemTemplate}
        className="w-full"
        inputClassName="w-full text-[13px] font-medium px-4 py-2.5 transition-all"
        panelClassName="custom-auto-overlay overflow-hidden shadow-2xl rounded-xl mt-1.5 border border-theme-border bg-theme-surface backdrop-blur-md"
        emptyMessage={loading ? 'Loading...' : 'No results found'}
        forceSelection={false}
        pt={{
          list: { className: 'p-1.5 flex flex-col gap-1' },
          item: { className: 'rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer overflow-hidden transition-all' }
        }}
      />
    </div>
  );
};

export default ServerSearchDropdown;

import React, { useState, useCallback, useRef } from 'react';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primereact/autocomplete';
import { useApi } from '@/hooks/useApi';
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
  ...props
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryText, setQueryText] = useState(() =>
    value && typeof value === 'object' ? (value[field] ?? '') : ''
  );
  const { get } = useApi();
  const didFetch = useRef(false);

  React.useEffect(() => {
    if (value && typeof value === 'object') {
      setQueryText(value[field] ?? '');
    } else if (!value) {
      setQueryText('');
    }
  }, [value, field]);

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    try {
      const basePath = entityType.includes('/') ? `/${entityType}` : `/${entityType}/`;
      const data = await get(basePath, { limit: 50, ...filters });
      const items = Array.isArray(data) ? data : (data?.items ?? []);
      setSuggestions(items);
      didFetch.current = true;
    } catch (err) {
      console.error(`Failed to fetch initial ${entityType}`, err);
    } finally {
      setLoading(false);
    }
  }, [entityType, JSON.stringify(filters)]);

  const debouncedSearch = useCallback(
    debounce(async (query: string, currentFilters: Record<string, any>, path: string | null) => {
      setLoading(true);
      try {
        const searchPath = path ?? `/${entityType}/search`;
        const results = await get(searchPath, { q: query, ...currentFilters });
        const items = Array.isArray(results) ? results : (results?.items ?? []);
        setSuggestions(items);
      } catch (err) {
        console.error(`Search failed for ${entityType}`, err);
      } finally {
        setLoading(false);
      }
    }, 300),
    [entityType, get]
  );

  const onSearch = (event: AutoCompleteCompleteEvent) => {
    if (event.query.trim().length === 0) {
      fetchInitial();
    } else {
      debouncedSearch(event.query, filters, customSearchPath);
    }
  };

  const onSelect = (event: AutoCompleteSelectEvent) => {
    const selected = event.value;
    setQueryText(selected?.[field] ?? '');
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
        field={field}
        dropdown={dropdown}
        disabled={disabled}
        itemTemplate={itemTemplate}
        className="w-full"
        inputClassName="w-full text-[13px] font-medium px-4 py-2.5 transition-all"
        panelClassName="custom-auto-overlay overflow-hidden shadow-2xl rounded-xl mt-1.5 border border-theme-border bg-theme-surface backdrop-blur-md"
        emptyMessage={loading ? 'Loading...' : 'No results found'}
        forceSelection={false}
      />
    </div>
  );
};

export default ServerSearchDropdown;

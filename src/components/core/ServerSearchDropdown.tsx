import React, { useState, useCallback } from 'react';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primereact/autocomplete';
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
  const [queryText, setQueryText] = useState(value?.[field] || '');
  const { get } = useApi();

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    try {
      // Auto-append trailing slash to base entities (e.g., 'projects' -> 'projects/')
      // to avoid 307 Temporary Redirects from FastAPI behind reverse proxies.
      const basePath = entityType.includes('/') ? `/${entityType}` : `/${entityType}/`;
      const data = await get(basePath, { limit: 5, ...filters });
      setSuggestions(Array.isArray(data) ? data : []);
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
        const results = await get(path || `/${entityType}/search`, { q: query, ...currentFilters });
        setSuggestions(Array.isArray(results) ? results : []);
      } catch (err) {
        console.error(`Search failed for ${entityType}`, err);
      } finally {
        setLoading(false);
      }
    }, 300),
    [entityType, get]
  );

  React.useEffect(() => {
    setSuggestions([]);
  }, [JSON.stringify(filters)]);

  React.useEffect(() => {
    if (value && typeof value === 'object') {
      setQueryText(value[field] || '');
    } else if (!value) {
      setQueryText('');
    }
  }, [value, field]);

  const onSearch = (event: AutoCompleteCompleteEvent) => {
    if (event.query.trim().length === 0) {
      fetchInitial();
    } else {
      debouncedSearch(event.query, filters, customSearchPath);
    }
  };

  return (
    <div className="relative w-full group">
      <AutoComplete
        {...props}
        value={queryText}
        suggestions={suggestions}
        completeMethod={onSearch}
        onFocus={() => { if (!suggestions.length) fetchInitial(); }}
        onChange={(e) => {
          setQueryText(e.value);
          if (typeof e.value === 'object' && e.value !== null) {
            onChange(e.value);
          }
        }}
        placeholder={placeholder}
        field={field}
        dropdown={dropdown}
        disabled={disabled}
        itemTemplate={itemTemplate}
        className="w-full"
        inputClassName="w-full text-[13px] font-medium px-4 py-2.5 transition-all"
        panelClassName="custom-auto-overlay overflow-hidden shadow-2xl rounded-xl mt-1.5 border border-theme-border bg-theme-surface backdrop-blur-md"
      />
    </div>
  );
};

export default ServerSearchDropdown;

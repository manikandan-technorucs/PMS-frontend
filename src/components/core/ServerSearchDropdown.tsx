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
  // Track what the input text shows — either the selected value's label or raw typing
  const [queryText, setQueryText] = useState(() =>
    value && typeof value === 'object' ? (value[field] ?? '') : ''
  );
  const { get } = useApi();
  const didFetch = useRef(false);

  // Sync display text when value changes externally (e.g., edit-form pre-population)
  React.useEffect(() => {
    if (value && typeof value === 'object') {
      setQueryText(value[field] ?? '');
    } else if (!value) {
      setQueryText('');
    }
  }, [value, field]);

  // ── Fetch all items (shown on focus / dropdown click / empty query) ───
  const fetchInitial = useCallback(async () => {
    setLoading(true);
    try {
      // master sub-paths like 'masters/statuses' must NOT get a trailing slash
      const basePath = entityType.includes('/') ? `/${entityType}` : `/${entityType}/`;
      const data = await get(basePath, { limit: 50, ...filters });
      // Backend may return array or paginated { items: [] }
      const items = Array.isArray(data) ? data : (data?.items ?? []);
      setSuggestions(items);
      didFetch.current = true;
    } catch (err) {
      console.error(`Failed to fetch initial ${entityType}`, err);
    } finally {
      setLoading(false);
    }
  }, [entityType, JSON.stringify(filters)]);

  // ── Debounced search ──────────────────────────────────────────────────
  const debouncedSearch = useCallback(
    debounce(async (query: string, currentFilters: Record<string, any>, path: string | null) => {
      setLoading(true);
      try {
        // No trailing slash on search endpoints to avoid 307 redirect (HTTP → HTTPS scheme flip)
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

  // ── PrimeReact completeMethod ─────────────────────────────────────────
  const onSearch = (event: AutoCompleteCompleteEvent) => {
    if (event.query.trim().length === 0) {
      fetchInitial();
    } else {
      debouncedSearch(event.query, filters, customSearchPath);
    }
  };

  // ── When user picks an item from the dropdown ─────────────────────────
  const onSelect = (event: AutoCompleteSelectEvent) => {
    const selected = event.value;
    setQueryText(selected?.[field] ?? '');
    onChange(selected);
  };

  // ── When user manually changes the text ──────────────────────────────
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQueryText(text);
    // If user cleared the field entirely, propagate null
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
          // Called on every keystroke; delegate proper handling to onInputChange
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

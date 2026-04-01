import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import { useApi } from '@/hooks/useApi';
import debounce from 'lodash.debounce';

interface SearchableMultiSelectProps {
  entityType: string;
  value: any[];
  onChange: (value: any[]) => void;
  placeholder?: string;
  field?: string;
  filters?: Record<string, any>;
  itemTemplate?: (item: any) => React.ReactNode;
  disabled?: boolean;
  customSearchPath?: string | null;
  [key: string]: any;
}

const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  entityType,
  value = [],
  onChange,
  placeholder = 'Search and select...',
  field = 'name',
  filters = {},
  itemTemplate,
  disabled = false,
  customSearchPath = null,
  ...props
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { get } = useApi();

  // Keep selected items always available in the list (merge without duplication)
  const valueRef = useRef(value);
  valueRef.current = value;

  const mergeWithSelected = useCallback((newItems: any[]): any[] => {
    const idSet = new Set(newItems.map((o: any) => o?.id));
    const extras = (valueRef.current || []).filter((v: any) => v?.id && !idSet.has(v.id));
    return [...extras, ...newItems];
  }, []);

  // ── Fetch all options (called on mount and when filters change) ────────
  const fetchInitial = useCallback(async () => {
    setLoading(true);
    try {
      // 'masters/skills' → '/masters/skills'  (no trailing slash for sub-paths)
      const basePath = entityType.includes('/') ? `/${entityType}` : `/${entityType}/`;
      const data = await get(basePath, { limit: 100, ...filters });
      const items = Array.isArray(data) ? data : (data?.items ?? []);
      setOptions(mergeWithSelected(items));
    } catch (err) {
      console.error(`Failed to fetch initial ${entityType}`, err);
    } finally {
      setLoading(false);
    }
  }, [entityType, JSON.stringify(filters)]);

  // ── Debounced search ──────────────────────────────────────────────────
  const debouncedSearch = useCallback(
    debounce(async (query: string, currentFilters: Record<string, any>, path: string | null) => {
      if (!query?.trim()) {
        fetchInitial();
        return;
      }
      setLoading(true);
      try {
        // No trailing slash — avoids 307 redirect that flips HTTPS → HTTP (CORS violation)
        const searchPath = path ?? `/${entityType}/search`;
        const results = await get(searchPath, { q: query, ...currentFilters });
        const items = Array.isArray(results) ? results : (results?.items ?? []);
        setOptions(mergeWithSelected(items));
      } catch (err) {
        console.error(`Search failed for ${entityType}`, err);
      } finally {
        setLoading(false);
      }
    }, 350),
    [entityType, get, fetchInitial, mergeWithSelected]
  );

  // Fetch on mount + filter changes
  useEffect(() => {
    fetchInitial();
  }, [JSON.stringify(filters)]);

  // When pre-selected values arrive (edit form), merge them into options
  // so the chips render correctly even before the full list loads
  useEffect(() => {
    if (value && value.length > 0) {
      setOptions(prev => {
        const existingIds = new Set(prev.map((o: any) => o?.id));
        const toAdd = value.filter((v: any) => v?.id && !existingIds.has(v.id));
        return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
      });
    }
  }, [JSON.stringify(value?.map((v: any) => v?.id))]);

  return (
    <div className="relative w-full group">
      <MultiSelect
        {...props}
        value={value}
        options={options}
        onChange={(e: MultiSelectChangeEvent) => onChange(e.value)}
        optionLabel={field}
        placeholder={placeholder}
        filter
        filterPlaceholder="Type to search..."
        onFilter={(e) => debouncedSearch(e.filter, filters, customSearchPath)}
        loading={loading}
        disabled={disabled}
        itemTemplate={itemTemplate}
        display="chip"
        showSelectAll={false}
        maxSelectedLabels={4}
        className="w-full text-[13px] font-medium transition-all border border-theme-border"
        panelClassName="custom-auto-overlay overflow-hidden shadow-2xl rounded-xl mt-1.5 border border-theme-border bg-theme-surface backdrop-blur-md"
        emptyFilterMessage="No results found"
        emptyMessage={loading ? 'Loading...' : 'No options available'}
      />
    </div>
  );
};

export default SearchableMultiSelect;

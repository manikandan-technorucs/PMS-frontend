import React, { useState, useCallback, useRef } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { useApi } from '@/shared/hooks/useApi';
import debounce from 'lodash.debounce';

const ServerSearchDropdown = ({ 
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
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const { get } = useApi();

    const fetchInitial = useCallback(async () => {
        setLoading(true);
        try {
            const data = await get(`/${entityType}`, { limit: 5, ...filters });
            setSuggestions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(`Failed to fetch initial ${entityType}`, err);
        } finally {
            setLoading(false);
        }
    }, [entityType, JSON.stringify(filters)]);

    const debouncedSearch = useCallback(
        debounce(async (query, currentFilters, path) => {
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

    // Reset suggestions if filters change (Dependent Fetching fix)
    React.useEffect(() => {
        setSuggestions([]);
    }, [JSON.stringify(filters)]);

    const onSearch = (event) => {
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
                value={value}
                suggestions={suggestions}
                completeMethod={onSearch}
                onFocus={() => { if (!suggestions.length) fetchInitial(); }}
                onChange={(e) => onChange(e.value)}
                placeholder={placeholder}
                field={field}
                dropdown={dropdown}
                disabled={disabled}
                itemTemplate={itemTemplate}
                className="w-full"
                inputClassName="w-full text-[13px] font-medium px-4 py-2.5 transition-all"
                panelClassName="custom-auto-overlay overflow-hidden shadow-2xl rounded-xl mt-1.5 border border-theme-border bg-theme-surface backdrop-blur-md"
                loading={loading}
            />
        </div>
    );
};

export default ServerSearchDropdown;

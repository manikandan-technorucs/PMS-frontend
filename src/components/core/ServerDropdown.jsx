import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { useEntity } from '@/hooks/useEntity';
import debounce from 'lodash.debounce';

const ServerDropdown = ({ 
    entityType, 
    value, 
    onChange, 
    placeholder = 'Search...', 
    field = 'name', 
    dropdown = true,
    filters = {}, // New: filters to pass to the API (e.g., { project_id: 1 })
    itemTemplate, // New: support for custom item rendering
    ...props 
}) => {
    const [suggestions, setSuggestions] = useState([]);
    const { search, getAll } = useEntity(entityType);
    
    // Store current filters in a ref to check for changes
    const prevFiltersRef = useRef(filters);

    const fetchInitial = useCallback(async () => {
        try {
            const data = await getAll({ limit: 5, ...filters });
            setSuggestions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(`Failed to fetch initial ${entityType}`, err);
        }
    }, [entityType, JSON.stringify(filters)]);

    // Initial load and reload when filters change
    useEffect(() => {
        fetchInitial();
    }, [fetchInitial]);

    // Handle dependent field clearing
    useEffect(() => {
        if (JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters)) {
            // If filters changed, clear the current selected value if it's dependent
            // Note: This decision belongs to the parent, but we can help by clearing suggestions
            setSuggestions([]);
            prevFiltersRef.current = filters;
        }
    }, [filters]);

    // Debounced search logic (300ms)
    const debouncedSearch = useCallback(
        debounce(async (query) => {
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

    const completeMethod = (event) => {
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
                inputClassName="w-full text-[13px] border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg shadow-sm px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                panelClassName="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl mt-1 overflow-hidden"
            />
        </div>
    );
};

export default ServerDropdown;

import React, { useState, useCallback, useRef } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { useEntity } from '@/hooks/useEntity';
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
    const { search, getAll } = useEntity(entityType);

    const fetchInitial = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAll({ limit: 5, ...filters });
            setSuggestions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(`Failed to fetch initial ${entityType}`, err);
        } finally {
            setLoading(false);
        }
    }, [entityType, JSON.stringify(filters)]);

    const debouncedSearch = useCallback(
        debounce(async (query) => {
            setLoading(true);
            try {
                const results = await search(query, filters, customSearchPath);
                setSuggestions(Array.isArray(results) ? results : []);
            } catch (err) {
                console.error(`Search failed for ${entityType}`, err);
            } finally {
                setLoading(false);
            }
        }, 300),
        [entityType, search, JSON.stringify(filters), customSearchPath]
    );

    const onSearch = (event) => {
        if (event.query.trim().length === 0) {
            fetchInitial();
        } else {
            debouncedSearch(event.query);
        }
    };

    return (
        <div className="relative w-full">
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
                inputClassName="w-full text-sm border-slate-200 dark:border-slate-800 focus:border-teal-500 rounded-lg shadow-sm px-3 py-2 bg-white dark:bg-slate-950"
                panelClassName="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-lg mt-1"
            />
            {loading && (
                <i className="pi pi-spin pi-spinner absolute right-10 top-1/2 -translate-y-1/2 text-teal-500 text-sm"></i>
            )}
            <style jsx="true">{`
                .p-autocomplete-panel .p-autocomplete-items .p-autocomplete-item.p-highlight {
                    background-color: var(--primary-subtle, rgba(20, 184, 166, 0.1));
                    color: var(--primary, #14b8a6);
                }
            `}</style>
        </div>
    );
};

export default ServerSearchDropdown;

import React, { useState, useEffect } from 'react';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primereact/autocomplete';
import { api } from '@/api/client';

export interface GraphUser {
  id: string; 
  displayName: string;
  mail: string | null;
}

interface GraphUserAutocompleteProps {
  value: GraphUser | null;
  onChange: (user: GraphUser | null) => void;
  placeholder?: string;
  className?: string;
}

export const GraphUserAutocomplete: React.FC<GraphUserAutocompleteProps> = ({ value, onChange, placeholder ="Search organization users...", className }) => {
  const [items, setItems] = useState<GraphUser[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (event: AutoCompleteCompleteEvent) => {
    const query = event.query;
    if (!query || query.length < 2) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/graph/search-users', { params: { q: query } });
      setItems(response.data || []);
    } catch (error) {
      console.error('Failed to search MS Graph:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const itemTemplate = (item: GraphUser) => {
    return (
      <div className="flex items-center gap-3 py-1">
        <div className="w-8 h-8 rounded-lg bg-brand-teal-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
          {item.displayName?.charAt(0) || '?'}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{item.displayName}</span>
          <span className="text-xs text-slate-500 truncate">{item.mail || 'No email provided'}</span>
        </div>
      </div>
    );
  };

  return (
    <AutoComplete
      value={value}
      suggestions={items}
      completeMethod={search}
      field="displayName"
      itemTemplate={itemTemplate}
      onChange={(e) => onChange(e.value)}
      onClear={() => onChange(null)}
      placeholder={placeholder}
      dropdown
      delay={300}
      className={`w-full ${className || ''}`}
      inputClassName="w-full text-slate-900 dark:text-white text-[13px] font-medium px-4 h-[44px] rounded-xl transition-all border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50"
      panelClassName="overflow-hidden shadow-2xl rounded-xl mt-1.5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
      emptyMessage={loading ? 'Searching...' : 'No results found'}
      pt={{
        list: { className: 'p-1.5 flex flex-col gap-0.5' },
        item: { className: 'rounded-lg px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors text-slate-800 dark:text-slate-200 text-[13px]' },
        dropdownButton: { root: { className: 'bg-transparent border-none text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors' } }
      }}
    />
  );
};

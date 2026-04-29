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

function normalizeUser(raw: any): GraphUser | null {
  if (!raw) return null;
  if (typeof raw === 'string') return null;

  if (raw.displayName) return raw as GraphUser;
  const displayName = [raw.first_name, raw.last_name].filter(Boolean).join(' ') || raw.email || 'Unknown User';
  return {
    id: String(raw.id ?? raw.o365_id ?? ''),
    displayName,
    mail: raw.email ?? raw.mail ?? null,
  };
}

export const GraphUserAutocomplete: React.FC<GraphUserAutocompleteProps> = ({ value, onChange, placeholder = "Search organization users...", className }) => {
  const [items, setItems] = useState<GraphUser[]>([]);
  const [loading, setLoading] = useState(false);

  const normalizedValue = React.useMemo(() => normalizeUser(value), [value]);

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
          <span className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{item.displayName}</span>
          <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{item.mail || 'No email provided'}</span>
        </div>
      </div>
    );
  };

  return (
    <AutoComplete
      value={normalizedValue}
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
      inputClassName="text-[13px] font-medium px-4 h-[44px] rounded-xl transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50"
      inputStyle={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
      panelClassName="overflow-hidden shadow-2xl rounded-xl mt-1.5"
      panelStyle={{ background: 'var(--bg-card)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
      emptyMessage={loading ? 'Searching...' : 'No results found'}
      pt={{
        list: { className: 'p-1.5 flex flex-col gap-0.5' },
        item: { className: 'rounded-lg px-3 py-2.5 cursor-pointer transition-colors text-[13px]', style: { color: 'var(--text-primary)' } },
        dropdownButton: { root: { className: 'bg-transparent border-none transition-colors' } }
      }}
    />
  );
};


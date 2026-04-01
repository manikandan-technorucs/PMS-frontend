import React, { useState, useCallback, useRef } from 'react';
import { api } from '@/api/axiosInstance';
import debounce from 'lodash.debounce';

export interface GraphUser {
  id: string;
  displayName: string;
  mail: string | null;
}

interface GraphUserMultiSelectProps {
  value: GraphUser[];
  onChange: (users: GraphUser[]) => void;
  placeholder?: string;
  className?: string;
}

export const GraphUserMultiSelect: React.FC<GraphUserMultiSelectProps> = ({
  value,
  onChange,
  placeholder = 'Search organization users...',
  className,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GraphUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) { setSuggestions([]); return; }
      setLoading(true);
      try {
        const res = await api.get('/graph/search-users', { params: { q } });
        const all: GraphUser[] = res.data || [];
        const selected = value.map(v => v.id);
        setSuggestions(all.filter(u => !selected.includes(u.id)));
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [value]
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
    search(e.target.value);
  };

  const select = (user: GraphUser) => {
    onChange([...value, user]);
    setQuery('');
    setSuggestions([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  const remove = (id: string) => {
    onChange(value.filter(u => u.id !== id));
  };

  return (
    <div className={`relative ${className || ''}`}>
      {}
      <div
        className="min-h-[40px] w-full flex flex-wrap gap-1.5 items-center px-3 py-1.5 rounded-lg border border-theme-border bg-theme-surface cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map(u => (
          <span
            key={u.id}
            className="flex items-center gap-1.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 text-[12px] font-bold px-2 py-0.5 rounded-full"
          >
            <span className="w-4 h-4 rounded-full bg-teal-500 text-white text-[9px] flex items-center justify-center font-black">
              {u.displayName?.[0] || '?'}
            </span>
            <span className="max-w-[120px] truncate">{u.displayName}</span>
            <button type="button" onClick={() => remove(u.id)} className="ml-0.5 text-teal-600 hover:text-red-500 transition-colors">×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={handleInput}
          onFocus={() => { if (query.length >= 2) setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[140px] bg-transparent outline-none text-[13px] text-theme-primary placeholder-theme-muted py-1"
        />
        {loading && <i className="pi pi-spin pi-spinner text-teal-500 text-[12px] mr-1" />}
      </div>

      {}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-xl border border-theme-border bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
          {suggestions.map(u => (
            <button
              key={u.id}
              type="button"
              onMouseDown={() => select(u)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-brand-teal-500 text-white flex items-center justify-center font-black text-[11px] flex-shrink-0">
                {u.displayName?.[0] || '?'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">{u.displayName}</span>
                <span className="text-[11px] text-slate-500 truncate">{u.mail || 'No email'}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

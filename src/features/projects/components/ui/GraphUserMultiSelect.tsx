import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/api/client';
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
  placeholder = 'Search organisation users...',
  className,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GraphUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const normValue: GraphUser[] = (value ?? []).map((v: any) =>
    typeof v === 'string'
      ? { id: v, displayName: v, mail: v }
      : v
  );

  const updateDropdownPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateDropdownPosition();
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [open, updateDropdownPosition]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const search = useCallback(
    debounce(async (q: string, selectedIds: string[]) => {
      if (q.length < 2) { setSuggestions([]); return; }
      setLoading(true);
      try {
        const res = await api.get('/graph/search-users', { params: { q } });
        const all: GraphUser[] = res.data || [];
        setSuggestions(all.filter(u => !selectedIds.includes(u.id) && !selectedIds.includes(u.mail ?? '')));
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [],
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setOpen(true);
    search(q, normValue.map(v => v.id));
  };

  const select = (user: GraphUser) => {

    const isDuplicate = normValue.some(v => v.id === user.id || v.mail === user.mail);
    if (!isDuplicate) {
      onChange([...normValue, user]);
    }
    setQuery('');
    setSuggestions([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  const remove = (id: string) => {
    onChange(normValue.filter(u => u.id !== id));
  };

  const dropdown =
    open && (suggestions.length > 0 || loading)
      ? createPortal(
        <div
          style={dropdownStyle}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
        >
          {loading && suggestions.length === 0 && (
            <div className="flex items-center gap-2 px-4 py-3 text-[13px] text-slate-400">
              <i className="pi pi-spin pi-spinner text-teal-500 text-[12px]" />
              Searching...
            </div>
          )}
          {suggestions.map(u => (
            <button
              key={u.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); select(u); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 text-white flex items-center justify-center font-black text-[11px] flex-shrink-0">
                {u.displayName?.[0] ?? '?'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">
                  {u.displayName}
                </span>
                <span className="text-[11px] text-slate-500 truncate">
                  {u.mail ?? 'No email'}
                </span>
              </div>
            </button>
          ))}
        </div>,
        document.body,
      )
      : null;

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <div
        className="min-h-[44px] w-full flex flex-wrap gap-2 items-center px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-text transition-all focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-400/20 shadow-sm"
        onClick={() => inputRef.current?.focus()}
      >
        {normValue.map(u => (
          <span
            key={u.id}
            className="inline-flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-[12px] font-bold px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800"
          >
            <span className="w-4 h-4 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 text-white text-[9px] flex items-center justify-center font-black flex-shrink-0">
              {u.displayName?.[0] ?? '?'}
            </span>
            <span className="max-w-[130px] truncate">{u.displayName}</span>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); remove(u.id); }}
              className="ml-0.5 text-teal-400 hover:text-red-500 transition-colors leading-none text-base"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={handleInput}
          onFocus={() => {
            updateDropdownPosition();
            if (query.length >= 2) setOpen(true);
          }}
          placeholder={normValue.length === 0 ? placeholder : 'Add more...'}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-[13px] text-slate-800 dark:text-slate-200 placeholder-slate-400 py-0.5"
        />
        {loading && (
          <i className="pi pi-spin pi-spinner text-teal-500 text-[12px] flex-shrink-0" />
        )}
      </div>

      {dropdown}
    </div>
  );
};

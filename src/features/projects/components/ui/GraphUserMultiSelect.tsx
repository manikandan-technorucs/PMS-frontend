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

  // ── Reposition dropdown relative to the input container ──────────────────
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

  // ── Close on outside click ────────────────────────────────────────────────
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

  // ── Search ────────────────────────────────────────────────────────────────
  const search = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) { setSuggestions([]); return; }
      setLoading(true);
      try {
        const res = await api.get('/graph/search-users', { params: { q } });
        const all: GraphUser[] = res.data || [];
        const selectedIds = value.map(v => v.id);
        setSuggestions(all.filter(u => !selectedIds.includes(u.id)));
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [value],
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

  // ── Dropdown (portalled) ──────────────────────────────────────────────────
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
                onMouseDown={() => select(u)}
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
      {/* Input pill container */}
      <div
        className="min-h-[42px] w-full flex flex-wrap gap-1.5 items-center px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-text transition-colors focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map(u => (
          <span
            key={u.id}
            className="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-[12px] font-bold px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800"
          >
            <span className="w-4 h-4 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 text-white text-[9px] flex items-center justify-center font-black flex-shrink-0">
              {u.displayName?.[0] ?? '?'}
            </span>
            <span className="max-w-[130px] truncate">{u.displayName}</span>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); remove(u.id); }}
              className="ml-0.5 text-teal-400 hover:text-red-500 transition-colors leading-none"
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
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[160px] bg-transparent outline-none text-[13px] text-slate-800 dark:text-slate-200 placeholder-slate-400 py-0.5"
        />
        {loading && (
          <i className="pi pi-spin pi-spinner text-teal-500 text-[12px] flex-shrink-0" />
        )}
      </div>

      {dropdown}
    </div>
  );
};

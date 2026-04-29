import React, { useState, useRef, useCallback, useEffect } from 'react';
import { api } from '@/api/client';
import { Search, X, User, ChevronDown } from 'lucide-react';

export interface GraphUser {
  id: string;
  displayName: string;
  mail: string | null;
}

interface GraphUserAutocompleteProps {
  value: GraphUser | null | any;
  onChange: (user: GraphUser | null) => void;
  placeholder?: string;
  className?: string;
}

function normalizeUser(raw: any): GraphUser | null {
  if (!raw || typeof raw === 'string') return null;
  
  const displayName = raw.displayName || 
    [raw.first_name, raw.last_name].filter(Boolean).join(' ') || 
    raw.email || raw.mail;
    
  if (!displayName) return null;
  
  return { 
    id: String(raw.id ?? raw.o365_id ?? ''), 
    displayName, 
    mail: raw.mail ?? raw.email ?? null 
  };
}

export const GraphUserAutocomplete: React.FC<GraphUserAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Search organization users…',
  className,
}) => {
  const selected = normalizeUser(value);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GraphUser[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchUsers = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await api.get('/graph/search-users', { params: { q } });
      const raw: any[] = res.data || [];
      setResults(raw.map(u => normalizeUser(u)!).filter(Boolean));
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUsers(q), 300);
  };

  const handleSelect = (user: GraphUser) => {
    onChange(user);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const handleDropdownToggle = () => {
    if (selected) { handleClear(new MouseEvent('click') as any); return; }
    setOpen(o => !o);
    if (!open) { setTimeout(() => (wrapRef.current?.querySelector('input') as HTMLInputElement)?.focus(), 50); }
  };

  if (selected) {
    return (
      <div
        className={`relative flex items-center gap-2 h-[44px] rounded-xl px-3 ${className || ''}`}
        style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
      >
        <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {selected.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[13px] font-semibold truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
            {selected.displayName}
          </span>
          {selected.mail && (
            <span className="text-[11px] truncate leading-tight" style={{ color: 'var(--text-muted)' }}>
              {selected.mail}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"
          title="Clear"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={`relative ${className || ''}`}>
      <div
        className="flex items-center gap-2 h-[44px] rounded-xl px-3"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
      >
        {loading
          ? <span className="w-4 h-4 rounded-full border-2 border-teal-500 border-t-transparent animate-spin flex-shrink-0" />
          : <Search size={14} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
        }
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (query.length >= 2) setOpen(true); }}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-[13px] font-medium min-w-0"
          style={{ color: 'var(--text-primary)' }}
          autoComplete="off"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex-shrink-0">
            <X size={12} />
          </button>
        )}
      </div>

      {open && query.length >= 2 && (
        <div
          className="absolute z-50 mt-1.5 w-full rounded-xl shadow-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          {loading ? (
            <div className="px-4 py-3 text-[13px]" style={{ color: 'var(--text-muted)' }}>Searching…</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-[13px]" style={{ color: 'var(--text-muted)' }}>No users found</div>
          ) : (
            <ul className="p-1.5 flex flex-col gap-0.5 max-h-60 overflow-auto">
              {results.map(user => (
                <li
                  key={user.id}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(user); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.displayName}</span>
                    <span className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{user.mail || 'No email'}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

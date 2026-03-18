import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Check, ChevronDown } from 'lucide-react';

export interface SearchableOption {
  id: number;
  label: string;
  subtitle?: string;
}

interface SearchableMultiSelectProps {
  options: SearchableOption[];
  selectedIds: Set<number>;
  onChange: (newSet: Set<number>) => void;
  placeholder?: string;
  emptyMessage?: string;
  maxDisplayChips?: number;
}

export function SearchableMultiSelect({
  options,
  selectedIds,
  onChange,
  placeholder = 'Search and select...',
  emptyMessage = 'No options available',
  maxDisplayChips = 6,
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const lower = searchTerm.toLowerCase();
    return options.filter(opt =>
      opt.label.toLowerCase().includes(lower) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(lower))
    );
  }, [options, searchTerm]);

  const toggleOption = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    onChange(newSet);
  };

  const removeOption = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    newSet.delete(id);
    onChange(newSet);
  };

  const selectedOptions = options.filter(opt => selectedIds.has(opt.id));
  const displayedChips = selectedOptions.slice(0, maxDisplayChips);
  const overflowCount = selectedOptions.length - maxDisplayChips;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <div
        onClick={() => { setIsOpen(!isOpen); setTimeout(() => inputRef.current?.focus(), 50); }}
        className={`min-h-[42px] w-full rounded-lg border bg-theme-surface px-3 py-2 cursor-pointer transition-all flex flex-wrap items-center gap-1.5 ${
          isOpen
            ? 'border-brand-teal-500 ring-2 ring-brand-teal-500/20'
            : 'border-theme-border hover:border-theme-border/80'
        }`}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-[13px] text-theme-muted select-none">{placeholder}</span>
        ) : (
          <>
            {displayedChips.map(opt => (
              <span
                key={opt.id}
                className="inline-flex items-center gap-1 bg-brand-teal-50 dark:bg-brand-teal-900/30 text-brand-teal-700 dark:text-brand-teal-400 text-[12px] font-medium px-2 py-0.5 rounded-md border border-brand-teal-200 dark:border-brand-teal-700"
              >
                {opt.label.length > 25 ? opt.label.substring(0, 25) + '…' : opt.label}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                  onClick={(e) => removeOption(opt.id, e)}
                />
              </span>
            ))}
            {overflowCount > 0 && (
              <span className="text-[11px] text-theme-secondary font-medium pl-1">
                +{overflowCount} more
              </span>
            )}
          </>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-theme-surface border border-theme-border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Input */}
          <div className="p-2 border-b border-theme-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
                className="w-full pl-8 pr-3 py-2 text-[13px] bg-theme-neutral border border-theme-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-teal-500 focus:border-brand-teal-500 text-theme-primary placeholder-theme-muted"
              />
            </div>
            {selectedIds.size > 0 && (
              <div className="flex justify-between items-center mt-1.5 px-1">
                <span className="text-[11px] text-theme-secondary">{selectedIds.size} selected</span>
                <button
                  type="button"
                  className="text-[11px] text-red-500 hover:text-red-600 font-medium"
                  onClick={() => onChange(new Set())}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-center text-[13px] text-theme-muted">
                {searchTerm ? 'No results found' : emptyMessage}
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = selectedIds.has(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-brand-teal-50 dark:bg-brand-teal-900/20'
                        : 'hover:bg-theme-neutral'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? 'bg-brand-teal-500 border-brand-teal-500'
                        : 'border-theme-border'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[13px] font-medium text-theme-primary truncate">
                        {opt.label}
                      </span>
                      {opt.subtitle && (
                        <span className="block text-[11px] text-theme-muted truncate">
                          {opt.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

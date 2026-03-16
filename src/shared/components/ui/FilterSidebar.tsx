import React, { useMemo } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from './Button/Button';

interface FilterOption {
    label: string;
    value: string;
}

interface FilterGroup {
    id: string;
    label: string;
    options: FilterOption[];
}

interface FilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    groups: FilterGroup[];
    selectedFilters: Record<string, string[]>;
    onFilterChange: (groupId: string, value: string) => void;
    onClear: () => void;
}

export function FilterSidebar({
    isOpen,
    onClose,
    groups,
    selectedFilters,
    onFilterChange,
    onClear
}: FilterSidebarProps) {
    const activeCount = useMemo(
        () => Object.values(selectedFilters).reduce((s, a) => s + a.length, 0),
        [selectedFilters]
    );

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[2px] z-[55] transition-opacity"
                onClick={onClose}
            />

            <div className="fixed inset-y-0 right-0 w-[300px] bg-white dark:bg-slate-900 shadow-2xl z-[60] border-l border-gray-200 dark:border-slate-700 animate-in slide-in-from-right duration-300">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between bg-gray-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-[#059669]" />
                            <h2 className="font-bold text-[#1F2937] dark:text-gray-100 text-[16px]">Filters</h2>
                            {activeCount > 0 && (
                                <span className="bg-[#059669] text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {activeCount}
                                </span>
                            )}
                        </div>
                        <button onClick={onClose} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <X className="w-5 h-5 text-[#6B7280] dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Filters Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {groups.map(group => (
                            <div key={group.id} className="space-y-3">
                                <h3 className="text-[13px] font-bold text-[#374151] dark:text-gray-300 uppercase tracking-wider">{group.label}</h3>
                                <div className="space-y-1.5">
                                    {group.options.map(option => {
                                        const isSelected = selectedFilters[group.id]?.includes(option.value);
                                        return (
                                            <label key={option.value} className="flex items-center gap-2.5 cursor-pointer group px-2 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => onFilterChange(group.id, option.value)}
                                                        className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-[#059669] focus:ring-[#059669]/20"
                                                    />
                                                </div>
                                                <span className={`text-[14px] transition-colors ${isSelected ? 'text-[#059669] font-medium' : 'text-[#4B5563] dark:text-gray-400 group-hover:text-[#1F2937] dark:group-hover:text-gray-200'}`}>
                                                    {option.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={onClear}>
                            Clear All
                        </Button>
                        <Button className="flex-1" onClick={onClose}>
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

import React from 'react';
import { X, Filter, FilterIcon } from 'lucide-react';
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
    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-[300px] bg-white shadow-2xl z-[60] border-l animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-[#14b8a6]" />
                        <h2 className="font-bold text-slate-700 text-[16px]">Filters</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-[#6B7280]" />
                    </button>
                </div>

                {/* Filters Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {groups.map(group => (
                        <div key={group.id} className="space-y-3">
                            <h3 className="text-[13px] font-bold text-[#374151] uppercase tracking-wider">{group.label}</h3>
                            <div className="space-y-2">
                                {group.options.map(option => {
                                    const isSelected = selectedFilters[group.id]?.includes(option.value);
                                    return (
                                        <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => onFilterChange(group.id, option.value)}
                                                    className="w-4 h-4 rounded border-gray-300 text-[#14b8a6] focus:ring-[#14b8a6]/20"
                                                />
                                            </div>
                                            <span className={`text-[14px] transition-colors ${isSelected ? 'text-[#14b8a6] font-medium' : 'text-[#4B5563] group-hover:text-slate-700'}`}>
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
                <div className="p-4 border-t bg-gray-50 flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={onClear}>
                        Clear All
                    </Button>
                    <Button className="flex-1" onClick={onClose}>
                        Apply Filters
                    </Button>
                </div>
            </div>
        </div>
    );
}

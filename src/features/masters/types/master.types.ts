// src/features/masters/types/master.types.ts
// Single source of truth for all ERP lookup types.
// Import this wherever a status/priority/role/department dropdown is needed.

export interface MasterItem {
    id: number;
    name: string;
}

export interface MasterOption {
    label: string;
    value: number;
}

/** Convert raw API response array → PrimeReact Dropdown/MultiSelect options */
export const toOptions = (items: MasterItem[]): MasterOption[] =>
    items.map((i) => ({ label: i.name, value: i.id }));

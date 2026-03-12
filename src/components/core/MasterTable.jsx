import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { FilterMatchMode } from 'primereact/api';
import { Tag } from 'primereact/tag';

const MasterTable = ({ 
    title, 
    data, 
    columns, 
    onCreate, 
    onExport, 
    loading = false, 
    ...props 
}) => {
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const statusTemplate = (rowData) => {
        const severity = rowData.status === 'Completed' ? 'success' : rowData.status === 'Active' ? 'info' : 'warning';
        return <Tag value={rowData.status} severity={severity} />;
    };

    const header = (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <h1 className="text-xl font-bold font-heading text-slate-800 dark:text-white">{title}</h1>
            <div className="flex gap-2">
                <span className="p-input-icon-left w-full sm:w-[250px]">
                    <i className="pi pi-search" />
                    <InputText 
                        value={globalFilterValue} 
                        onChange={onGlobalFilterChange} 
                        placeholder="Search..." 
                        className="p-inputtext-sm w-full border-slate-200 dark:border-slate-800 rounded-lg"
                    />
                </span>
                <Button label="Export" icon="pi pi-file-export" onClick={onExport} outlined severity="secondary" className="p-button-sm rounded-lg" />
                <Button label="Create" icon="pi pi-plus" onClick={onCreate} severity="primary" className="p-button-sm rounded-lg bg-blue-600 hover:bg-blue-700" />
            </div>
        </div>
    );

    return (
        <div className="w-full bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl">
            <DataTable 
                value={data} 
                paginator 
                rows={10} 
                loading={loading}
                filters={filters} 
                globalFilterFields={['name', 'status', 'description']} 
                header={header} 
                emptyMessage="No results found."
                className="p-datatable-sm rounded-xl overflow-hidden shadow-xl"
                {...props}
            >
                {columns.map((col, i) => (
                    <Column key={i} field={col.field} header={col.header} sortable={col.sortable} 
                            body={col.field === 'status' ? statusTemplate : col.body} />
                ))}
            </DataTable>
        </div>
    );
};

export default MasterTable;

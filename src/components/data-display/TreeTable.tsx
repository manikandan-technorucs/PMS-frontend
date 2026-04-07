import React from 'react';
import { TreeTable as PrimeTreeTable } from 'primereact/treetable';
import type { TreeTableProps as PrimeTreeTableProps } from 'primereact/treetable';

type TreeTableProps = PrimeTreeTableProps;

export const TreeTable: React.FC<TreeTableProps> = ({ children, pt, ...rest }) => {
  const defaultPt: TreeTableProps['pt'] = {
    root: {
      className: 'w-full overflow-hidden border-collapse',
    },
    table: { className: 'w-full text-left bg-transparent border-collapse' },
    tbody: { className: 'bg-transparent [&_tr:last-child]:border-b-0 [&_tr:last-child_td]:border-b-0' },
    headerRow: {
      className: 'bg-slate-50/50 dark:bg-slate-800/30',
    },
    headerCell: {
      className: 'py-4 px-6 text-slate-900 dark:text-slate-100 font-bold border-b border-slate-100 dark:border-slate-800/50 text-[13px] text-left',
    },
    row: {
      root: (options: any) => ({
        className: `transition-all duration-200 group border-b border-slate-100/50 dark:border-slate-800/50 ${
          options.context.selected ? 'bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
        }`,
      })
    },
    bodyCell: {
      className: 'py-4 px-6 text-slate-600 dark:text-slate-400 text-[13px]',
    },
    ...pt,
  };

  return (
    <PrimeTreeTable pt={defaultPt} {...rest}>
      {children}
    </PrimeTreeTable>
  );
};

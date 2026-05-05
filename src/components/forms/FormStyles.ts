import { classNames } from 'primereact/utils';

/**
 * Common input classes for a consistent form look
 */
export const inputCls = (hasError?: boolean) => classNames(
    'w-full rounded-xl px-3 py-2.5 text-sm transition-all outline-none focus:ring-2',
    hasError
        ? 'border border-red-400 focus:ring-red-200 focus:border-red-500'
        : 'border border-[var(--border-color)] focus:ring-[hsl(160_60%_45%_/_0.2)] focus:border-[hsl(160_60%_45%)]',
);

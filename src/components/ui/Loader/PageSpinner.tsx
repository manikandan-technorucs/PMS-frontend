import React from 'react';

interface PageSpinnerProps {
  /** Optional label shown below the spinner. Defaults to "Loading". */
  label?: string;
  /** Fills the entire page viewport when true. */
  fullPage?: boolean;
}

/**
 * Shared branded loading spinner.
 * - Use fullPage={true} for top-level page loading (replaces PageLoader inline pattern)
 * - Use without fullPage for inline section loading
 */
export const PageSpinner: React.FC<PageSpinnerProps> = ({ label = 'Loading', fullPage = false }) => (
    <div className={`flex items-center justify-center ${fullPage ? 'min-h-[60vh]' : 'py-10'}`}>
        <div className="flex flex-col items-center gap-3">
            <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-[3px] border-slate-200 dark:border-slate-700" />
                <div
                    className="absolute inset-0 rounded-full border-[3px] border-transparent animate-spin"
                    style={{ borderTopColor: '#0CD1C3' }}
                />
            </div>
            {label && (
                <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 animate-pulse">
                    {label}
                </span>
            )}
        </div>
    </div>
);

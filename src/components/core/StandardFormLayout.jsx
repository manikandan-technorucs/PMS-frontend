import React from 'react';
import { Button } from 'primereact/button';
import { cn } from '@/shared/utils/cn';

const StandardFormLayout = ({ 
    title, 
    children, 
    onSave, 
    onCancel, 
    onSubmit, 
    loading = false,
    className,
    ...props 
}) => {
    return (
        <form 
            onSubmit={(e) => { e.preventDefault(); if (onSubmit) onSubmit(e); else if (onSave) onSave(e); }} 
            className={cn("max-w-4xl mx-auto py-8 px-8 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl mt-6 mb-24", className)}
        >
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between border-b dark:border-slate-800 pb-5">
                    <h1 className="text-xl font-bold font-heading text-slate-900 dark:text-white">{title}</h1>
                    <div className="flex gap-2">
                         {/* Optional header actions can go here */}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
                    {children}
                </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 flex justify-end gap-3 z-50">
                <div className="w-full max-w-4xl mx-auto flex justify-end gap-3 px-6">
                    <Button 
                        label="Cancel" 
                        onClick={onCancel} 
                        outlined 
                        severity="secondary" 
                        type="button" 
                        className="p-button-sm rounded-lg px-8 py-2 text-sm font-medium border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    />
                    <Button 
                        label="Save" 
                        onClick={onSave} 
                        loading={loading}
                        severity="primary" 
                        type="submit" 
                        className="p-button-sm rounded-lg px-12 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 border-none"
                    />
                </div>
            </div>
        </form>
    );
};

export default StandardFormLayout;

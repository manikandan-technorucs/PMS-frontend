import React from 'react';
import { Button } from 'primereact/button';
import { cn } from '@/utils/cn';

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
            className={cn("max-w-4xl mx-auto py-8 px-8 card-base !shadow-2xl mt-6 mb-24", className)}
        >
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between border-b border-theme-border pb-5">
                    <h1 className="text-xl font-bold font-heading text-theme-primary uppercase tracking-tight">{title}</h1>
                    <div className="flex gap-2">
                         {/* Optional header actions can go here */}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
                    {children}
                </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-theme-surface/90 backdrop-blur-md border-t border-theme-border p-4 flex justify-end gap-3 z-50 shadow-lg">
                <div className="w-full max-w-4xl mx-auto flex justify-end gap-4 px-6 font-bold">
                    <Button 
                        label="Cancel" 
                        onClick={onCancel} 
                        outlined 
                        severity="secondary" 
                        type="button" 
                        className="p-button-sm rounded-lg px-8 py-2 text-sm font-bold border-theme-border text-theme-secondary hover:bg-theme-neutral"
                    />
                    <Button 
                        label="Save Changes" 
                        onClick={onSave} 
                        loading={loading}
                        severity="primary" 
                        type="submit" 
                        className="p-button-sm rounded-lg px-12 py-2 text-sm font-bold bg-brand-teal-600 hover:bg-brand-teal-700 shadow-lg shadow-brand-teal-500/20 border-none text-white"
                    />
                </div>
            </div>
        </form>
    );
};

export default StandardFormLayout;

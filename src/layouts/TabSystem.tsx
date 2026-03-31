import { Button } from 'primereact/button';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface TabSystemProps {
    tabs: Tab[];
    defaultTab?: string;
    onTabChange?: (tabId: string) => void;
    children: React.ReactNode;
}

/**
 * Reusable TabSystem component that persists the active tab in the URL query string.
 * This directly matches the user's architectural requirement for maintaining state
 * across navigations in Project Details, Dashboard, etc.
 */
export function TabSystem({ tabs, defaultTab, onTabChange, children }: TabSystemProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlTab = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState<string>(
        urlTab || defaultTab || (tabs.length > 0 ? tabs[0].id : '')
    );

    useEffect(() => {
        // Sync state with URL without overriding unexpectedly on first load if missing
        if (urlTab && urlTab !== activeTab) {
            setActiveTab(urlTab);
        } else if (!urlTab && activeTab) {
            setSearchParams({ tab: activeTab }, { replace: true });
        }
    }, [urlTab, activeTab, setSearchParams]);

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
        if (onTabChange) {
            onTabChange(tabId);
        }
    };

    return (
        <div className="flex flex-col w-full">
            {/* Tab Navigation Menu */}
            <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                    <Button unstyled 
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`
              flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors
              ${activeTab === tab.id
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
                    >
                        {tab.icon && <span>{tab.icon}</span>}
                        {tab.label}
                    </Button>
                ))}
            </div>

            {/* Tab Content Layer - Provides active context using children rendering */}
            <div className="pt-6">
                {/*
          We leverage React.Children to map over child elements.
          Each child should ideally check if it is active, or we manage it here.
          For this generic component, we render all children, expecting them
          to independently check `useSearchParams` or we can pass context.
          
          A simpler implementation for domain modules is to just conditionally
          render inside the parent based on searchParams.get('tab').
        */}
                {children}
            </div>
        </div>
    );
}

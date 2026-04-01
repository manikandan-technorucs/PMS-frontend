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

export function TabSystem({ tabs, defaultTab, onTabChange, children }: TabSystemProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlTab = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState<string>(
        urlTab || defaultTab || (tabs.length > 0 ? tabs[0].id : '')
    );

    useEffect(() => {
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
            {}
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

            {}
            <div className="pt-6">
                {}
                {children}
            </div>
        </div>
    );
}

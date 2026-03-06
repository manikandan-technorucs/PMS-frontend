import React, { useState } from 'react';
import { AutomationList } from './AutomationList';
import { AutomationEditor } from './AutomationEditor';
import { AutomationRule } from '../types';

export function Automation() {
    const [view, setView] = useState<'list' | 'editor' | 'logs'>('list');
    const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);

    const handleCreate = () => {
        setSelectedRule(null);
        setView('editor');
    };

    const handleEdit = (rule: AutomationRule) => {
        setSelectedRule(rule);
        setView('editor');
    };

    const handleViewLogs = (rule: AutomationRule) => {
        setSelectedRule(rule);
        setView('logs');
    };

    const handleBack = () => {
        setView('list');
        setSelectedRule(null);
    };

    if (view === 'editor') {
        return <AutomationEditor rule={selectedRule} onBack={handleBack} />;
    }

    if (view === 'logs' && selectedRule) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold mb-4">Execution Logs: {selectedRule.trigger_event}</h2>
                <p className="text-theme-muted mb-4">View execution history and error payloads for this rule.</p>
                <button className="px-4 py-2 bg-theme-primary text-white rounded-md" onClick={handleBack}>
                    Back to Rules
                </button>
            </div>
        );
    }

    return <AutomationList onCreate={handleCreate} onEdit={handleEdit} onViewLogs={handleViewLogs} />;
}

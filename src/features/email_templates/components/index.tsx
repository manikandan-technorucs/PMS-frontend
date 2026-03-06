import React, { useState } from 'react';
import { TemplateList } from './TemplateList';
import { TemplateEditor } from './TemplateEditor';
import { EmailTemplate } from '../types';

export function EmailTemplates() {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

    const handleCreate = () => {
        setSelectedTemplate(null);
        setView('editor');
    };

    const handleEdit = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setView('editor');
    };

    const handleBack = () => {
        setView('list');
        setSelectedTemplate(null);
    };

    if (view === 'editor') {
        return <TemplateEditor template={ selectedTemplate } onBack = { handleBack } />;
    }

    return <TemplateList onCreate={ handleCreate } onEdit = { handleEdit } />;
}

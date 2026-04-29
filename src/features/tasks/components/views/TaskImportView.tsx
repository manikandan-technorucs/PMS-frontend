import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { Card } from '@/components/layout/Card';
import { tasksService } from '@/api/services/tasks.service';
import { useToast } from '@/providers/ToastContext';
import { ArrowLeft, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export function TaskImportPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (f: File) => {
        if (f.name.endsWith('.csv')) setFile(f);
        else showToast('warning', 'Invalid File', 'Please upload a CSV file.');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const parseCSV = (text: string) => {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        return lines.slice(1).filter(l => l.trim()).map(line => {
            const values = line.split(',').map(v => v.trim());
            const task: any = {};
            headers.forEach((h, i) => {
                const v = values[i];
                if (!v) return;
                if (h === 'task_name') task.task_name = v;
                if (h === 'description') task.description = v;
                if (h === 'project_id') task.project_id = parseInt(v) || null;
                if (h === 'status_id') task.status_id = parseInt(v) || null;
                if (h === 'priority_id') task.priority_id = parseInt(v) || null;
                if (h === 'start_date') task.start_date = v;
                if (h === 'due_date') task.due_date = v;
                if (h === 'estimated_hours') task.estimated_hours = parseFloat(v) || 0;
                if (h === 'billing_type') task.billing_type = v;
                if (h === 'tags') task.tags = v;
            });
            return task;
        });
    };

    const handleImport = async () => {
        if (!file) return;
        setImporting(true);
        try {
            const text = await file.text();
            const tasks = parseCSV(text);
            if (tasks.length === 0) { showToast('warning', 'Empty File', 'No valid rows found in CSV.'); return; }
            await tasksService.bulkCreateTasks(tasks);
            showToast('success', 'Import Successful', `Imported ${tasks.length} tasks.`);
            navigate('/tasks');
        } catch {
            showToast('error', 'Import Failed', 'Failed to parse or upload the CSV file.');
        } finally {
            setImporting(false);
        }
    };

    const handleDownloadTemplate = () => {
        const headers = ['task_name', 'description', 'project_id', 'status_id', 'priority_id', 'start_date', 'due_date', 'estimated_hours', 'billing_type', 'tags'];
        const sampleRows = [
            ['Implement Login API', 'Build the login endpoint with JWT support', '', '', '', '2026-05-01', '2026-05-10', '8', 'Billable', 'api,auth'],
            ['Design Dashboard UI', 'Create mockups and implement dashboard views', '', '', '', '2026-05-05', '2026-05-20', '16', 'Billable', 'frontend,ui'],
        ];
        const csvContent = [headers, ...sampleRows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'tasks_import_template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('success', 'Template Downloaded', 'Fill in the template and import it back here.');
    };

    return (
        <PageLayout
            title="Import Tasks"
            actions={
                <Button variant="secondary" size="sm" onClick={() => navigate('/tasks')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tasks
                </Button>
            }
        >
            <div className="max-w-2xl mx-auto py-8 space-y-6">
                <Card hoverEffect={false}>
                    <div className="px-5 py-4 flex gap-3 items-start">
                        <AlertCircle className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-1">CSV Format</p>
                            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-2">
                                Your CSV must include these headers:
                            </p>
                            <code className="block text-[12px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg px-3 py-2 font-mono mb-3">
                                task_name, description, project_id, status_id, priority_id, start_date, due_date, estimated_hours, billing_type, tags
                            </code>
                            <p className="text-[12px] text-slate-400 dark:text-slate-500 mb-3">
                                Dates should be in <strong>YYYY-MM-DD</strong> format. IDs should be numeric. Billing type: <strong>Billable</strong>, <strong>Non-Billable</strong>, or <strong>Internal</strong>.
                            </p>
                            <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
                                <FileText className="w-4 h-4" />
                                Download CSV Template
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card hoverEffect={false}>
                    <div className="px-5 py-5">
                        <div
                            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('task-csv-input')?.click()}
                            className={`relative cursor-pointer rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-14 transition-all duration-200 ${isDragging
                                ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/10'
                                : 'border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                }`}
                        >
                            <input
                                id="task-csv-input"
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                            />
                            {file ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                                        <FileText className="w-7 h-7 text-teal-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[15px] font-bold text-slate-800 dark:text-slate-200">{file.name}</p>
                                        <p className="text-[13px] text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB · CSV</p>
                                    </div>
                                    <CheckCircle className="w-5 h-5 text-teal-500" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Upload className="w-7 h-7 text-slate-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[15px] font-semibold text-slate-700 dark:text-slate-200">Drop your CSV here</p>
                                        <p className="text-[13px] text-slate-400 mt-0.5">or click to browse files</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button variant="secondary" size="sm" onClick={() => navigate('/tasks')}>Cancel</Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleImport}
                        disabled={!file || importing}
                        loading={importing}
                    >
                        {importing ? 'Importing…' : 'Import Tasks'}
                    </Button>
                </div>
            </div>
        </PageLayout>
    );
}

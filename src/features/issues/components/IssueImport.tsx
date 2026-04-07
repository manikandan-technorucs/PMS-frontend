import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { Card } from '@/components/layout/Card';
import { issuesService } from '@/api/services/issues.service';
import { useToast } from '@/providers/ToastContext';
import { ArrowLeft, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export function IssueImportPage() {
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
            const issue: any = {};
            headers.forEach((h, i) => {
                const v = values[i];
                if (!v) return;
                if (h === 'title')            issue.title            = v;
                if (h === 'description')      issue.description      = v;
                if (h === 'project_id')       issue.project_id       = parseInt(v) || null;
                if (h === 'assignee_id')      issue.assignee_id      = parseInt(v) || null;
                if (h === 'reporter_id')      issue.reporter_id      = parseInt(v) || null;
                if (h === 'status_id')        issue.status_id        = parseInt(v) || null;
                if (h === 'priority_id')      issue.priority_id      = parseInt(v) || null;
                if (h === 'start_date')       issue.start_date       = v;
                if (h === 'end_date')         issue.end_date         = v;
                if (h === 'estimated_hours')  issue.estimated_hours  = parseFloat(v) || 0;
            });
            return issue;
        });
    };

    const handleImport = async () => {
        if (!file) return;
        setImporting(true);
        try {
            const text = await file.text();
            const issues = parseCSV(text);
            if (issues.length === 0) { showToast('warning', 'Empty File', 'No valid rows found in CSV.'); return; }
            await issuesService.bulkCreateIssues(issues);
            showToast('success', 'Import Successful', `Imported ${issues.length} issues.`);
            navigate('/issues');
        } catch {
            showToast('error', 'Import Failed', 'Failed to parse or upload the CSV file.');
        } finally {
            setImporting(false);
        }
    };

    return (
        <PageLayout
            title="Import Issues"
            actions={
                <Button variant="secondary" size="sm" onClick={() => navigate('/issues')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Issues
                </Button>
            }
        >
            <div className="max-w-2xl mx-auto py-8 space-y-6">
                <Card hoverEffect={false}>
                    <div className="px-5 py-4 flex gap-3 items-start">
                        <AlertCircle className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-1">CSV Format</p>
                            <p className="text-[13px] text-slate-500 dark:text-slate-400">Your CSV must include these headers:</p>
                            <code className="block mt-2 text-[12px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg px-3 py-2 font-mono">
                                title, description, project_id, assignee_id, reporter_id, status_id, priority_id, start_date, end_date, estimated_hours
                            </code>
                        </div>
                    </div>
                </Card>

                <Card hoverEffect={false}>
                    <div className="px-5 py-5">
                        <div
                            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('issue-csv-input')?.click()}
                            className={`relative cursor-pointer rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-14 transition-all duration-200 ${
                                isDragging
                                    ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/10'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                        >
                            <input id="issue-csv-input" type="file" accept=".csv" className="hidden"
                                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
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
                    <Button variant="secondary" size="sm" onClick={() => navigate('/issues')}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={handleImport} disabled={!file || importing} loading={importing}>
                        {importing ? 'Importing…' : 'Import Issues'}
                    </Button>
                </div>
            </div>
        </PageLayout>
    );
}

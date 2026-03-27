import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { issuesService } from '../services/issues.api';
import { useToast } from '@/providers/ToastContext';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface IssueImportProps {
    visible: boolean;
    onHide: () => void;
    onSuccess: () => void;
}

export function IssueImport({ visible, onHide, onSuccess }: IssueImportProps) {
    const { showToast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const parseCSV = (text: string) => {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        return lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.split(',').map(v => v.trim());
            const issue: any = {};
            headers.forEach((header, index) => {
                const val = values[index];
                if (val !== undefined && val !== '') {
                    if (header === 'title') issue.title = val;
                    if (header === 'description') issue.description = val;
                    if (header === 'project_id') issue.project_id = parseInt(val) || null;
                    if (header === 'assignee_id') issue.assignee_id = parseInt(val) || null;
                    if (header === 'reporter_id') issue.reporter_id = parseInt(val) || null;
                    if (header === 'status_id') issue.status_id = parseInt(val) || null;
                    if (header === 'priority_id') issue.priority_id = parseInt(val) || null;
                    if (header === 'start_date') issue.start_date = val;
                    if (header === 'end_date') issue.end_date = val;
                    if (header === 'estimated_hours') issue.estimated_hours = parseFloat(val) || 0;
                }
            });
            return issue;
        });
    };

    const handleImport = async () => {
        if (!file) return;

        try {
            setImporting(true);
            const text = await file.text();
            const issues = parseCSV(text);

            if (issues.length === 0) {
                showToast('warning', 'Empty File', 'No valid issue data found in CSV.');
                return;
            }

            await issuesService.bulkCreateIssues(issues);
            showToast('success', 'Import Successful', `Successfully imported ${issues.length} issues.`);
            onSuccess();
            onHide();
        } catch (error) {
            console.error('Import failed', error);
            showToast('error', 'Import Failed', 'Failed to parse or upload CSV file.');
        } finally {
            setImporting(false);
            setFile(null);
        }
    };

    return (
        <Dialog
            header="Import Issues from CSV"
            visible={visible}
            onHide={onHide}
            style={{ width: '450px' }}
            className="p-fluid rounded-xl overflow-hidden"
        >
            <div className="space-y-4">
                <div className="p-4 bg-blue-50 text-blue-700 rounded-lg text-sm flex gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>
                        CSV should include headers: <strong>title, description, project_id, assignee_id, reporter_id, status_id, priority_id, start_date, end_date, estimated_hours</strong>.
                    </p>
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-[#14b8a6] transition-all cursor-pointer relative">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {file ? (
                        <>
                            <FileText className="w-12 h-12 text-[#14b8a6] mb-2" />
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </>
                    ) : (
                        <>
                            <Upload className="w-12 h-12 text-gray-400 mb-2" />
                            <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
                            <p className="text-sm text-gray-500">CSV files only</p>
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button text onClick={onHide}>Cancel</Button>
                    <Button className="btn-gradient" onClick={handleImport} disabled={!file || importing}>
                        {importing ? 'Importing...' : 'Start Import'}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}


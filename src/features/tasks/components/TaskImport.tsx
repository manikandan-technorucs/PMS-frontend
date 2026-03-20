import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { tasksService } from '../services/tasks.api';
import { useToast } from '@/shared/context/ToastContext';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface TaskImportProps {
    visible: boolean;
    onHide: () => void;
    onSuccess: () => void;
}

export function TaskImport({ visible, onHide, onSuccess }: TaskImportProps) {
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
            const task: any = {};
            headers.forEach((header, index) => {
                if (header === 'title') task.title = values[index];
                if (header === 'description') task.description = values[index];
                if (header === 'project_id') task.project_id = parseInt(values[index]) || null;
                if (header === 'assignee_id') task.assignee_id = parseInt(values[index]) || null;
                if (header === 'status_id') task.status_id = parseInt(values[index]) || null;
                if (header === 'priority_id') task.priority_id = parseInt(values[index]) || null;
                if (header === 'due_date') task.due_date = values[index] || null;
                if (header === 'estimated_hours') task.estimated_hours = parseFloat(values[index]) || 0;
            });
            return task;
        });
    };

    const handleImport = async () => {
        if (!file) return;

        try {
            setImporting(true);
            const text = await file.text();
            const tasks = parseCSV(text);

            if (tasks.length === 0) {
                showToast('warn', 'Empty File', 'No valid task data found in CSV.');
                return;
            }

            await tasksService.bulkCreateTasks(tasks);
            showToast('success', 'Import Successful', `Successfully imported ${tasks.length} tasks.`);
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
            header="Import Tasks from CSV"
            visible={visible}
            onHide={onHide}
            style={{ width: '450px' }}
            className="p-fluid rounded-xl overflow-hidden"
        >
            <div className="space-y-4">
                <div className="p-4 bg-blue-50 text-blue-700 rounded-lg text-sm flex gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>
                        CSV should include headers: <strong>title, description, project_id, assignee_id, status_id, priority_id, due_date</strong>.
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
                    <Button variant="ghost" onClick={onHide}>Cancel</Button>
                    <Button onClick={handleImport} disabled={!file || importing}>
                        {importing ? 'Importing...' : 'Start Import'}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}

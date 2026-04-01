import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from 'primereact/button';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/providers/ToastContext';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { Input } from '@/components/ui/Input/Input';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, Save } from 'lucide-react';

interface MatrixRow {
  id: string;
  project: any;
  task: any;
  hours: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
}

export function WeeklyTimeLogAdd() {
  const navigate = useNavigate();
  const { post, isSubmitting } = useApi();
  const { showToast } = useToast();

  const [dateReference, setDateReference] = useState(new Date());

  const weekDays = useMemo(() => {
    const dates = [];
    const dt = new Date(dateReference);
    const day = dt.getDay(); // 0-6
    dt.setDate(dt.getDate() - day);
    
    for (let i = 0; i < 7; i++) {
        const nd = new Date(dt);
        nd.setDate(nd.getDate() + i);
        dates.push(nd);
    }
    return dates;
  }, [dateReference]);

  const [rows, setRows] = useState<MatrixRow[]>([
    { id: '1', project: null, task: null, hours: [0,0,0,0,0,0,0] }
  ]);

  const handleDateShift = (direction: 'prev' | 'next') => {
    setDateReference(prev => {
        const nd = new Date(prev);
        nd.setDate(nd.getDate() + (direction === 'next' ? 7 : -7));
        return nd;
    });
  };

  const addRow = () => {
    setRows(prev => [...prev, { id: Date.now().toString(), project: null, task: null, hours: [0,0,0,0,0,0,0] }]);
  };

  const removeRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const updateRow = (id: string, field: keyof MatrixRow, value: any) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const updateHours = (id: string, dayIndex: number, val: string) => {
    setRows(prev => prev.map(r => {
        if (r.id !== id) return r;
        const newHours = [...r.hours];
        newHours[dayIndex] = parseFloat(val) || 0;
        return { ...r, hours: newHours };
    }));
  };

  const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

  const handleSave = async () => {
    const payloads = [];

    for (const row of rows) {
        if (!row.project) continue; // Skip unassigned rows completely

        let tId = null, iId = null;
        const workItem = row.task;
        if (workItem) {
            if (workItem.type === 'issue') iId = extractId(workItem);
            else tId = extractId(workItem);
        }

        for (let i = 0; i < 7; i++) {
            if (row.hours[i] && row.hours[i] > 0) {
                const logDate = new Date(weekDays[i]);
                const dateStr = [
                    logDate.getFullYear(),
                    String(logDate.getMonth() + 1).padStart(2, '0'),
                    String(logDate.getDate()).padStart(2, '0')
                ].join('-');

                payloads.push({
                    project_id: extractId(row.project),
                    task_id: tId,
                    issue_id: iId,
                    date: dateStr,
                    hours: row.hours[i],
                    billing_type: 'Billable',
                    approval_status: 'Pending',
                    general_log: !tId && !iId,
                    description: '',
                    log_title: ''
                });
            }
        }
    }

    if (payloads.length === 0) {
        showToast('error', 'Validation Error', 'No hours entered or project missing on filled rows.');
        return;
    }

    try {
        await post('/timelogs/bulk', { logs: payloads });
        showToast('success', 'Time Logs Created', `Successfully logged ${payloads.length} entries.`);
        navigate('/time-log');
    } catch (err: any) {
        showToast('error', 'Save Failed', err?.message || 'Failed to save periodic time logs.');
    }
  };

  const totalCols = [0,0,0,0,0,0,0];
  let grandTotal = 0;
  rows.forEach(r => {
      r.hours.forEach((h, i) => {
          totalCols[i] += h;
          grandTotal += h;
      });
  });

  return (
    <PageLayout
      title="Weekly Time Log"
      actions={
        <div className="flex gap-3">
          <Button outlined onClick={() => navigate('/time-log')} label="Cancel" className="!px-6" />
          <Button onClick={handleSave} className="btn-gradient" loading={isSubmitting} disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" /> Save Logs
          </Button>
        </div>
      }
    >
      <div className="space-y-4 max-w-[1400px]">
        {}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 flex justify-center shadow-sm">
            <div className="flex items-center gap-2">
                <Button icon={<ChevronLeft size={16} />} text onClick={() => handleDateShift('prev')} />
                <div className="px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-200 min-w-[300px] text-center flex justify-center items-center gap-2">
                    <CalendarIcon size={16} className="text-teal-500" />
                    {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric'})} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}
                </div>
                <Button icon={<ChevronRight size={16} />} text onClick={() => handleDateShift('next')} />
            </div>
        </div>

        {}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto p-4">
                <table className="w-full min-w-[900px]">
                    <thead>
                        <tr>
                            <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[20%]">Project</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[20%]">Job / Task</th>
                            {weekDays.map((d, i) => (
                                <th key={i} className="text-center py-3 px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <div className="flex flex-col">
                                        <span>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]}</span>
                                        <span className="text-slate-400 font-medium">{d.toLocaleDateString('en-US',{day:'2-digit', month: 'short'})}</span>
                                    </div>
                                </th>
                            ))}
                            <th className="text-center py-3 px-4 text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Total</th>
                            <th className="w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => {
                            const rowTotal = row.hours.reduce((a,b)=>a+b, 0);
                            return (
                                <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="p-3">
                                        <ServerSearchDropdown
                                            endpoint="/projects/search"
                                            placeholder="Select Project"
                                            value={row.project}
                                            entityType="projects"
                                            onChange={(v) => {
                                                updateRow(row.id, 'project', v);
                                                updateRow(row.id, 'task', null);
                                            }}
                                            labelField="name"
                                            className="w-full !rounded-xl"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <ServerSearchDropdown
                                            endpoint="/search/workitems"
                                            placeholder="Select Task/Issue"
                                            value={row.task}
                                            entityType="tasks"
                                            disabled={!row.project}
                                            project_id={extractId(row.project)}
                                            onChange={(v) => updateRow(row.id, 'task', v)}
                                            labelField="title"
                                            className="w-full !rounded-xl"
                                        />
                                    </td>
                                    {row.hours.map((val, dIdx) => (
                                        <td key={dIdx} className="p-2 align-middle">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                max="24"
                                                value={val || ''}
                                                onChange={(e) => updateHours(row.id, dIdx, e.target.value)}
                                                className="w-[70px] text-center mx-auto !rounded-xl !h-10 text-sm font-mono"
                                                placeholder="0:00"
                                            />
                                        </td>
                                    ))}
                                    <td className="p-3 text-center align-middle font-bold text-slate-700 dark:text-slate-200">
                                        {rowTotal.toFixed(2)}h
                                    </td>
                                    <td className="p-3 text-center align-middle">
                                        <Button
                                            icon={<Trash2 size={16} />}
                                            className="p-button-rounded p-button-text p-button-danger !w-8 !h-8"
                                            onClick={() => removeRow(row.id)}
                                            disabled={rows.length === 1}
                                        />
                                    </td>
                                </tr>
                            )
                        })}

                        {}
                        <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <td colSpan={2} className="p-4 text-right font-bold text-slate-700 dark:text-slate-200">
                                Daily Totals:
                            </td>
                            {totalCols.map((t, i) => (
                                <td key={i} className="p-3 text-center align-middle font-bold text-teal-600 dark:text-teal-400">
                                    {t.toFixed(2)}
                                </td>
                            ))}
                            <td className="p-3 text-center align-middle font-black text-indigo-600 dark:text-indigo-400 text-lg">
                                {grandTotal.toFixed(2)}
                            </td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
                <Button outlined onClick={addRow} className="!px-4">
                    <Plus className="w-4 h-4 mr-1.5" /> Add Row
                </Button>
            </div>
        </div>
      </div>
    </PageLayout>
  );
}

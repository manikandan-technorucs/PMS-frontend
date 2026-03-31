import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from 'primereact/button';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { PageSpinner } from '@/components/ui/Loader/PageSpinner';
import { ArrowLeft, Edit, Clock, CheckCircle, Hash, Calendar, FolderKanban } from 'lucide-react';
import { tasksService, Task } from '@/features/tasks/services/tasks.api';
import { timelogsService, TimeLog } from '@/features/timelogs/services/timelogs.api';

export function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [actualHours, setActualHours] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const parsedId = parseInt(taskId as string, 10);
      const [data, logs] = await Promise.all([
        tasksService.getTask(parsedId),
        timelogsService.getTimelogs(0, 2000)
      ]);
      setTask(data);

      const taskLogs = logs.filter(l => l.task_id === parsedId);
      setActualHours(taskLogs.reduce((sum, l) => sum + l.hours, 0));
    } catch (error) {
      console.error('Failed to fetch task detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageSpinner fullPage label="Loading task" />;
  if (!task) return <PageSpinner fullPage label="Task not found" />;

  return (
    <PageLayout
      title={task.title}
      actions={
        <>
          <Button outlined onClick={() => navigate('/tasks')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </Button>
          <Button onClick={() => navigate(`/tasks/${taskId}/edit`)} className="btn-gradient">
            <Edit className="w-4 h-4 mr-2" />
            Edit Task
          </Button>
        </>
      }
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-10">
        {/* Super-Premium Hero Header */}
        <div className="relative overflow-hidden rounded-3xl border border-teal-500/20 shadow-xl px-8 py-6"
             style={{ background: 'var(--brand-gradient)', boxShadow: '0 10px 30px -5px rgba(12, 209, 195, 0.25)' }}>
          <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #ffffff 0%, transparent 50%)' }} />
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center flex-shrink-0 border border-white/50 backdrop-blur-md shadow-sm">
                <CheckCircle className="w-7 h-7 text-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-[24px] md:text-[28px] leading-none tracking-tight font-black text-slate-900">{task.title}</h1>
                </div>
                <div className="flex flex-wrap items-center mt-3 gap-3 text-[13px] font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full"><Hash className="w-4 h-4 opacity-70" /> {task.public_id}</span>
                  <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full"><FolderKanban className="w-4 h-4 opacity-70" /> {task.project?.name || 'Unassigned'}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 opacity-70" /> Due: {task.due_date || 'No Deadline'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right flex flex-col items-end">
                <p className="text-[12px] font-black text-slate-800 mb-2 uppercase tracking-widest">Progress</p>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2.5 rounded-full bg-slate-900/10 overflow-hidden backdrop-blur-sm shadow-inner border border-slate-900/5">
                    <div className="h-full bg-slate-900 rounded-full" style={{ width: `${task.progress || 0}%` }} />
                  </div>
                  <span className="text-[16px] font-black text-slate-900 tabular-nums tracking-tighter">{task.progress || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* Description Card */}
            <div className="card-base p-6">
              <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-3">About Task</h3>
              <p className="text-[14px] leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {task.description || <span className="italic text-slate-400">No description provided for this task.</span>}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-base p-6">
              <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-3">Information</h3>
              
              <div className="space-y-5">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Assignee</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white font-black text-[12px] shadow-sm">
                      {task.assignee ? task.assignee.first_name[0] : '?'}
                    </div>
                    <div>
                      <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                        {task.assignee ? `${task.assignee.first_name} ${task.assignee.last_name}` : 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</p>
                  <StatusBadge status={task.status?.name || 'Unknown'} variant="status" />
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Priority</p>
                  <StatusBadge status={task.priority?.name || 'Unknown'} variant="priority" />
                </div>

                <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex items-center gap-3 bg-teal-50/50 dark:bg-teal-900/10 p-4 rounded-xl border border-teal-100 dark:border-teal-900/30">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-teal-600 shadow-sm">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Time Logged</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[20px] font-black text-slate-800 dark:text-white leading-none">{actualHours.toFixed(1)}h</span>
                        <span className="text-[12px] font-bold text-slate-400">/ {task.estimated_hours || 0}h</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

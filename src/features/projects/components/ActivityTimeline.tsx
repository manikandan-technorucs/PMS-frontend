import React, { useEffect, useState } from 'react';
import { Timeline } from 'primereact/timeline';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';
import { format } from 'date-fns';
import { api } from '@/api/axiosInstance';

interface AuditDetail {
  id: number;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
}

interface AuditLog {
  id: number;
  user_id: string; // Actor's OID
  action_type: string;
  resource_name: string;
  resource_id: number;
  record_id: number;
  created_at: string;
  details: AuditDetail[];
}

interface ActivityTimelineProps {
  projectId: number;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ projectId }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await api.get(`/projects/${projectId}/audit`);
        setLogs(response.data);
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditLogs();
  }, [projectId]);

  const getIconForAction = (action_type: string) => {
    switch (action_type.toUpperCase()) {
      case 'CREATE': return 'pi pi-plus-circle text-green-500';
      case 'UPDATE': return 'pi pi-pencil text-blue-500';
      case 'DELETE': return 'pi pi-trash text-red-500';
      case 'ASSIGN': return 'pi pi-user-plus text-purple-500';
      default: return 'pi pi-info-circle text-slate-500';
    }
  };

  const getActionColor = (action_type: string) => {
    switch (action_type.toUpperCase()) {
      case 'CREATE': return 'bg-green-100 dark:bg-green-900/30';
      case 'UPDATE': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'DELETE': return 'bg-red-100 dark:bg-red-900/30';
      case 'ASSIGN': return 'bg-purple-100 dark:bg-purple-900/30';
      default: return 'bg-slate-100 dark:bg-slate-800';
    }
  };

  const customizedMarker = (item: AuditLog) => {
    return (
      <span className={`flex w-8 h-8 items-center justify-center rounded-full z-10 shadow-sm ${getActionColor(item.action_type)}`}>
        <i className={`${getIconForAction(item.action_type)} text-lg`}></i>
      </span>
    );
  };

  const customizedContent = (item: AuditLog) => {
    const dateStr = format(new Date(item.created_at), 'MMM dd, yyyy HH:mm');
    
    return (
      <Card className="shadow-sm mb-4 border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
         <div className="flex justify-between items-center mb-2">
            <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              <span className="uppercase text-xs font-bold mr-2 opacity-70">{item.action_type}</span>
              {item.resource_name} (ID: {item.record_id})
            </div>
            <div className="text-xs text-slate-500">{dateStr}</div>
         </div>
         
         <div className="text-xs text-slate-500 mb-2">Actor ID: <span className="font-mono">{item.user_id}</span></div>

         {item.details && item.details.length > 0 && (
           <div className="mt-3 bg-slate-50 dark:bg-slate-800 rounded p-2 overflow-x-auto">
             <table className="w-full text-left text-xs">
               <thead>
                 <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-700">
                   <th className="pb-1">Field</th>
                   <th className="pb-1">Old Value</th>
                   <th className="pb-1">New Value</th>
                 </tr>
               </thead>
               <tbody>
                 {item.details.map(detail => (
                   <tr key={detail.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                     <td className="py-1 font-medium text-slate-600 dark:text-slate-300">{detail.field_name}</td>
                     <td className="py-1 text-slate-500 dark:text-slate-400 line-through decoration-red-400/50">{detail.old_value ?? <span className="italic text-slate-400">null</span>}</td>
                     <td className="py-1 text-green-600 dark:text-green-400 font-medium">{detail.new_value ?? <span className="italic text-slate-400">null</span>}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="flex gap-4">
            <Skeleton shape="circle" size="2rem" />
            <Skeleton width="100%" height="5rem" />
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        No activity found for this project.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Activity Timeline</h3>
      <Timeline 
        value={logs} 
        marker={customizedMarker} 
        content={customizedContent} 
        className="text-sm"
      />
    </div>
  );
};

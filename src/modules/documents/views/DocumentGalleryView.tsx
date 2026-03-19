import React from 'react';
import { useEntity } from '@/shared/hooks/useEntity';
import { Image } from 'primereact/image';

/**
 * DocumentGalleryView — Grid-based aggregated view of all polymorphic documents.
 */
export function DocumentGalleryView() {
  const { data: documents, loading } = useEntity('documents');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document Gallery</h1>
          <p className="text-slate-500 text-sm">Aggregated view of all project and issue attachments.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center text-slate-400">Loading Gallery...</div>
      ) : documents.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900 p-20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
           <i className="pi pi-images text-4xl text-slate-300 mb-4 block" />
           <p className="text-slate-500">No documents found in the system yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {documents.map((doc: any) => (
            <div key={doc.id} className="group relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
               <Image 
                 src={doc.file_url} 
                 alt={doc.title} 
                 preview 
                 className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110" 
               />
               <div className="absolute bottom-0 w-full bg-slate-900/80 p-2 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform">
                 <p className="text-white text-[10px] font-bold truncate">{doc.title || 'Untitled Attachment'}</p>
                 <p className="text-teal-400 text-[8px] uppercase font-bold">
                   Ref: {doc.project_id ? 'Project' : 'Issue'}
                 </p>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

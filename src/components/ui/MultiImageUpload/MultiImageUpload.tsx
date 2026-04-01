import React, { useState, useCallback } from 'react';
import { useToast } from '@/providers/ToastContext';
import { Button } from 'primereact/button';

interface MultiImageUploadProps {
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  onFilesChange: (files: File[]) => void;
}

export function MultiImageUpload({ maxFiles = 5, maxFileSize = 2000000, onFilesChange }: MultiImageUploadProps) {
  const { showToast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(f => f.size <= maxFileSize).slice(0, maxFiles - selectedFiles.length);
    
    if (validFiles.length < files.length) {
      showToast('error', 'Notification', `Some files were too large or exceeded the limit of ${maxFiles}.`);
    }

    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    onFilesChange(newFiles);
    
    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onFilesChange(newFiles);
    
    URL.revokeObjectURL(previews[index]);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {previews.map((preview, index) => (
          <div key={index} className="relative aspect-square group rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <img src={preview} alt={`upload-${index}`} className="w-full h-full object-cover" />
            <Button unstyled 
              onClick={() => removeFile(index)}
              className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <i className="pi pi-times text-[10px]" />
            </Button>
          </div>
        ))}
        {selectedFiles.length < maxFiles && (
          <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all rounded-xl cursor-pointer">
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full mb-2">
              <i className="pi pi-plus text-slate-400" />
            </div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Add Evidence</span>
            <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
          </label>
        )}
      </div>
      <p className="text-[10px] text-slate-500 italic">Max {maxFiles} files, up to {maxFileSize / 1000000}MB per image.</p>
    </div>
  );
}

"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FileUploadProps {
  title: string;
  accept: string;
  multiple: boolean;
  onFilesChange: (files: File[] | File) => void;
}

export default function FileUpload({
  title,
  accept,
  multiple,
  onFilesChange,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter((file) =>
        file.type === "application/pdf"
      );
      
      if (validFiles.length === 0) {
        alert("Please upload PDF files only.");
        return;
      }

      const newFiles = multiple ? [...files, ...validFiles] : [validFiles[0]];
      setFiles(newFiles);
      onFilesChange(multiple ? newFiles : newFiles[0]);
    },
    [files, multiple, onFilesChange]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      const newFiles = multiple ? [...files, ...selectedFiles] : [selectedFiles[0]];
      setFiles(newFiles);
      onFilesChange(multiple ? newFiles : newFiles[0]);
    },
    [files, multiple, onFilesChange]
  );

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(multiple ? newFiles : (newFiles[0] || null));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        {title}
      </h3>
      
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          "border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400"
        )}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Drag & drop PDF files here, or click to select
        </p>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          id={`file-input-${title}`}
        />
        <label
          htmlFor={`file-input-${title}`}
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
        >
          Select Files
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-500" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {file.name}
                </span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-slate-500 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

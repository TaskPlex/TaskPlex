import React, { useCallback } from 'react';
import { Upload, FileText, FileVideo, FileImage, File, Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type FileType = 'video' | 'image' | 'pdf' | 'document' | 'audio' | 'any';

interface FileDropzoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept: string;
  fileType?: FileType;
  labelKey?: string;
  dropLabelKey?: string;
  color?: 'purple' | 'blue' | 'red' | 'green' | 'pink';
  className?: string;
  disabled?: boolean;
}

const iconMap = {
  video: FileVideo,
  image: FileImage,
  pdf: FileText,
  audio: Music,
  any: File,
  document: FileText,
};

const colorClasses = {
  purple: 'text-purple-600 dark:text-purple-400',
  blue: 'text-blue-600 dark:text-blue-400',
  red: 'text-red-600 dark:text-red-400',
  green: 'text-green-600 dark:text-green-400',
  pink: 'text-pink-600 dark:text-pink-400',
};

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  file,
  onFileChange,
  accept,
  fileType = 'any',
  labelKey,
  dropLabelKey,
  color = 'purple',
  className = '',
  disabled = false,
}) => {
  const { t } = useTranslation();
  const FileIcon = iconMap[fileType];

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      if (e.target.files && e.target.files[0]) {
        onFileChange(e.target.files[0]);
      }
    },
    [onFileChange, disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileChange(e.dataTransfer.files[0]);
      }
    },
    [onFileChange, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
      {labelKey && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t(labelKey)}
        </label>
      )}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center transition-colors relative ${
          disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
        }`}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className={`absolute inset-0 w-full h-full opacity-0 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        />
        {file ? (
          <div className={`flex items-center justify-center gap-2 ${colorClasses[color]}`}>
            <FileIcon className="w-6 h-6" />
            <span className="font-medium truncate max-w-xs">{file.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
            <p>{dropLabelKey ? t(dropLabelKey) : t('common.upload')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useCallback, useMemo } from 'react';
import { ImageIcon, ArrowRight, ImageMinus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';
import { useCreateIcon } from '../hooks/useImage';
import {
  FileDropzone,
  ProcessButton,
  ErrorAlert,
  ResultCard,
} from '../components/ui';

const ICON_SIZES = [16, 32, 48, 64, 128, 256, 512];

export const ImageToIconScreen: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [size, setSize] = useState<number>(256);

  const createIconMutation = useCreateIcon();   

  const loading = createIconMutation.isPending;
  const result = createIconMutation.data;
  const error = createIconMutation.error;

  const handleFileChange = useCallback((newFile: File | null) => {
    setFile(newFile);
    if (newFile) {
      setPreviewUrl(URL.createObjectURL(newFile));
    } else {
      setPreviewUrl(null);
    }
    createIconMutation.reset();
  }, [createIconMutation]);

  const handleSubmit = useCallback(() => {
    if (!file) return;
    createIconMutation.mutate({ file, size });
  }, [file, size, createIconMutation]);

  const errorMessage = useMemo(() => {
    if (error instanceof Error) return error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [error, result]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <ImageIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        {t('imageToIcon.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CONTROLS (Left) */}
        <div className="lg:col-span-4 space-y-6">
          <FileDropzone
            file={file}
            onFileChange={handleFileChange}
            accept="image/*"
            fileType="image"
            labelKey="imageToIcon.imageFile"
            dropLabelKey="imageToIcon.dragDrop"
            color="blue"
          />

          <div className="space-y-2">
            <label htmlFor="size" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('imageToIcon.size')}
            </label>
            <select
              id="size"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              {ICON_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}x{s} px
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('imageToIcon.sizeHint')}
            </p>
          </div>

          <ProcessButton
            onClick={handleSubmit}
            disabled={!file}
            loading={loading}
            labelKey="imageToIcon.createIcon"
            loadingLabelKey="imageToIcon.processing"
            color="blue"
          />

          <ErrorAlert message={errorMessage} />
        </div>

        {/* PREVIEW AREA (Right) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Image */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('imageToIcon.original')}
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden aspect-square flex items-center justify-center relative">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt={t('imageToIcon.original')} 
                    className="max-w-full max-h-full object-contain" 
                  />
                ) : (
                  <ImageMinus className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                )}
                {file && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                )}
              </div>
            </div>

            {/* Icon Preview */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
                {t('imageToIcon.result')}
                {result && result.success && (
                  <span className="text-green-600 dark:text-green-400 font-bold">{t('common.success')}!</span>
                )}
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden aspect-square flex items-center justify-center relative">
                {result?.download_url ? (
                  <img 
                    src={ApiService.getDownloadUrl(result.download_url)} 
                    alt="Icon" 
                    className="max-w-full max-h-full object-contain" 
                  />
                ) : loading ? (
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mb-2" />
                    <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
                  </div>
                ) : (
                  <div className="text-gray-300 dark:text-gray-600 flex flex-col items-center">
                    <ArrowRight className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm">{t('imageToIcon.preview')}</span>
                  </div>
                )}
                {result?.processed_size && (
                  <div className="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded font-bold shadow-sm">
                    {(result.processed_size / 1024).toFixed(1)} KB
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results & Download */}
          {result && result.success && (
            <ResultCard
              success={result.success}
              message={result.message}
              downloadUrl={result.download_url}
              filename={result.filename}
              downloadLabelKey="imageToIcon.downloadResult"
              color="green"
            />
          )}
        </div>
      </div>
    </div>
  );
};


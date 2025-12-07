import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import { ApiService } from '../services/api';
import { useFilterImage } from '../hooks/useImage';
import {
  FileDropzone,
  ProcessButton,
  ErrorAlert,
  ResultCard,
} from '../components/ui';

const FILTER_OPTIONS = [
  { value: 'grayscale', labelKey: 'filterImage.filters.grayscale' },
  { value: 'sepia', labelKey: 'filterImage.filters.sepia' },
  { value: 'blur', labelKey: 'filterImage.filters.blur' },
  { value: 'sharpen', labelKey: 'filterImage.filters.sharpen' },
  { value: 'invert', labelKey: 'filterImage.filters.invert' },
];

export const FilterImageScreen: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('grayscale');

  const filterMutation = useFilterImage();
  const result = filterMutation.data;
  const loading = filterMutation.isPending;
  const error = filterMutation.error;

  const handleFileChange = useCallback(
    (newFile: File | null) => {
      setFile(newFile);
      if (newFile) {
        setPreviewUrl(URL.createObjectURL(newFile));
      } else {
        setPreviewUrl(null);
      }
      filterMutation.reset();
    },
    [filterMutation]
  );

  const handleSubmit = useCallback(() => {
    if (!file) return;
    filterMutation.mutate({ file, filter });
  }, [file, filter, filterMutation]);

  const errorMessage = useMemo(() => {
    if (error instanceof Error) return error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [error, result]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('filterImage.title')}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('filterImage.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <FileDropzone
            file={file}
            onFileChange={handleFileChange}
            accept="image/*"
            fileType="image"
            labelKey="filterImage.imageFile"
            dropLabelKey="filterImage.dragDrop"
            color="purple"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('filterImage.selectFilter')}
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-purple-500"
            >
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <ProcessButton
            onClick={handleSubmit}
            disabled={!file}
            loading={loading}
            labelKey="filterImage.applyFilter"
            loadingLabelKey="filterImage.processing"
            color="purple"
          />
          <ErrorAlert message={errorMessage ?? undefined} />
        </div>

        {/* Preview / Results */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('filterImage.original')}
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden aspect-square flex items-center justify-center relative">
                {previewUrl ? (
                  <img src={previewUrl} alt={t('filterImage.original')} className="max-w-full max-h-full object-contain" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                )}
                {file && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('filterImage.result')}
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden aspect-square flex items-center justify-center relative">
                {result?.download_url ? (
                  <img
                    src={ApiService.getDownloadUrl(result.download_url)}
                    alt="Filtered"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : loading ? (
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mb-2" />
                    <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
                  </div>
                ) : (
                  <div className="text-gray-300 dark:text-gray-600 flex flex-col items-center">
                    <Sparkles className="w-8 h-8 mb-2 opacity-60" />
                    <span className="text-sm">{t('filterImage.preview')}</span>
                  </div>
                )}
                {result?.processed_size && (
                  <div className="absolute bottom-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded font-bold shadow-sm">
                    {(result.processed_size / 1024).toFixed(1)} KB
                  </div>
                )}
              </div>
            </div>
          </div>

          {result && result.success && (
            <ResultCard
              success={result.success}
              message={result.message}
              downloadUrl={result.download_url}
              filename={result.filename}
              downloadLabelKey="filterImage.downloadResult"
              color="purple"
            />
          )}
        </div>
      </div>
    </div>
  );
};



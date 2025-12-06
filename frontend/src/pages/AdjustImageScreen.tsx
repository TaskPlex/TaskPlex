import React, { useState, useCallback, useMemo } from 'react';
import { SlidersHorizontal, ArrowRight, ImageMinus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';
import { useAdjustImage } from '../hooks/useImage';
import {
  FileDropzone,
  ProcessButton,
  ErrorAlert,
  ResultCard,
} from '../components/ui';

const toNumber = (val: string, fallback: number) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
};

export const AdjustImageScreen: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [brightness, setBrightness] = useState<number>(1);
  const [contrast, setContrast] = useState<number>(1);
  const [saturation, setSaturation] = useState<number>(1);

  const adjustMutation = useAdjustImage();

  const loading = adjustMutation.isPending;
  const result = adjustMutation.data;
  const error = adjustMutation.error;

  const handleFileChange = useCallback(
    (newFile: File | null) => {
      setFile(newFile);
      if (newFile) {
        setPreviewUrl(URL.createObjectURL(newFile));
      } else {
        setPreviewUrl(null);
      }
      adjustMutation.reset();
    },
    [adjustMutation]
  );

  const handleSubmit = useCallback(() => {
    if (!file) return;
    adjustMutation.mutate({ file, brightness, contrast, saturation });
  }, [file, brightness, contrast, saturation, adjustMutation]);

  const errorMessage = useMemo(() => {
    if (error instanceof Error) return error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [error, result]);

  const sliderProps = {
    min: 0.1,
    max: 3,
    step: 0.1,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <SlidersHorizontal className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        {t('adjustImage.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CONTROLS (Left) */}
        <div className="lg:col-span-4 space-y-6">
          <FileDropzone
            file={file}
            onFileChange={handleFileChange}
            accept="image/*"
            fileType="image"
            labelKey="adjustImage.imageFile"
            dropLabelKey="adjustImage.dragDrop"
            color="blue"
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="brightness" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('adjustImage.brightness')}
              </label>
              <input
                id="brightness"
                type="range"
                {...sliderProps}
                value={brightness}
                onChange={(e) => setBrightness(toNumber(e.target.value, 1))}
                className="w-full"
              />
              <div className="text-sm text-gray-500 dark:text-gray-400">{brightness.toFixed(2)}</div>
            </div>

            <div className="space-y-2">
              <label htmlFor="contrast" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('adjustImage.contrast')}
              </label>
              <input
                id="contrast"
                type="range"
                {...sliderProps}
                value={contrast}
                onChange={(e) => setContrast(toNumber(e.target.value, 1))}
                className="w-full"
              />
              <div className="text-sm text-gray-500 dark:text-gray-400">{contrast.toFixed(2)}</div>
            </div>

            <div className="space-y-2">
              <label htmlFor="saturation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('adjustImage.saturation')}
              </label>
              <input
                id="saturation"
                type="range"
                {...sliderProps}
                value={saturation}
                onChange={(e) => setSaturation(toNumber(e.target.value, 1))}
                className="w-full"
              />
              <div className="text-sm text-gray-500 dark:text-gray-400">{saturation.toFixed(2)}</div>
            </div>
          </div>

          <ProcessButton
            onClick={handleSubmit}
            disabled={!file}
            loading={loading}
            labelKey="adjustImage.adjustButton"
            loadingLabelKey="adjustImage.processing"
            color="blue"
          />

          <ErrorAlert message={errorMessage} />
        </div>

        {/* PREVIEW + RESULTS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('adjustImage.original')}
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden aspect-square flex items-center justify-center relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={t('adjustImage.original')}
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

            {/* Adjusted */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
                {t('adjustImage.result')}
                {result && result.success && (
                  <span className="text-green-600 dark:text-green-400 font-bold">{t('common.success')}!</span>
                )}
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden aspect-square flex items-center justify-center relative">
                {result?.download_url ? (
                  <img
                    src={ApiService.getDownloadUrl(result.download_url)}
                    alt="Adjusted"
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
                    <span className="text-sm">{t('adjustImage.preview')}</span>
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

          {result && result.success && (
            <ResultCard
              success={result.success}
              message={result.message}
              downloadUrl={result.download_url}
              filename={result.filename}
              downloadLabelKey="adjustImage.downloadResult"
              color="green"
            />
          )}
        </div>
      </div>
    </div>
  );
};



import React, { useState, useCallback, useMemo } from 'react';
import { RotateCw, ArrowRight, ImageMinus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';
import { useRotateImage } from '../hooks/useImage';
import {
  FileDropzone,
  ProcessButton,
  ErrorAlert,
  ResultCard,
} from '../components/ui';

const ROTATION_ANGLES = [90, 180, 270];

export const RotateImageScreen: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [angle, setAngle] = useState<number>(90);

  const rotateMutation = useRotateImage();

  const loading = rotateMutation.isPending;
  const result = rotateMutation.data;
  const error = rotateMutation.error;

  const handleFileChange = useCallback((newFile: File | null) => {
    setFile(newFile);
    if (newFile) {
      setPreviewUrl(URL.createObjectURL(newFile));
    } else {
      setPreviewUrl(null);
    }
    rotateMutation.reset();
  }, [rotateMutation]);

  const handleSubmit = useCallback(() => {
    if (!file) return;
    rotateMutation.mutate({ file, angle });
  }, [file, angle, rotateMutation]);

  const errorMessage = useMemo(() => {
    if (error instanceof Error) return error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [error, result]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <RotateCw className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        {t('rotateImage.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CONTROLS (Left) */}
        <div className="lg:col-span-4 space-y-6">
          <FileDropzone
            file={file}
            onFileChange={handleFileChange}
            accept="image/*"
            fileType="image"
            labelKey="rotateImage.imageFile"
            dropLabelKey="rotateImage.dragDrop"
            color="blue"
          />

          <div className="space-y-2">
            <label htmlFor="angle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('rotateImage.angle')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROTATION_ANGLES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAngle(a)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    angle === a
                      ? 'bg-blue-600 text-white dark:bg-blue-500'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {a}°
                </button>
              ))}
            </div>
          </div>

          <ProcessButton
            onClick={handleSubmit}
            disabled={!file}
            loading={loading}
            labelKey="rotateImage.rotateImage"
            loadingLabelKey="rotateImage.processing"
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
                {t('rotateImage.original')}
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden aspect-square flex items-center justify-center relative">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt={t('rotateImage.original')} 
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

            {/* Rotated Image */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
                {t('rotateImage.result')}
                {result && result.success && (
                  <span className="text-green-600 dark:text-green-400 font-bold">{t('common.success')}!</span>
                )}
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden aspect-square flex items-center justify-center relative">
                {result?.download_url ? (
                  <img 
                    src={ApiService.getDownloadUrl(result.download_url)} 
                    alt="Rotated" 
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
                    <span className="text-sm">{t('rotateImage.preview')}</span>
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
              downloadLabelKey="rotateImage.downloadResult"
              color="green"
            />
          )}
        </div>
      </div>
    </div>
  );
};


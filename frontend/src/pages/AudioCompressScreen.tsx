import React, { useState, useCallback, useMemo } from 'react';
import { Music, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCompressAudio } from '../hooks/useAudio';
import { FileDropzone, ProcessButton, ErrorAlert, ResultCard, QualitySelector } from '../components/ui';
import type { QualityLevel } from '../components/ui';

const AUDIO_BITRATES = ['64k', '96k', '128k', '160k', '192k'];

export const AudioCompressScreen: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<QualityLevel>('medium');
  const [bitrate, setBitrate] = useState<string>('128k');
  const [localError, setLocalError] = useState<string | null>(null);

  const { mutate, data, isPending, isSuccess, isError, error, reset } = useCompressAudio();

  const handleFileChange = useCallback((newFile: File | null) => {
    setFile(newFile);
    setLocalError(null);
    reset();
  }, [reset]);

  const handleSubmit = useCallback(() => {
    if (!file) {
      setLocalError(t('audioCompress.validation.fileRequired'));
      return;
    }
    setLocalError(null);
    mutate({ file, quality, targetBitrate: bitrate });
  }, [file, quality, bitrate, mutate, t]);

  const errorMessage = useMemo(() => {
    if (localError) return localError;
    if (isError && error instanceof Error) return error.message;
    if (data && !data.success) return data.message;
    return null;
  }, [localError, isError, error, data]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Music className="w-8 h-8 text-pink-600 dark:text-pink-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('audioCompress.title')}</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{t('audioCompress.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <FileDropzone
            file={file}
            onFileChange={handleFileChange}
            accept="audio/*"
            fileType="audio"
            labelKey="audioCompress.audioFile"
            dropLabelKey="audioCompress.dragDrop"
            color="pink"
            disabled={isPending}
          />

          <QualitySelector
            value={quality}
            onChange={setQuality}
            labelKey="audioCompress.quality"
            disabled={isPending}
            color="pink"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('audioCompress.bitrate')}
            </label>
            <select
              value={bitrate}
              onChange={(e) => setBitrate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={isPending}
            >
              {AUDIO_BITRATES.map((br) => (
                <option key={br} value={br}>{br}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('audioCompress.bitrateHint')}</p>
          </div>

          <ProcessButton
            onClick={handleSubmit}
            disabled={!file || isPending}
            loading={isPending}
            labelKey="audioCompress.compress"
            loadingLabelKey="audioCompress.compressing"
            color="pink"
          />

          <ErrorAlert message={errorMessage || undefined} />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('audioCompress.result')}</h2>

          {isPending && (
            <div className="h-56 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-xl flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-pink-500 dark:text-pink-400 animate-spin" />
              <p className="text-pink-700 dark:text-pink-300 font-medium">{t('audioCompress.compressing')}</p>
            </div>
          )}

          {isSuccess && data?.success && (
            <ResultCard
              success={data.success}
              message={data.message}
              downloadUrl={data.download_url}
              downloadLabelKey="audioCompress.downloadResult"
              color="green"
              originalSize={data.original_size}
              processedSize={data.processed_size}
              compressionRatio={data.compression_ratio}
            />
          )}

          {!isPending && (!data || !data.success) && (
            <div className="h-56 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <Music className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">{t('audioCompress.previewPlaceholder')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


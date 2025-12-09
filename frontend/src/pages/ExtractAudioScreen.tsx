import React, { useState } from 'react';
import { Music, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useExtractAudio } from '../hooks/useVideo';
import { FileDropzone, ProcessButton, ErrorAlert, ResultCard, FormatSelector } from '../components/ui';

const AUDIO_FORMATS = ['mp3', 'wav', 'flac', 'ogg'];
const AUDIO_BITRATES = ['128k', '160k', '192k', '256k', '320k'];

export const ExtractAudioScreen: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<string>('mp3');
  const [bitrate, setBitrate] = useState<string>('192k');
  const [localError, setLocalError] = useState<string | null>(null);

  const { mutate, data, isPending, isSuccess, isError, error, reset } = useExtractAudio();

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
    setLocalError(null);
    reset();
  };

  const handleSubmit = () => {
    if (!file) {
      setLocalError(t('videoExtractAudio.validation.fileRequired'));
      return;
    }
    setLocalError(null);
    mutate({ file, options: { output_format: format, bitrate } });
  };

  const errorMessage = localError || (isError ? error?.message : undefined) || (!data?.success && data?.message);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Music className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('videoExtractAudio.title')}</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{t('videoExtractAudio.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <FileDropzone
            file={file}
            onFileChange={handleFileChange}
            accept="video/*"
            fileType="video"
            labelKey="videoExtractAudio.videoFile"
            dropLabelKey="videoExtractAudio.dragDrop"
            color="purple"
            disabled={isPending}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormatSelector
              formats={AUDIO_FORMATS}
              value={format}
              onChange={setFormat}
              labelKey="videoExtractAudio.outputFormat"
              disabled={isPending}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('videoExtractAudio.bitrate')}
              </label>
              <select
                value={bitrate}
                onChange={(e) => setBitrate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isPending}
              >
                {AUDIO_BITRATES.map((br) => (
                  <option key={br} value={br}>{br}</option>
                ))}
              </select>
            </div>
          </div>

          <ProcessButton
            onClick={handleSubmit}
            disabled={isPending}
            loading={isPending}
            labelKey="videoExtractAudio.extract"
            loadingLabelKey="videoExtractAudio.processing"
            color="purple"
          />

          <ErrorAlert message={errorMessage || undefined} />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('videoExtractAudio.result')}</h2>

          {isPending && (
            <div className="h-56 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-purple-500 dark:text-purple-400 animate-spin" />
              <p className="text-purple-700 dark:text-purple-300 font-medium">{t('videoExtractAudio.processing')}</p>
            </div>
          )}

          {isSuccess && data?.success && (
            <ResultCard
              success={data.success}
              message={data.message}
              downloadUrl={data.download_url}
              downloadLabelKey="video.downloadResult"
              color="green"
            />
          )}

          {!isPending && (!data || !data.success) && (
            <div className="h-56 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <Music className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">{t('videoExtractAudio.previewPlaceholder')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


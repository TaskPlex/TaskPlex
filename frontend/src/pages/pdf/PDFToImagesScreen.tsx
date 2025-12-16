import React, { useState, useCallback } from 'react';
import { Image as ImageIcon, Upload, Download, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../../services/api';
import { usePDFToImages } from '../../hooks/usePDF';
import { useDownload } from '../../hooks/useDownload';

const IMAGE_FORMATS = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
];

const DPI_OPTIONS = [72, 150, 200, 300];

export const PDFToImagesScreen: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [imageFormat, setImageFormat] = useState<string>('png');
  const [dpi, setDpi] = useState<number>(150);
  
  const { mutate, isPending: loading, data: result, error, reset } = usePDFToImages();
  const { downloadDirect } = useDownload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      reset();
    }
  };

  const handleConvert = () => {
    if (!file) return;
    mutate({ file, imageFormat, dpi });
  };

  const errorMessage = error instanceof Error ? error.message : (result && !result.success ? result.message : null);

  const handleDownload = useCallback(() => {
    if (result?.download_url) {
      const url = ApiService.getDownloadUrl(result.download_url);
      const filename = result.download_url.split('/').pop() || 'pdf_images.zip';
      downloadDirect(url, filename);
    }
  }, [result, downloadDirect]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <ImageIcon className="text-red-600 dark:text-red-400" size={32} />
          {t('pdf.toImages.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('pdf.toImages.description')}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        {!file ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative group cursor-pointer">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <Upload className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('pdf.toImages.selectFile')}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t('pdf.toImages.dropFile')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{file.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                onClick={() => { setFile(null); reset(); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                {t('pdf.toImages.change')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('pdf.toImages.imageFormat')}
                </label>
                <select
                  value={imageFormat}
                  onChange={(e) => setImageFormat(e.target.value)}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-red-500"
                >
                  {IMAGE_FORMATS.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('pdf.toImages.dpi')}
                </label>
                <select
                  value={dpi}
                  onChange={(e) => setDpi(Number(e.target.value))}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-red-500"
                >
                  {DPI_OPTIONS.map((dpiOption) => (
                    <option key={dpiOption} value={dpiOption}>
                      {dpiOption} DPI
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800">
                {errorMessage}
              </div>
            )}

            {!result || !result.success ? (
              <button
                onClick={handleConvert}
                disabled={loading}
                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200 dark:hover:shadow-red-900/30 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? t('pdf.toImages.converting') : t('pdf.toImages.convertBtn')}
              </button>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-xl p-6 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">{t('common.success')}!</h3>
                {result.total_pages && (
                  <p className="text-red-700 dark:text-red-300 mb-6">
                    {t('pdf.toImages.converted', { count: result.total_pages })}
                  </p>
                )}
                
                {result.download_url && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    {t('pdf.toImages.downloadResult')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


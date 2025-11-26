import React, { useState, useCallback } from 'react';
import { Minimize2, Upload, Download, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../../services/api';
import { useCompressPDF } from '../../hooks/usePDF';
import { useDownload } from '../../hooks/useDownload';

export const PDFCompress: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  
  const { mutate, isPending: loading, data: result, error, reset } = useCompressPDF();
  const { downloadDirect } = useDownload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      reset();
    }
  };

  const handleCompress = () => {
    if (!file) return;
    mutate({ file });
  };

  const errorMessage = error instanceof Error ? error.message : (result && !result.success ? result.message : null);

  const handleDownload = useCallback(() => {
    if (result?.download_url) {
      const url = ApiService.getDownloadUrl(result.download_url);
      const filename = result.download_url.split('/').pop() || 'compressed.pdf';
      downloadDirect(url, filename);
    }
  }, [result, downloadDirect]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <Minimize2 className="text-green-600 dark:text-green-400" size={32} />
          {t('pdf.compress.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('pdf.compress.description')}</p>
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
            <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <Upload className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('pdf.compress.selectFile')}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t('pdf.compress.dropFile')}</p>
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
                {t('pdf.compress.change')}
              </button>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800">
                {errorMessage}
              </div>
            )}

            {!result || !result.success ? (
              <button
                onClick={handleCompress}
                disabled={loading}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200 dark:hover:shadow-green-900/30 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? t('pdf.compress.compressing') : t('pdf.compress.compressBtn')}
              </button>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 rounded-xl p-6 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-green-900 dark:text-green-200 mb-2">{t('common.success')}!</h3>
                {result.original_size && result.processed_size && (
                  <p className="text-green-700 dark:text-green-300 mb-6">
                    Your PDF is now <span className="font-bold">{Math.round((1 - result.processed_size / result.original_size) * 100)}%</span> smaller!
                    <br />
                    <span className="text-sm opacity-75">
                      {(result.original_size / 1024).toFixed(0)}KB → {(result.processed_size / 1024).toFixed(0)}KB
                    </span>
                  </p>
                )}
                {result.download_url && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    {t('pdf.compress.downloadResult')}
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

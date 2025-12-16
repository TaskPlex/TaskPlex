import React, { useState, useCallback } from 'react';
import { FileText, Upload, Download, Image as ImageIcon, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../../services/api';
import { useImagesToPDF } from '../../hooks/usePDF';
import { useDownload } from '../../hooks/useDownload';

const PAGE_SIZES = [
  { value: '', label: 'Auto (Image Size)' },
  { value: 'A4', label: 'A4' },
  { value: 'Letter', label: 'Letter' },
  { value: 'Legal', label: 'Legal' },
];

export const ImagesToPDFScreen: React.FC = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<string>('');
  const { mutate, isPending: loading, data: result, error, reset } = useImagesToPDF();
  const { downloadDirect } = useDownload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      reset();
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    reset();
  };

  const handleConvert = () => {
    if (files.length === 0) return;
    mutate({ files, pageSize: pageSize || undefined });
  };

  const errorMessage = error instanceof Error ? error.message : (result && !result.success ? result.message : null);

  const handleDownload = useCallback(() => {
    if (result?.download_url) {
      const url = ApiService.getDownloadUrl(result.download_url);
      const filename = result.download_url.split('/').pop() || 'images_to_pdf.pdf';
      downloadDirect(url, filename);
    }
  }, [result, downloadDirect]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <FileText className="text-red-600 dark:text-red-400" size={32} />
          {t('pdf.imagesToPdf.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('pdf.imagesToPdf.description')}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        {files.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative group cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              multiple
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <Upload className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('pdf.imagesToPdf.selectFiles')}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t('pdf.imagesToPdf.dropFiles')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="p-2 bg-white dark:bg-gray-600 rounded-lg border border-gray-100 dark:border-gray-500 shadow-sm">
                    <ImageIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button 
                    onClick={() => removeFile(index)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              
              <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <Plus size={20} />
                <span className="font-medium">{t('pdf.imagesToPdf.addMore')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('pdf.imagesToPdf.pageSize')}
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-red-500"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800">
                {errorMessage}
              </div>
            )}

            {!result || !result.success ? (
              <button
                onClick={handleConvert}
                disabled={loading || files.length === 0}
                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200 dark:hover:shadow-red-900/30 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? t('pdf.imagesToPdf.converting') : t('pdf.imagesToPdf.convertBtn')}
              </button>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-xl p-6 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">{t('common.success')}!</h3>
                {result.total_pages && (
                  <p className="text-red-700 dark:text-red-300 mb-6">
                    {t('pdf.imagesToPdf.converted', { count: result.total_pages })}
                  </p>
                )}
                
                {result.download_url && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    {t('pdf.imagesToPdf.downloadResult')}
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


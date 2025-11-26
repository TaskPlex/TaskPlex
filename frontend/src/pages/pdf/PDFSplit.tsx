import React, { useState, useCallback } from 'react';
import { Split, Upload, Download, FileText, Check, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../../services/api';
import { useSplitPDF } from '../../hooks/usePDF';
import { useDownload } from '../../hooks/useDownload';

export const PDFSplit: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'all' | 'range'>('all');
  const [range, setRange] = useState('');
  
  const { mutate, isPending: loading, data: result, error, reset } = useSplitPDF();
  const { downloadDirect } = useDownload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      reset();
    }
  };

  const handleSplit = () => {
    if (!file) return;
    mutate({
      file,
      pages: mode === 'range' ? undefined : undefined,
      pageRanges: mode === 'range' ? range : undefined
    });
  };

  const errorMessage = error instanceof Error ? error.message : (result && !result.success ? result.message : null);

  const handleDownload = useCallback((filename: string) => {
    const url = ApiService.getDownloadUrl(`/api/v1/download/${filename}`);
    downloadDirect(url, filename);
  }, [downloadDirect]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <Split className="text-blue-600 dark:text-blue-400" size={32} />
          {t('pdf.split.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('pdf.split.description')}</p>
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
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <Upload className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('pdf.split.selectFile')}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t('pdf.split.dropFile')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{file.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                onClick={() => { setFile(null); reset(); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                {t('pdf.split.change')}
              </button>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800">
                {errorMessage}
              </div>
            )}

            {!result || !result.success ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMode('all')}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      mode === 'all' 
                        ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-600 dark:ring-blue-400' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Split className={mode === 'all' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'} />
                      {mode === 'all' && <Check size={16} className="text-blue-600 dark:text-blue-400" />}
                    </div>
                    <h4 className={`font-bold ${mode === 'all' ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-white'}`}>{t('pdf.split.allPages')}</h4>
                    <p className={`text-sm ${mode === 'all' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>{t('pdf.split.allPagesDesc')}</p>
                  </button>

                  <button
                    onClick={() => setMode('range')}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      mode === 'range' 
                        ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-600 dark:ring-blue-400' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Settings2 className={mode === 'range' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'} />
                      {mode === 'range' && <Check size={16} className="text-blue-600 dark:text-blue-400" />}
                    </div>
                    <h4 className={`font-bold ${mode === 'range' ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-white'}`}>{t('pdf.split.pageRange')}</h4>
                    <p className={`text-sm ${mode === 'range' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>{t('pdf.split.pageRangeDesc')}</p>
                  </button>
                </div>

                {mode === 'range' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('pdf.split.pageRange')}</label>
                    <input
                      type="text"
                      value={range}
                      onChange={(e) => setRange(e.target.value)}
                      placeholder={t('pdf.split.rangePlaceholder')}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                )}

                <button
                  onClick={handleSplit}
                  disabled={loading || (mode === 'range' && !range)}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 dark:hover:shadow-blue-900/30 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? t('pdf.split.splitting') : t('pdf.split.splitBtn')}
                </button>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl p-6 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-2">{t('common.success')}!</h3>
                <p className="text-blue-700 dark:text-blue-300 mb-6">{t('pdf.split.downloadResult')}</p>
                
                <div className="grid gap-2 max-h-60 overflow-y-auto mb-4">
                  {result.filenames?.map((fname, i) => (
                    <button
                      key={i}
                      onClick={() => handleDownload(fname)}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-blue-100 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-sm text-gray-700 dark:text-gray-300 w-full text-left cursor-pointer"
                    >
                      <span className="truncate">{fname}</span>
                      <Download size={16} className="text-blue-600 dark:text-blue-400 ml-2 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

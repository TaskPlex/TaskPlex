import React, { useState, useCallback } from 'react';
import { FileCode, AlertTriangle, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useHTMLValidator } from '../hooks/useHTMLValidator';

export const HTMLValidatorScreen: React.FC = () => {
  const { t } = useTranslation();
  const [html, setHtml] = useState('');
  const { mutate, data, isPending, error, reset } = useHTMLValidator();

  const handleValidate = useCallback(() => {
    if (!html.trim()) return;
    mutate({ html });
  }, [html, mutate]);

  const handleReset = useCallback(() => {
    setHtml('');
    reset();
  }, [reset]);

  const errors = data?.errors ?? [];
  const isValid = data?.valid && errors.length === 0;
  const apiError = error instanceof Error ? error.message : null;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col items-center text-center gap-3 mb-8">
        <div className="flex items-center gap-3">
          <FileCode className="text-blue-600 dark:text-blue-400" size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('htmlValidator.title')}</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">{t('htmlValidator.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('htmlValidator.inputLabel')}
          </label>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder={t('htmlValidator.inputPlaceholder')}
            className="flex-1 w-full min-h-[320px] p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent font-mono text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('htmlValidator.inputHint')}</p>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleValidate}
              disabled={isPending || !html.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {isPending ? t('htmlValidator.validating') : t('htmlValidator.validateButton')}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={16} />
              {t('common.reset')}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col min-h-[320px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('htmlValidator.results')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('htmlValidator.resultsHint')}</p>
            </div>
            {data && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isValid
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}
              >
                {isValid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {isValid ? t('htmlValidator.valid') : t('htmlValidator.invalid')}
              </span>
            )}
          </div>

          {apiError && (
            <div className="mb-3 flex items-start gap-2 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              <AlertTriangle size={16} className="mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <div className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 overflow-auto">
            {!data && !apiError && (
              <div className="text-gray-500 dark:text-gray-400 text-center py-10">
                {t('htmlValidator.placeholder')}
              </div>
            )}

            {data && isValid && (
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle2 size={18} />
                <span>{t('htmlValidator.noErrors')}</span>
              </div>
            )}

            {data && !isValid && (
              <div className="space-y-3">
                {errors.map((err, idx) => (
                  <div
                    key={`${err.message}-${idx}`}
                    className="p-3 bg-white/60 dark:bg-gray-800/70 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-800 dark:text-red-200 shadow-sm"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <div className="font-semibold">{err.message}</div>
                        {(err.line || err.column) && (
                          <div className="text-xs text-red-600 dark:text-red-300">
                            {t('htmlValidator.location', {
                              line: err.line ?? '?',
                              column: err.column ?? '?',
                            })}
                          </div>
                        )}
                        {err.context && (
                          <div className="text-xs text-gray-600 dark:text-gray-300 font-mono whitespace-pre-wrap">
                            {err.context}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


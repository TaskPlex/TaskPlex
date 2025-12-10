import React, { useState, useCallback, useMemo } from 'react';
import { Hash, Copy, Check, Calculator } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNumberConverter } from '../hooks/useNumberConverter';
import { ProcessButton } from '../components/ui/ProcessButton';
import { ErrorAlert } from '../components/ui/ErrorAlert';

type NumberBase = 'binary' | 'decimal' | 'hexadecimal' | 'octal';

export const NumberConverterScreen: React.FC = () => {
  const { t } = useTranslation();
  const [number, setNumber] = useState('');
  const [fromBase, setFromBase] = useState<NumberBase>('decimal');
  const [toBase, setToBase] = useState<NumberBase>('binary');
  const [copied, setCopied] = useState(false);

  const { mutate, data: result, isPending: loading, error, reset } = useNumberConverter();

  const handleConvert = useCallback(() => {
    if (!number.trim()) return;
    mutate({ number: number.trim(), fromBase, toBase });
  }, [number, fromBase, toBase, mutate]);

  const handleReset = useCallback(() => {
    setNumber('');
    setFromBase('decimal');
    setToBase('binary');
    reset();
    setCopied(false);
  }, [reset]);

  const handleCopy = useCallback(() => {
    if (result?.converted_number) {
      navigator.clipboard.writeText(result.converted_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const errorMessage = error instanceof Error ? error.message : (result && !result.success ? result.message : null);

  const baseOptions: { value: NumberBase; label: string; placeholder: string }[] = useMemo(
    () => [
      { value: 'binary', label: t('numberConverter.bases.binary'), placeholder: '1010' },
      { value: 'decimal', label: t('numberConverter.bases.decimal'), placeholder: '42' },
      { value: 'hexadecimal', label: t('numberConverter.bases.hexadecimal'), placeholder: 'FF' },
      { value: 'octal', label: t('numberConverter.bases.octal'), placeholder: '777' },
    ],
    [t]
  );

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <Calculator className="text-yellow-600 dark:text-yellow-400" size={32} />
          {t('numberConverter.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('numberConverter.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Input & Controls */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label htmlFor="number-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('numberConverter.number')}
            </label>
            <input
              id="number-input"
              type="text"
              value={number}
              onChange={(e) => {
                setNumber(e.target.value);
                reset();
              }}
              placeholder={baseOptions.find((opt) => opt.value === fromBase)?.placeholder}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label htmlFor="from-base" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('numberConverter.fromBase')}
            </label>
            <select
              id="from-base"
              value={fromBase}
              onChange={(e) => {
                setFromBase(e.target.value as NumberBase);
                reset();
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent"
              disabled={loading}
            >
              {baseOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label htmlFor="to-base" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('numberConverter.toBase')}
            </label>
            <select
              id="to-base"
              value={toBase}
              onChange={(e) => {
                setToBase(e.target.value as NumberBase);
                reset();
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent"
              disabled={loading}
            >
              {baseOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <ProcessButton
            onClick={handleConvert}
            disabled={!number.trim() || loading}
            loading={loading}
            labelKey="numberConverter.convert"
            loadingLabelKey="numberConverter.converting"
            color="green"
          />

          {number && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.reset')}
            </button>
          )}

          <ErrorAlert message={errorMessage} />
        </div>

        {/* RIGHT: Result */}
        <div className="space-y-6">
          {result?.success && result.converted_number && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('numberConverter.result')}
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                        {t('numberConverter.original')}
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white break-all font-mono">
                        {result.original_number} <span className="text-gray-500 dark:text-gray-400">({result.original_base})</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-2">
                        {t('numberConverter.converted')}
                      </label>
                      <p className="text-lg font-bold text-green-900 dark:text-green-100 break-all font-mono">
                        {result.converted_number} <span className="text-green-600 dark:text-green-400">({result.converted_base})</span>
                      </p>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex-shrink-0 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title={t('common.copy')}
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!result && (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <Hash className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('numberConverter.noResult')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


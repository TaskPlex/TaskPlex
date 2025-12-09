import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Copy, Check, KeyRound } from 'lucide-react';
import { useHash } from '../hooks/useHash';
import { ErrorAlert, ProcessButton } from '../components/ui';

const algorithms = [
  { value: 'md5', labelKey: 'hashGenerator.algos.md5' },
  { value: 'sha1', labelKey: 'hashGenerator.algos.sha1' },
  { value: 'sha256', labelKey: 'hashGenerator.algos.sha256' },
  { value: 'sha512', labelKey: 'hashGenerator.algos.sha512' },
] as const;

export const HashGeneratorScreen: React.FC = () => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [algorithm, setAlgorithm] = useState<'md5' | 'sha1' | 'sha256' | 'sha512'>('sha256');
  const [uppercase, setUppercase] = useState(false);
  const [useSalt, setUseSalt] = useState(false);
  const [salt, setSalt] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const hashMutation = useHash();
  const result = hashMutation.data;
  const loading = hashMutation.isPending;
  const errorMessage = useMemo(() => {
    if (result && !result.success) return result.message;
    if (hashMutation.error instanceof Error) return hashMutation.error.message;
    return null;
  }, [hashMutation.error, result]);

  const handleGenerate = useCallback(() => {
    if (!text.trim()) return;
    hashMutation.mutate({ text, algorithm, uppercase, salt: useSalt ? salt : undefined });
  }, [text, algorithm, uppercase, salt, useSalt, hashMutation]);

  const handleCopy = useCallback((value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied((prev) => (prev === value ? null : prev)), 1500);
  }, []);

  const canSubmit = useMemo(() => text.trim().length > 0, [text]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('hashGenerator.title')}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('hashGenerator.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('hashGenerator.inputLabel')}</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[220px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500"
              placeholder={t('hashGenerator.placeholder')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('hashGenerator.algorithm')}
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as typeof algorithm)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                {algorithms.map((algo) => (
                  <option key={algo.value} value={algo.value}>
                    {t(algo.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <input
                id="uppercase"
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="uppercase" className="text-sm text-gray-700 dark:text-gray-200">
                {t('hashGenerator.uppercase')}
              </label>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                id="use-salt"
                type="checkbox"
                checked={useSalt}
                onChange={(e) => setUseSalt(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="use-salt" className="text-sm text-gray-700 dark:text-gray-200">
                {t('hashGenerator.useSalt')}
              </label>
            </div>

            {useSalt && (
              <div className="space-y-1 sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {t('hashGenerator.saltLabel')}
                </label>
                <input
                  type="text"
                  value={salt}
                  onChange={(e) => setSalt(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500"
                  placeholder={t('hashGenerator.saltPlaceholder')}
                />
              </div>
            )}
          </div>

          <ProcessButton
            onClick={handleGenerate}
            disabled={!canSubmit}
            loading={loading}
            labelKey="hashGenerator.generate"
            loadingLabelKey="hashGenerator.generating"
            color="blue"
          />

          <ErrorAlert message={errorMessage ?? undefined} />
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {t('hashGenerator.hex')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(result?.hex_digest || '')}
                disabled={!result?.hex_digest}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {copied === result?.hex_digest ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied === result?.hex_digest ? t('hashGenerator.copied') : t('hashGenerator.copy')}
              </button>
            </div>
            <div className="font-mono text-xs text-gray-900 dark:text-gray-100 break-all bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              {result?.hex_digest || t('hashGenerator.waiting')}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {t('hashGenerator.base64')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(result?.base64_digest || '')}
                disabled={!result?.base64_digest}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {copied === result?.base64_digest ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied === result?.base64_digest ? t('hashGenerator.copied') : t('hashGenerator.copy')}
              </button>
            </div>
            <div className="font-mono text-xs text-gray-900 dark:text-gray-100 break-all bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              {result?.base64_digest || t('hashGenerator.waiting')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


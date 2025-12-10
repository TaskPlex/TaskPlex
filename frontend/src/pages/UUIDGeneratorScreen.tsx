import React, { useState } from 'react';
import { Key, Copy, Check, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGenerateUUIDs } from '../hooks/useUUID';
import { ErrorAlert, ProcessButton } from '../components/ui';

export const UUIDGeneratorScreen: React.FC = () => {
  const { t } = useTranslation();
  const [count, setCount] = useState<number>(5);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { mutate, data, isPending, isError, error, reset } = useGenerateUUIDs();

  const handleGenerate = () => {
    setCopiedIndex(null);
    reset();
    mutate({ count, version: 'v4' });
  };

  const handleCopy = async (uuid: string, idx: number) => {
    await navigator.clipboard.writeText(uuid);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  const uuids = data?.uuids ?? [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Key className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('uuidGenerator.title')}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t('uuidGenerator.description')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('uuidGenerator.count')} ({count})
          </label>
          <input
            type="range"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-purple-600"
            disabled={isPending}
          />
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isPending}
          />
          <ProcessButton
            onClick={handleGenerate}
            disabled={isPending}
            loading={isPending}
            labelKey="uuidGenerator.generate"
            loadingLabelKey="uuidGenerator.generating"
            color="purple"
          />
          <ErrorAlert message={isError ? error?.message : undefined} />
        </div>

        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('uuidGenerator.result')}</h2>
          </div>
          {isPending && (
            <div className="h-40 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400">
              {t('uuidGenerator.generating')}
            </div>
          )}
          {!isPending && uuids.length === 0 && (
            <div className="h-40 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500">
              {t('uuidGenerator.placeholder')}
            </div>
          )}
          {!isPending && uuids.length > 0 && (
            <div className="space-y-2">
              {uuids.map((u, idx) => (
                <div
                  key={u}
                  className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2"
                >
                  <span className="font-mono text-sm text-gray-900 dark:text-white break-all flex-1">{u}</span>
                  <button
                    onClick={() => handleCopy(u, idx)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-purple-500 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                  >
                    {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedIndex === idx ? t('passwordGenerator.copied') : t('passwordGenerator.copy')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


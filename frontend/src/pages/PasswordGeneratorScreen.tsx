import React, { useMemo, useState } from 'react';
import { KeyRound, Copy, Check, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGeneratePassword, useCheckPassword } from '../hooks/usePassword';
import { ErrorAlert, ProcessButton } from '../components/ui';

const DEFAULT_LENGTH = 16;

export const PasswordGeneratorScreen: React.FC = () => {
  const { t } = useTranslation();
  const [length, setLength] = useState<number>(DEFAULT_LENGTH);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeDigits, setIncludeDigits] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState<string>('');

  const {
    mutate: generatePassword,
    data,
    isPending,
    isError,
    error,
    reset,
  } = useGeneratePassword();

  const { mutate: checkPwd, data: checkData, isPending: isChecking } = useCheckPassword();

  const password = data?.password || generated;
  const errorMessage = isError ? error?.message : undefined;

  const strengthLabel = useMemo(() => {
    if (!checkData) return '';
    const strength = checkData.strength;
    if (strength === 'strong') return t('passwordGenerator.strong');
    if (strength === 'medium') return t('passwordGenerator.medium');
    return t('passwordGenerator.weak');
  }, [checkData, t]);

  const handleGenerate = () => {
    setCopied(false);
    reset();
    generatePassword({
      length,
      include_lowercase: includeLower,
      include_uppercase: includeUpper,
      include_digits: includeDigits,
      include_symbols: includeSymbols,
      exclude_ambiguous: excludeAmbiguous,
    }, {
      onSuccess: (res) => {
        setGenerated(res.password);
        checkPwd({ password: res.password });
      },
    });
  };

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const strengthColor = checkData?.strength === 'strong'
    ? 'text-green-600'
    : checkData?.strength === 'medium'
      ? 'text-amber-600'
      : 'text-red-600';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <KeyRound className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('passwordGenerator.title')}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t('passwordGenerator.description')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('passwordGenerator.length')} ({length})
              </label>
              <input
                type="number"
                min={4}
                max={128}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-24 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isPending}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('passwordGenerator.includeLower'), checked: includeLower, setter: setIncludeLower },
                { label: t('passwordGenerator.includeUpper'), checked: includeUpper, setter: setIncludeUpper },
                { label: t('passwordGenerator.includeDigits'), checked: includeDigits, setter: setIncludeDigits },
                { label: t('passwordGenerator.includeSymbols'), checked: includeSymbols, setter: setIncludeSymbols },
              ].map((item) => (
                <label key={item.label} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.setter(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    disabled={isPending}
                  />
                  {item.label}
                </label>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={excludeAmbiguous}
                onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                disabled={isPending}
              />
              {t('passwordGenerator.excludeAmbiguous')}
            </label>
            <ProcessButton
              onClick={handleGenerate}
              disabled={isPending}
              loading={isPending}
              labelKey="passwordGenerator.generate"
              loadingLabelKey="passwordGenerator.generating"
              color="indigo"
            />
            <ErrorAlert message={errorMessage} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {t('passwordGenerator.result')}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="font-mono text-lg text-gray-900 dark:text-white break-all bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[48px]">
                  {password || t('passwordGenerator.noPassword')}
                </div>
              </div>
              <button
                onClick={handleCopy}
                disabled={!password}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-indigo-500 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-50"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('passwordGenerator.copied') : t('passwordGenerator.copy')}
              </button>
            </div>

            {isChecking && <p className="text-sm text-gray-500">{t('passwordGenerator.analyzing')}</p>}

            {checkData && (
              <div className="space-y-2">
                <div className={`text-sm font-semibold ${strengthColor}`}>
                  {t('passwordGenerator.strength')}: {strengthLabel}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge active={checkData.has_lowercase}>{t('passwordGenerator.badgeLower')}</Badge>
                  <Badge active={checkData.has_uppercase}>{t('passwordGenerator.badgeUpper')}</Badge>
                  <Badge active={checkData.has_digits}>{t('passwordGenerator.badgeDigit')}</Badge>
                  <Badge active={checkData.has_symbols}>{t('passwordGenerator.badgeSymbol')}</Badge>
                  <Badge active={checkData.length >= 12}>{t('passwordGenerator.badgeLength')}</Badge>
                </div>
                {checkData.suggestions.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-300 space-y-1">
                    {checkData.suggestions.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Badge: React.FC<{ active: boolean; children: React.ReactNode }> = ({ active, children }) => (
  <span
    className={`px-2 py-1 rounded-full border text-xs ${
      active
        ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
    }`}
  >
    {children}
  </span>
);


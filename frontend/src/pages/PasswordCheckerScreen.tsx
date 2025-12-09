import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCheckPassword } from '../hooks/usePassword';
import { ErrorAlert, ProcessButton } from '../components/ui';

export const PasswordCheckerScreen: React.FC = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState<string>('');
  const { mutate, data, isPending, isError, error } = useCheckPassword();

  const handleCheck = () => {
    if (!password) return;
    mutate({ password });
  };

  const strengthColor = data?.strength === 'strong'
    ? 'text-green-600'
    : data?.strength === 'medium'
      ? 'text-amber-600'
      : 'text-red-600';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('passwordChecker.title')}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t('passwordChecker.description')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('passwordChecker.password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={t('passwordChecker.placeholder') || ''}
            disabled={isPending}
          />
        </div>

        <ProcessButton
          onClick={handleCheck}
          disabled={!password || isPending}
          loading={isPending}
          labelKey="passwordChecker.check"
          loadingLabelKey="passwordChecker.checking"
          color="indigo"
        />

        <ErrorAlert message={isError ? error?.message : undefined} />

        {data && (
          <div className="space-y-3">
            <div className={`text-sm font-semibold ${strengthColor}`}>
              {t('passwordChecker.strength')}: {data.strength}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <Stat label={t('passwordChecker.length')!} value={data.length} />
              <Stat label={t('passwordChecker.score')!} value={data.score} />
              <Stat label={t('passwordChecker.entropy')!} value={`${data.entropy} bits`} />
              <Badge active={data.has_lowercase}>{t('passwordChecker.badgeLower')}</Badge>
              <Badge active={data.has_uppercase}>{t('passwordChecker.badgeUpper')}</Badge>
              <Badge active={data.has_digits}>{t('passwordChecker.badgeDigit')}</Badge>
              <Badge active={data.has_symbols}>{t('passwordChecker.badgeSymbol')}</Badge>
            </div>

            {data.suggestions.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200 flex gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <div>
                  <p className="font-semibold">{t('passwordChecker.suggestions')}</p>
                  <ul className="list-disc list-inside space-y-1">
                    {data.suggestions.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
    <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
  </div>
);

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


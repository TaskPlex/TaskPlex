import React from 'react';
import { useTranslation } from 'react-i18next';

interface FormatSelectorProps {
  formats: string[];
  value: string;
  onChange: (format: string) => void;
  labelKey?: string;
  className?: string;
  disabled?: boolean;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  formats,
  value,
  onChange,
  labelKey,
  className = '',
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
      {labelKey && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t(labelKey)}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {formats.map((f) => (
          <option key={f} value={f}>
            {f.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
};

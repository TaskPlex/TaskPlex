import React from 'react';
import { useTranslation } from 'react-i18next';

export type QualityLevel = 'low' | 'medium' | 'high';

interface QualitySelectorProps {
  value: QualityLevel;
  onChange: (quality: QualityLevel) => void;
  labelKey?: string;
  color?: 'purple' | 'blue' | 'red' | 'green';
  className?: string;
  disabled?: boolean;
}

const colorClasses = {
  purple: {
    active: 'border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    inactive: 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500',
  },
  blue: {
    active: 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    inactive: 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500',
  },
  red: {
    active: 'border-red-600 dark:border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    inactive: 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500',
  },
  green: {
    active: 'border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    inactive: 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500',
  },
};

const qualities: QualityLevel[] = ['low', 'medium', 'high'];

export const QualitySelector: React.FC<QualitySelectorProps> = ({
  value,
  onChange,
  labelKey,
  color = 'purple',
  className = '',
  disabled = false,
}) => {
  const { t } = useTranslation();
  const colors = colorClasses[color];

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
      {labelKey && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t(labelKey)}
        </label>
      )}
      <div className="flex gap-2">
        {qualities.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onChange(q)}
            disabled={disabled}
            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
              value === q ? colors.active : colors.inactive
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {q.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

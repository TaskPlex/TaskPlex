import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProcessButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  labelKey: string;
  loadingLabelKey?: string;
  color?: 'purple' | 'blue' | 'red' | 'green';
  className?: string;
}

const colorClasses = {
  purple: 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500',
  blue: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500',
  red: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500',
  green: 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500',
};

export const ProcessButton: React.FC<ProcessButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  labelKey,
  loadingLabelKey,
  color = 'purple',
  className = '',
}) => {
  const { t } = useTranslation();
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
        isDisabled
          ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
          : `${colorClasses[color]} hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer`
      } ${className}`}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {loading && loadingLabelKey ? t(loadingLabelKey) : t(labelKey)}
    </button>
  );
};

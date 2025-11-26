import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Globe, Palette, Info, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
] as const;

const THEME_OPTIONS = [
  { id: 'light', icon: Sun, labelKey: 'common.themeLight' },
  { id: 'dark', icon: Moon, labelKey: 'common.themeDark' },
  { id: 'system', icon: Monitor, labelKey: 'common.themeSystem' },
] as const;

export const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings size={32} className="text-purple-600 dark:text-purple-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('settings.description')}</p>
        </div>

        {/* Language Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={24} className="text-purple-600 dark:text-purple-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('settings.language')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.languageDesc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left cursor-pointer ${
                  i18n.language === lang.code || i18n.language.startsWith(lang.code)
                    ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/30 shadow-md'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white mb-1">{lang.nativeName}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{lang.name}</div>
                {(i18n.language === lang.code || i18n.language.startsWith(lang.code)) && (
                  <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium">✓ {t('common.success')}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette size={24} className="text-purple-600 dark:text-purple-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('common.theme')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.appearanceDesc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id as 'light' | 'dark' | 'system')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left flex items-center gap-3 cursor-pointer ${
                    isActive
                      ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/30 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-purple-100 dark:bg-purple-800' : 'bg-gray-100 dark:bg-gray-600'}`}>
                    <Icon size={20} className={isActive ? 'text-purple-600 dark:text-purple-300' : 'text-gray-600 dark:text-gray-300'} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{t(option.labelKey)}</div>
                    {isActive && (
                      <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">✓ Active</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Info size={24} className="text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('settings.about')}</h2>
          </div>
          <div className="space-y-2 text-gray-600 dark:text-gray-400">
            <p>{t('settings.description')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              {t('settings.version')}: 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

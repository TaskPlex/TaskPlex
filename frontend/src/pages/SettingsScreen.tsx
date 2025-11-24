import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Globe, Palette, Info } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
] as const;

export const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings size={32} className="text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
          </div>
          <p className="text-gray-600 mt-2">{t('settings.description')}</p>
        </div>

        {/* Language Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={24} className="text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('settings.language')}</h2>
              <p className="text-sm text-gray-500">{t('settings.languageDesc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  i18n.language === lang.code || i18n.language.startsWith(lang.code)
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="font-semibold text-gray-900 mb-1">{lang.nativeName}</div>
                <div className="text-sm text-gray-500">{lang.name}</div>
                {(i18n.language === lang.code || i18n.language.startsWith(lang.code)) && (
                  <div className="mt-2 text-xs text-purple-600 font-medium">✓ {t('common.success')}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Appearance Section (Placeholder for future theme support) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 opacity-50">
          <div className="flex items-center gap-3 mb-4">
            <Palette size={24} className="text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('settings.appearance')}</h2>
              <p className="text-sm text-gray-500">Theme customization coming soon</p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Info size={24} className="text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">{t('settings.about')}</h2>
          </div>
          <div className="space-y-2 text-gray-600">
            <p>{t('settings.description')}</p>
            <p className="text-sm text-gray-500 mt-4">
              {t('settings.version')}: 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


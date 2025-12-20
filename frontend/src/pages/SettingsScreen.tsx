import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Globe, Palette, Info, Sun, Moon, Monitor, Keyboard, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useHotkeys } from '../contexts/HotkeysContext';
import { getAllModules } from '../config/modules';
import { HotkeyInput } from '../components/ui/HotkeyInput';
import { formatHotkey, type Hotkey } from '../utils/hotkeyParser';
import { useProfileLanguage } from '../hooks/useProfileLanguage';

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
  const { hotkeys, addHotkey, removeHotkey, updateHotkey } = useHotkeys();
  const { changeLanguage } = useProfileLanguage();
  const allModules = getAllModules();

  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode);
  };

  // Get module hotkeys (exclude default ones like focus_search)
  const moduleHotkeys = useMemo(() => {
    return hotkeys.filter(h => h.action.type === 'navigate');
  }, [hotkeys]);

  // Get default hotkeys
  const defaultHotkeys = useMemo(() => {
    return hotkeys.filter(h => h.action.type !== 'navigate');
  }, [hotkeys]);

  const handleAddModuleHotkey = (moduleId: string) => {
    const module = allModules.find(m => m.id === moduleId);
    if (!module) return;

    const newId = `module_${moduleId}`;
    // Add without a hotkey - user must set it manually
    addHotkey({
      id: newId,
      action: { type: 'navigate', path: module.path },
      hotkey: { ctrl: false, key: '' }, // Empty - user must set it
      label: t(module.labelKey),
    });
  };

  const handleModuleHotkeyChange = (id: string, hotkey: Hotkey | null) => {
    if (hotkey) {
      updateHotkey(id, hotkey);
    } else {
      removeHotkey(id);
    }
  };

  // Detect if running on Mac
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);

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

        {/* Hotkeys Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Keyboard size={24} className="text-purple-600 dark:text-purple-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('settings.hotkeys.title')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.hotkeys.description')}</p>
            </div>
          </div>

          {/* Default Hotkeys */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('settings.hotkeys.default')}</h3>
            <div className="space-y-3">
              {defaultHotkeys.map((binding) => (
                <div key={binding.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{binding.label}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded">
                      {formatHotkey(binding.hotkey, isMac)}
                    </kbd>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module Hotkeys */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('settings.hotkeys.modules')}</h3>
            </div>
            <div className="space-y-3">
              {moduleHotkeys.map((binding) => {
                return (
                  <div key={binding.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {binding.label}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <HotkeyInput
                        value={binding.hotkey}
                        onChange={(hotkey) => handleModuleHotkeyChange(binding.id, hotkey)}
                        className="w-64"
                      />
                      <button
                        onClick={() => removeHotkey(binding.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        aria-label={t('settings.hotkeys.remove')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Module Hotkey */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.hotkeys.addModule')}
            </label>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAddModuleHotkey(e.target.value);
                  e.target.value = '';
                }
              }}
              className="
                w-full px-3 py-2
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400
                cursor-pointer
              "
            >
              <option value="">{t('settings.hotkeys.selectModule')}</option>
              {allModules
                .filter(module => !moduleHotkeys.some(h => h.action.type === 'navigate' && h.action.path === module.path))
                .map((module) => (
                  <option key={module.id} value={module.id}>
                    {t(module.labelKey)}
                  </option>
                ))}
            </select>
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

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfiles } from '../contexts/ProfilesContext';

const LANGUAGE_STORAGE_KEY_BASE = 'taskplex_language';

/**
 * Hook to manage language per profile
 * Automatically loads and saves language preference scoped to the current profile
 */
export function useProfileLanguage() {
  const { i18n } = useTranslation();
  const { getProfileStorageKey, currentProfileId } = useProfiles();
  const lastProfileIdRef = useRef<string | null>(null);

  // Load language when profile changes
  useEffect(() => {
    if (currentProfileId && currentProfileId !== lastProfileIdRef.current) {
      lastProfileIdRef.current = currentProfileId;
      const storageKey = getProfileStorageKey(LANGUAGE_STORAGE_KEY_BASE);
      const storedLanguage = localStorage.getItem(storageKey);
      
      if (storedLanguage && ['en', 'fr', 'es'].includes(storedLanguage)) {
        // Only change if different from current
        if (i18n.language.split('-')[0] !== storedLanguage) {
          i18n.changeLanguage(storedLanguage);
        }
      } else {
        // If no language stored for this profile, save current language
        const currentLang = i18n.language.split('-')[0]; // Remove region code if present
        if (['en', 'fr', 'es'].includes(currentLang)) {
          localStorage.setItem(storageKey, currentLang);
        } else {
          // Default to English
          localStorage.setItem(storageKey, 'en');
          if (i18n.language.split('-')[0] !== 'en') {
            i18n.changeLanguage('en');
          }
        }
      }
    }
  }, [currentProfileId, getProfileStorageKey, i18n]);

  // Save language when it changes (but not when profile changes)
  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    
    if (currentProfileId) {
      const storageKey = getProfileStorageKey(LANGUAGE_STORAGE_KEY_BASE);
      localStorage.setItem(storageKey, langCode);
    }
  };

  return {
    currentLanguage: i18n.language.split('-')[0], // Remove region code
    changeLanguage,
  };
}


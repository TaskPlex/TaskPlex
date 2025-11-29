import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ModuleDefinition } from '../config/modules';

// Import all locale files for multi-language search
import enLocale from '../i18n/locales/en.json';
import frLocale from '../i18n/locales/fr.json';
import esLocale from '../i18n/locales/es.json';

type LocaleData = typeof enLocale;

const locales: Record<string, LocaleData> = {
  en: enLocale,
  fr: frLocale,
  es: esLocale,
};

/**
 * Normalize text for search comparison
 * Removes accents, converts to lowercase, and trims whitespace
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics/accents
    .trim();
}

/**
 * Get nested value from object using dot notation key
 */
function getNestedValue(obj: Record<string, unknown>, key: string): string | undefined {
  const keys = key.split('.');
  let value: unknown = obj;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }
  
  return typeof value === 'string' ? value : undefined;
}

/**
 * Get all translated texts for a module across all languages
 */
function getModuleSearchableTexts(module: ModuleDefinition): string[] {
  const texts: string[] = [];
  
  // Add module ID (useful for searching like "pdf" which matches "pdf-compress", etc.)
  texts.push(module.id);
  
  // Add texts from all locales
  for (const locale of Object.values(locales)) {
    const title = getNestedValue(locale as unknown as Record<string, unknown>, module.labelKey);
    const description = getNestedValue(locale as unknown as Record<string, unknown>, module.descriptionKey);
    
    if (title) texts.push(title);
    if (description) texts.push(description);
  }
  
  return texts;
}

/**
 * Check if search query matches any of the module's searchable texts
 */
function matchesSearch(module: ModuleDefinition, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  
  const searchableTexts = getModuleSearchableTexts(module);
  const normalizedTexts = searchableTexts.map(normalizeText);
  
  // Split query into words for multi-word search
  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
  
  // All query words must match at least one text
  return queryWords.every(word => 
    normalizedTexts.some(text => text.includes(word))
  );
}

/**
 * Calculate relevance score for sorting results
 * Higher score = more relevant
 */
function calculateRelevance(module: ModuleDefinition, normalizedQuery: string, currentLang: string): number {
  let score = 0;
  
  const currentLocale = locales[currentLang] || locales.en;
  const title = getNestedValue(currentLocale as unknown as Record<string, unknown>, module.labelKey) || '';
  const description = getNestedValue(currentLocale as unknown as Record<string, unknown>, module.descriptionKey) || '';
  
  const normalizedTitle = normalizeText(title);
  const normalizedDescription = normalizeText(description);
  const normalizedId = normalizeText(module.id);
  
  // Exact match in current language title = highest score
  if (normalizedTitle === normalizedQuery) score += 100;
  else if (normalizedTitle.startsWith(normalizedQuery)) score += 50;
  else if (normalizedTitle.includes(normalizedQuery)) score += 30;
  
  // Match in ID
  if (normalizedId.includes(normalizedQuery)) score += 20;
  
  // Match in description
  if (normalizedDescription.includes(normalizedQuery)) score += 10;
  
  // Implemented modules get a small boost
  if (module.status === 'implemented') score += 5;
  
  return score;
}

export interface UseModuleSearchResult {
  searchModules: (modules: ModuleDefinition[], query: string) => ModuleDefinition[];
  normalizeQuery: (query: string) => string;
}

/**
 * Hook for searching modules across all languages
 */
export function useModuleSearch(): UseModuleSearchResult {
  const { i18n } = useTranslation();
  
  const searchModules = useMemo(() => {
    return (modules: ModuleDefinition[], query: string): ModuleDefinition[] => {
      const normalizedQuery = normalizeText(query);
      
      if (!normalizedQuery) {
        return modules;
      }
      
      // Filter matching modules
      const matchingModules = modules.filter(module => 
        matchesSearch(module, normalizedQuery)
      );
      
      // Sort by relevance
      return matchingModules.sort((a, b) => {
        const scoreA = calculateRelevance(a, normalizedQuery, i18n.language);
        const scoreB = calculateRelevance(b, normalizedQuery, i18n.language);
        return scoreB - scoreA;
      });
    };
  }, [i18n.language]);
  
  return {
    searchModules,
    normalizeQuery: normalizeText,
  };
}


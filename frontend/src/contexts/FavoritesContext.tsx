/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useProfiles } from './ProfilesContext';

const FAVORITES_STORAGE_KEY_BASE = 'taskplex_favorites';
const SIDEBAR_COLLAPSED_KEY_BASE = 'taskplex_sidebar_collapsed';

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (moduleId: string) => boolean;
  toggleFavorite: (moduleId: string) => void;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getProfileStorageKey, currentProfileId } = useProfiles();
  
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const storageKey = getProfileStorageKey(FAVORITES_STORAGE_KEY_BASE);
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storageKey = getProfileStorageKey(SIDEBAR_COLLAPSED_KEY_BASE);
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });

  // Reload favorites and sidebar state when profile changes
  useEffect(() => {
    if (typeof window !== 'undefined' && currentProfileId) {
      const favoritesKey = getProfileStorageKey(FAVORITES_STORAGE_KEY_BASE);
      const collapsedKey = getProfileStorageKey(SIDEBAR_COLLAPSED_KEY_BASE);
      
      const storedFavorites = localStorage.getItem(favoritesKey);
      const storedCollapsed = localStorage.getItem(collapsedKey);
      
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setFavorites(storedFavorites ? JSON.parse(storedFavorites) : []);
        setIsCollapsed(storedCollapsed ? JSON.parse(storedCollapsed) : false);
      }, 0);
    }
  }, [currentProfileId, getProfileStorageKey]);

  // Save favorites to localStorage (scoped to profile)
  useEffect(() => {
    if (typeof window !== 'undefined' && currentProfileId) {
      const storageKey = getProfileStorageKey(FAVORITES_STORAGE_KEY_BASE);
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    }
  }, [favorites, currentProfileId, getProfileStorageKey]);

  // Save sidebar collapsed state to localStorage (scoped to profile)
  useEffect(() => {
    if (typeof window !== 'undefined' && currentProfileId) {
      const storageKey = getProfileStorageKey(SIDEBAR_COLLAPSED_KEY_BASE);
      localStorage.setItem(storageKey, JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, currentProfileId, getProfileStorageKey]);

  const toggleFavorite = (moduleId: string) => {
    setFavorites((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const isFavorite = (moduleId: string) => favorites.includes(moduleId);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        isCollapsed,
        toggleSidebar,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};


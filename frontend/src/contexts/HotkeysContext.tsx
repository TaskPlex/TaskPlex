import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseHotkeyFromString, hotkeyToString, type Hotkey } from '../utils/hotkeyParser';
import { useProfiles } from './ProfilesContext';

export type HotkeyAction = 
  | { type: 'navigate'; path: string }
  | { type: 'focus_search' }
  | { type: 'custom'; id: string };

export interface HotkeyBinding {
  id: string;
  action: HotkeyAction;
  hotkey: Hotkey;
  label: string; // User-friendly label (e.g., "Open Video Compress")
}

const STORAGE_KEY_BASE = 'taskplex_hotkeys';

// Default hotkeys
const DEFAULT_HOTKEYS: HotkeyBinding[] = [
  {
    id: 'focus_search',
    action: { type: 'focus_search' },
    hotkey: { ctrl: true, key: 'k' },
    label: 'Focus Search',
  },
];

interface HotkeysContextType {
  hotkeys: HotkeyBinding[];
  addHotkey: (binding: HotkeyBinding) => void;
  removeHotkey: (id: string) => void;
  updateHotkey: (id: string, hotkey: Hotkey) => void;
  getHotkeyByAction: (action: HotkeyAction) => HotkeyBinding | undefined;
}

const HotkeysContext = createContext<HotkeysContextType | undefined>(undefined);

export function HotkeysProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { getProfileStorageKey } = useProfiles();
  const [hotkeys, setHotkeys] = useState<HotkeyBinding[]>(DEFAULT_HOTKEYS);

  // Load hotkeys from localStorage on mount and when profile changes
  useEffect(() => {
    const storageKey = getProfileStorageKey(STORAGE_KEY_BASE);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert string hotkeys back to Hotkey objects
        const bindings: HotkeyBinding[] = parsed.map((item: { id: string; action: HotkeyAction; hotkeyString?: string; hotkey?: Hotkey; label: string }) => ({
          ...item,
          hotkey: (item.hotkeyString ? parseHotkeyFromString(item.hotkeyString) : null) || item.hotkey || { ctrl: false, key: '' },
        }));
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => setHotkeys(bindings), 0);
      } else {
        // Reset to defaults if no stored hotkeys for this profile
        setTimeout(() => setHotkeys(DEFAULT_HOTKEYS), 0);
      }
    } catch (error) {
      console.error('Failed to load hotkeys from storage:', error);
      setTimeout(() => setHotkeys(DEFAULT_HOTKEYS), 0);
    }
  }, [getProfileStorageKey]);

  // Save hotkeys to localStorage whenever they change
  useEffect(() => {
    const storageKey = getProfileStorageKey(STORAGE_KEY_BASE);
    try {
      // Convert Hotkey objects to strings for storage
      const toStore = hotkeys.map(binding => ({
        ...binding,
        hotkeyString: hotkeyToString(binding.hotkey),
      }));
      localStorage.setItem(storageKey, JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to save hotkeys to storage:', error);
    }
  }, [hotkeys, getProfileStorageKey]);

  // Handle hotkey execution
  const executeAction = useCallback((action: HotkeyAction) => {
    switch (action.type) {
      case 'navigate':
        navigate(action.path);
        break;
      case 'focus_search': {
        // Find the search input - try multiple selectors
        let searchInput = document.querySelector('input[type="text"][placeholder*="Rechercher"]') as HTMLInputElement;
        if (!searchInput) {
          searchInput = document.querySelector('input[type="text"][placeholder*="Search"]') as HTMLInputElement;
        }
        if (!searchInput) {
          searchInput = document.querySelector('input[type="text"][placeholder*="Buscar"]') as HTMLInputElement;
        }
        if (!searchInput) {
          searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        }
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        break;
      }
      case 'custom':
        // Custom actions can be handled by components that register them
        console.log('Custom action:', action.id);
        break;
    }
  }, [navigate]);

  // Global hotkey listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea (except for focus_search hotkey)
      const target = event.target as HTMLElement;
      const isFocusSearch = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Only allow focus_search hotkey when typing in inputs
        if (!isFocusSearch) {
          return;
        }
      }

      // Check all registered hotkeys
      for (const binding of hotkeys) {
        const { hotkey } = binding;
        const matches = 
          (hotkey.ctrl === undefined || hotkey.ctrl === event.ctrlKey) &&
          (hotkey.meta === undefined || hotkey.meta === event.metaKey) &&
          (hotkey.alt === undefined || hotkey.alt === event.altKey) &&
          (hotkey.shift === undefined || hotkey.shift === event.shiftKey) &&
          hotkey.key.toLowerCase() === event.key.toLowerCase();

        if (matches) {
          event.preventDefault();
          executeAction(binding.action);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkeys, executeAction]);

  const addHotkey = useCallback((binding: HotkeyBinding) => {
    setHotkeys(prev => {
      // Check if ID already exists, update instead
      const existingIndex = prev.findIndex(b => b.id === binding.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = binding;
        return updated;
      }
      
      // Check for duplicate hotkeys (only if hotkey is valid and not empty)
      const bindingHotkeyStr = hotkeyToString(binding.hotkey);
      const isEmpty = !binding.hotkey.key || binding.hotkey.key.length === 0;
      
      if (!isEmpty && bindingHotkeyStr) {
        const duplicate = prev.find(b => {
          const bHotkeyStr = hotkeyToString(b.hotkey);
          const bIsEmpty = !b.hotkey.key || b.hotkey.key.length === 0;
          return !bIsEmpty && bHotkeyStr && bHotkeyStr === bindingHotkeyStr && b.id !== binding.id;
        });
        if (duplicate) {
          console.warn('Hotkey already assigned to:', duplicate.label);
          // Still add it, but warn the user - they can change it
        }
      }
      
      return [...prev, binding];
    });
  }, []);

  const removeHotkey = useCallback((id: string) => {
    // Don't allow removing default hotkeys
    if (id === 'focus_search') {
      return;
    }
    setHotkeys(prev => prev.filter(b => b.id !== id));
  }, []);

  const updateHotkey = useCallback((id: string, hotkey: Hotkey) => {
    setHotkeys(prev => {
      // Check for duplicates
      const duplicate = prev.find(b => 
        b.id !== id && hotkeyToString(b.hotkey) === hotkeyToString(hotkey)
      );
      if (duplicate) {
        console.warn('Hotkey already assigned to:', duplicate.label);
        return prev;
      }
      
      return prev.map(b => 
        b.id === id ? { ...b, hotkey } : b
      );
    });
  }, []);

  const getHotkeyByAction = useCallback((action: HotkeyAction) => {
    return hotkeys.find(b => {
      if (b.action.type !== action.type) return false;
      if (b.action.type === 'navigate' && action.type === 'navigate') {
        return b.action.path === action.path;
      }
      if (b.action.type === 'custom' && action.type === 'custom') {
        return b.action.id === action.id;
      }
      return b.action.type === action.type;
    });
  }, [hotkeys]);

  return (
    <HotkeysContext.Provider value={{
      hotkeys,
      addHotkey,
      removeHotkey,
      updateHotkey,
      getHotkeyByAction,
    }}>
      {children}
    </HotkeysContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useHotkeys() {
  const context = useContext(HotkeysContext);
  if (context === undefined) {
    throw new Error('useHotkeys must be used within a HotkeysProvider');
  }
  return context;
}


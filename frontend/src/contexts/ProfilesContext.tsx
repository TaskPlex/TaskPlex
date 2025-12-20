import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface Profile {
  id: string;
  name: string;
  color: string; // Hex color for avatar
  avatarIndex?: number; // Index of the selected avatar (0-3)
  createdAt: number;
}

const STORAGE_KEY = 'taskplex_profiles';
const CURRENT_PROFILE_KEY = 'taskplex_current_profile';

interface ProfilesContextType {
  profiles: Profile[];
  currentProfileId: string | null;
  currentProfile: Profile | null;
  createProfile: (name: string, avatarIndex?: number) => Profile;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  setCurrentProfile: (id: string) => void;
  getProfileStorageKey: (key: string) => string; // Helper to get storage key scoped to profile
}

const ProfilesContext = createContext<ProfilesContextType | undefined>(undefined);

// Generate a random color for profile avatar
function generateRandomColor(): string {
  const colors = [
    '#EF4444', // red-500
    '#F97316', // orange-500
    '#F59E0B', // amber-500
    '#EAB308', // yellow-500
    '#84CC16', // lime-500
    '#22C55E', // green-500
    '#10B981', // emerald-500
    '#14B8A6', // teal-500
    '#06B6D4', // cyan-500
    '#0EA5E9', // sky-500
    '#3B82F6', // blue-500
    '#6366F1', // indigo-500
    '#8B5CF6', // violet-500
    '#A855F7', // purple-500
    '#D946EF', // fuchsia-500
    '#EC4899', // pink-500
    '#F43F5E', // rose-500
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function ProfilesProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  // Load profiles and current profile from localStorage
  useEffect(() => {
    try {
      const storedProfiles = localStorage.getItem(STORAGE_KEY);
      if (storedProfiles) {
        const parsed = JSON.parse(storedProfiles);
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => setProfiles(parsed), 0);
      } else {
        // Create default profile if none exist
        const defaultProfile: Profile = {
          id: 'default',
          name: 'Default',
          color: generateRandomColor(),
          createdAt: Date.now(),
        };
        setTimeout(() => {
          setProfiles([defaultProfile]);
          setCurrentProfileId('default');
        }, 0);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultProfile]));
        localStorage.setItem(CURRENT_PROFILE_KEY, 'default');
      }

      const storedCurrent = localStorage.getItem(CURRENT_PROFILE_KEY);
      setTimeout(() => {
        if (storedCurrent) {
          setCurrentProfileId(storedCurrent);
        } else {
          // Get profiles from state after they're loaded
          const currentProfiles = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Profile[];
          if (currentProfiles.length > 0) {
            setCurrentProfileId(currentProfiles[0].id);
          }
        }
      }, 0);
    } catch (error) {
      console.error('Failed to load profiles:', error);
      // Create default profile on error
        const defaultProfile: Profile = {
          id: 'default',
          name: 'Default',
          color: generateRandomColor(),
          createdAt: Date.now(),
        };
        setTimeout(() => {
          setProfiles([defaultProfile]);
          setCurrentProfileId('default');
        }, 0);
    }
  }, []);

  // Save profiles to localStorage whenever they change
  useEffect(() => {
    if (profiles.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
      } catch (error) {
        console.error('Failed to save profiles:', error);
      }
    }
  }, [profiles]);

  // Save current profile ID to localStorage
  useEffect(() => {
    if (currentProfileId) {
      try {
        localStorage.setItem(CURRENT_PROFILE_KEY, currentProfileId);
      } catch (error) {
        console.error('Failed to save current profile:', error);
      }
    }
  }, [currentProfileId]);

  const createProfile = useCallback((name: string, avatarIndex?: number): Profile => {
    const newProfile: Profile = {
      id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim() || 'New Profile',
      color: generateRandomColor(),
      avatarIndex: avatarIndex !== undefined ? avatarIndex : Math.floor(Math.random() * 4),
      createdAt: Date.now(),
    };

    setProfiles(prev => [...prev, newProfile]);
    setCurrentProfileId(newProfile.id);
    return newProfile;
  }, []);

  const updateProfile = useCallback((id: string, updates: Partial<Profile>) => {
    setProfiles(prev =>
      prev.map(profile => (profile.id === id ? { ...profile, ...updates } : profile))
    );
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setProfiles(prev => {
      const filtered = prev.filter(profile => profile.id !== id);
      
      // If deleting current profile, switch to first available
      if (currentProfileId === id) {
        if (filtered.length > 0) {
          setCurrentProfileId(filtered[0].id);
        } else {
          // Create a new default profile if all are deleted
          const defaultProfile: Profile = {
            id: 'default',
            name: 'Default',
            color: generateRandomColor(),
            createdAt: Date.now(),
          };
          setCurrentProfileId('default');
          return [defaultProfile];
        }
      }
      
      return filtered;
    });
  }, [currentProfileId]);

  const setCurrentProfile = useCallback((id: string) => {
    const profileExists = profiles.some(p => p.id === id);
    if (profileExists) {
      setCurrentProfileId(id);
    }
  }, [profiles]);

  const getProfileStorageKey = useCallback((key: string) => {
    if (!currentProfileId) return key;
    return `${key}_profile_${currentProfileId}`;
  }, [currentProfileId]);

  const currentProfile = profiles.find(p => p.id === currentProfileId) || null;

  return (
    <ProfilesContext.Provider
      value={{
        profiles,
        currentProfileId,
        currentProfile,
        createProfile,
        updateProfile,
        deleteProfile,
        setCurrentProfile,
        getProfileStorageKey,
      }}
    >
      {children}
    </ProfilesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfiles() {
  const context = useContext(ProfilesContext);
  if (context === undefined) {
    throw new Error('useProfiles must be used within a ProfilesProvider');
  }
  return context;
}


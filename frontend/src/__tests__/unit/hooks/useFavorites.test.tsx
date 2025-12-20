/**
 * Tests for useFavorites hook
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { FavoritesProvider, useFavorites } from '../../../contexts/FavoritesContext';
import { ProfilesProvider } from '../../../contexts/ProfilesContext';

// Wrapper component for the hook
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ProfilesProvider>
    <FavoritesProvider>{children}</FavoritesProvider>
  </ProfilesProvider>
);

describe('useFavorites', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('throws error when used outside FavoritesProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useFavorites());
    }).toThrow('useFavorites must be used within a FavoritesProvider');
    
    consoleSpy.mockRestore();
  });

  it('returns empty favorites array initially', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    
    expect(result.current.favorites).toEqual([]);
  });

  it('returns isCollapsed as false initially', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    
    expect(result.current.isCollapsed).toBe(false);
  });

  it('toggleFavorite adds a module to favorites', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    
    act(() => {
      result.current.toggleFavorite('video-compress');
    });
    
    expect(result.current.favorites).toContain('video-compress');
    expect(result.current.isFavorite('video-compress')).toBe(true);
  });

  it('toggleFavorite removes a module from favorites when called twice', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    
    act(() => {
      result.current.toggleFavorite('video-compress');
    });
    
    expect(result.current.isFavorite('video-compress')).toBe(true);
    
    act(() => {
      result.current.toggleFavorite('video-compress');
    });
    
    expect(result.current.isFavorite('video-compress')).toBe(false);
    expect(result.current.favorites).not.toContain('video-compress');
  });

  it('can add multiple favorites', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    
    act(() => {
      result.current.toggleFavorite('video-compress');
      result.current.toggleFavorite('pdf-merge');
      result.current.toggleFavorite('image-convert');
    });
    
    expect(result.current.favorites).toHaveLength(3);
    expect(result.current.isFavorite('video-compress')).toBe(true);
    expect(result.current.isFavorite('pdf-merge')).toBe(true);
    expect(result.current.isFavorite('image-convert')).toBe(true);
  });

  it('isFavorite returns false for non-favorite module', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    
    expect(result.current.isFavorite('non-existent')).toBe(false);
  });

  it('toggleSidebar toggles isCollapsed state', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    
    expect(result.current.isCollapsed).toBe(false);
    
    act(() => {
      result.current.toggleSidebar();
    });
    
    expect(result.current.isCollapsed).toBe(true);
    
    act(() => {
      result.current.toggleSidebar();
    });
    
    expect(result.current.isCollapsed).toBe(false);
  });

  it('persists favorites to localStorage', async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    
    await act(async () => {
      result.current.toggleFavorite('pdf-compress');
      // Wait for localStorage update
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    // localStorage key is now scoped by profile (default profile)
    const stored = localStorage.getItem('taskplex_favorites_profile_default');
    expect(stored).toBe(JSON.stringify(['pdf-compress']));
  });

  it('persists sidebar collapsed state to localStorage', async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    
    await act(async () => {
      result.current.toggleSidebar();
      // Wait for localStorage update
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    // localStorage key is now scoped by profile (default profile)
    const stored = localStorage.getItem('taskplex_sidebar_collapsed_profile_default');
    expect(stored).toBe('true');
  });

  it('loads favorites from localStorage on init', async () => {
    // Pre-populate localStorage with profile-scoped key
    localStorage.setItem('taskplex_favorites_profile_default', JSON.stringify(['video-compress', 'pdf-merge']));
    
    const { result } = renderHook(() => useFavorites(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.favorites).toEqual(['video-compress', 'pdf-merge']);
    });
    expect(result.current.isFavorite('video-compress')).toBe(true);
  });

  it('loads sidebar collapsed state from localStorage on init', async () => {
    // Pre-populate localStorage with profile-scoped key
    localStorage.setItem('taskplex_sidebar_collapsed_profile_default', 'true');
    
    const { result } = renderHook(() => useFavorites(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isCollapsed).toBe(true);
    });
  });
});


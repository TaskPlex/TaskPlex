/**
 * Tests for environment detection utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isTauri,
  getEnvironmentSync,
  resetEnvironmentCache,
} from '@/utils/environment';
import {
  setupTauriEnvironment,
  teardownTauriEnvironment,
  setupPlatformMocks,
} from '@/mocks/tauri';

describe('Environment Detection', () => {
  beforeEach(() => {
    resetEnvironmentCache();
    teardownTauriEnvironment();
  });

  afterEach(() => {
    resetEnvironmentCache();
    teardownTauriEnvironment();
    vi.restoreAllMocks();
  });

  describe('isTauri', () => {
    it('should return false in browser environment', () => {
      expect(isTauri()).toBe(false);
    });

    it('should return true when __TAURI_INTERNALS__ is present', () => {
      setupTauriEnvironment();
      expect(isTauri()).toBe(true);
    });

    it('should return true when __TAURI__ is present', () => {
      Object.defineProperty(window, '__TAURI__', {
        value: {},
        writable: true,
        configurable: true,
      });
      expect(isTauri()).toBe(true);
    });
  });

  describe('getEnvironmentSync', () => {
    it('should return browser runtime for web environment', () => {
      const env = getEnvironmentSync();
      expect(env.runtime).toBe('browser');
      expect(env.isTauri).toBe(false);
      expect(env.isWeb).toBe(true);
      expect(env.isDesktop).toBe(false);
    });

    it('should return tauri runtime when in Tauri', () => {
      setupTauriEnvironment();
      const env = getEnvironmentSync();
      expect(env.runtime).toBe('tauri');
      expect(env.isTauri).toBe(true);
      expect(env.isWeb).toBe(false);
      expect(env.isDesktop).toBe(true);
    });
  });

  describe('Platform-specific environments', () => {
    it('should setup Linux environment correctly', () => {
      setupPlatformMocks('linux');
      const env = getEnvironmentSync();
      expect(env.isTauri).toBe(true);
    });

    it('should setup Windows environment correctly', () => {
      setupPlatformMocks('windows');
      const env = getEnvironmentSync();
      expect(env.isTauri).toBe(true);
    });

    it('should setup macOS environment correctly', () => {
      setupPlatformMocks('macos');
      const env = getEnvironmentSync();
      expect(env.isTauri).toBe(true);
    });
  });
});


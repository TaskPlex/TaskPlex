/**
 * Tauri-specific test setup
 * This file is loaded when running tests in Tauri environment mode
 * (TEST_ENV=tauri npm run test)
 */

import { vi, beforeAll, afterAll, afterEach } from 'vitest';
import {
  setupTauriEnvironment,
  teardownTauriEnvironment,
  resetTauriMocks,
  mockPluginShell,
  mockApiPath,
  mockPluginOs,
  PLATFORM_CONFIGS,
  type MockPlatform,
} from '@/mocks/tauri';

// Get platform from environment variable
const testPlatform = (process.env.TEST_PLATFORM || 'linux') as MockPlatform;

// ============================================
// Setup Tauri Mocks
// ============================================

beforeAll(() => {
  console.log(`🔧 Setting up Tauri test environment for platform: ${testPlatform}`);
  
  // Setup Tauri globals with platform-specific config
  setupTauriEnvironment(PLATFORM_CONFIGS[testPlatform]);
});

afterEach(() => {
  // Reset mocks between tests for isolation
  resetTauriMocks();
  // Restore platform config
  setupTauriEnvironment(PLATFORM_CONFIGS[testPlatform]);
});

afterAll(() => {
  teardownTauriEnvironment();
});

// ============================================
// Mock Tauri Modules
// ============================================

// Mock @tauri-apps/plugin-shell
vi.mock('@tauri-apps/plugin-shell', () => mockPluginShell);

// Mock @tauri-apps/api/path
vi.mock('@tauri-apps/api/path', () => mockApiPath);

// Mock @tauri-apps/plugin-os
vi.mock('@tauri-apps/plugin-os', () => mockPluginOs);

// ============================================
// Additional Tauri-specific mocks
// ============================================

// Mock the Tauri invoke function for custom commands
const mockInvoke = vi.fn(async (cmd: string, args?: Record<string, unknown>) => {
  console.log(`Tauri invoke called: ${cmd}`, args);
  
  // Add specific command handlers here if needed
  switch (cmd) {
    case 'get_app_version':
      return '0.1.0';
    case 'get_app_name':
      return 'TaskPlex';
    default:
      return null;
  }
});

vi.mock('@tauri-apps/api/core', () => ({
  invoke: mockInvoke,
}));

// Export for use in tests
export { mockInvoke };


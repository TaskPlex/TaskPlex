/**
 * Tauri API Mocks for testing
 * Provides mock implementations of Tauri APIs for unit and integration tests
 */

import { vi } from 'vitest';

// ============================================
// Types
// ============================================

export type MockPlatform = 'linux' | 'windows' | 'macos';

export interface TauriMockConfig {
  platform?: MockPlatform;
  downloadDir?: string;
  appDataDir?: string;
  enableShell?: boolean;
}

// ============================================
// Mock State
// ============================================

let mockConfig: TauriMockConfig = {
  platform: 'linux',
  downloadDir: '/home/user/Downloads',
  appDataDir: '/home/user/.local/share/taskplex',
  enableShell: true,
};

// Track shell commands for assertions
export const shellCommandHistory: Array<{
  command: string;
  args?: string[];
  timestamp: number;
}> = [];

// Track opened paths/URLs
export const openedPaths: string[] = [];

// ============================================
// Mock Functions
// ============================================

export const mockShellOpen = vi.fn(async (path: string): Promise<void> => {
  openedPaths.push(path);
});

export const mockShellCommand = vi.fn(async (
  command: string,
  args?: string[]
): Promise<{ stdout: string; stderr: string; code: number }> => {
  shellCommandHistory.push({ command, args, timestamp: Date.now() });
  return { stdout: '', stderr: '', code: 0 };
});

export const mockPlatform = vi.fn(async (): Promise<MockPlatform> => {
  return mockConfig.platform || 'linux';
});

export const mockDownloadDir = vi.fn(async (): Promise<string> => {
  return mockConfig.downloadDir || '/home/user/Downloads';
});

export const mockAppDataDir = vi.fn(async (): Promise<string> => {
  return mockConfig.appDataDir || '/home/user/.local/share/taskplex';
});

// ============================================
// Setup Functions
// ============================================

/**
 * Configure mock behavior
 */
export function configureTauriMock(config: Partial<TauriMockConfig>): void {
  mockConfig = { ...mockConfig, ...config };
}

/**
 * Reset all mocks and state
 */
export function resetTauriMocks(): void {
  mockConfig = {
    platform: 'linux',
    downloadDir: '/home/user/Downloads',
    appDataDir: '/home/user/.local/share/taskplex',
    enableShell: true,
  };
  
  shellCommandHistory.length = 0;
  openedPaths.length = 0;
  
  mockShellOpen.mockClear();
  mockShellCommand.mockClear();
  mockPlatform.mockClear();
  mockDownloadDir.mockClear();
  mockAppDataDir.mockClear();
}

/**
 * Setup Tauri window globals for testing
 * Call this in setupTests.ts or at the start of test files
 */
export function setupTauriEnvironment(config?: Partial<TauriMockConfig>): void {
  if (config) {
    configureTauriMock(config);
  }

  // Set Tauri internals on window
  Object.defineProperty(window, '__TAURI_INTERNALS__', {
    value: {
      invoke: vi.fn(),
      transformCallback: vi.fn(),
    },
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window, '__TAURI__', {
    value: { invoke: vi.fn() },
    writable: true,
    configurable: true,
  });
}

/**
 * Remove Tauri environment (simulate web environment)
 */
export function teardownTauriEnvironment(): void {
  // @ts-expect-error - Removing property for testing
  delete window.__TAURI_INTERNALS__;
  // @ts-expect-error - Removing property for testing
  delete window.__TAURI__;
}

// ============================================
// Module Mocks (for vi.mock)
// ============================================

/**
 * Mock for @tauri-apps/plugin-shell
 */
export const mockPluginShell = {
  open: mockShellOpen,
  Command: class MockCommand {
    program: string;
    args: string[];
    
    constructor(program: string, args?: string[]) {
      this.program = program;
      this.args = args || [];
    }
    
    async execute(): Promise<{ stdout: string; stderr: string; code: number }> {
      return mockShellCommand(this.program, this.args);
    }
    
    spawn(): Promise<{ pid: number; kill: () => void }> {
      shellCommandHistory.push({ 
        command: this.program, 
        args: this.args, 
        timestamp: Date.now() 
      });
      return Promise.resolve({
        pid: 12345,
        kill: vi.fn(),
      });
    }
  },
};

/**
 * Mock for @tauri-apps/api/path
 */
export const mockApiPath = {
  downloadDir: mockDownloadDir,
  appDataDir: mockAppDataDir,
  homeDir: vi.fn(async () => '/home/user'),
  desktopDir: vi.fn(async () => '/home/user/Desktop'),
  documentDir: vi.fn(async () => '/home/user/Documents'),
  tempDir: vi.fn(async () => '/tmp'),
};

/**
 * Mock for @tauri-apps/plugin-os
 */
export const mockPluginOs = {
  platform: mockPlatform,
  arch: vi.fn(async () => 'x86_64'),
  type: vi.fn(async () => 'Linux'),
  version: vi.fn(async () => '6.0.0'),
  hostname: vi.fn(async () => 'test-host'),
};

// ============================================
// Platform-specific configurations
// ============================================

export const PLATFORM_CONFIGS = {
  linux: {
    platform: 'linux' as MockPlatform,
    downloadDir: '/home/user/Downloads',
    appDataDir: '/home/user/.local/share/taskplex',
  },
  windows: {
    platform: 'windows' as MockPlatform,
    downloadDir: 'C:\\Users\\User\\Downloads',
    appDataDir: 'C:\\Users\\User\\AppData\\Local\\taskplex',
  },
  macos: {
    platform: 'macos' as MockPlatform,
    downloadDir: '/Users/user/Downloads',
    appDataDir: '/Users/user/Library/Application Support/taskplex',
  },
};

/**
 * Configure mocks for specific platform
 */
export function setupPlatformMocks(platform: MockPlatform): void {
  const config = PLATFORM_CONFIGS[platform];
  configureTauriMock(config);
  setupTauriEnvironment(config);
}


/**
 * Environment detection utilities
 * Detects runtime environment: Web, Tauri Linux, Tauri Windows, Tauri macOS
 */

export type Platform = 'web' | 'linux' | 'windows' | 'macos' | 'unknown';
export type Runtime = 'browser' | 'tauri';

export interface EnvironmentInfo {
  runtime: Runtime;
  platform: Platform;
  isTauri: boolean;
  isWeb: boolean;
  isDesktop: boolean;
  isLinux: boolean;
  isWindows: boolean;
  isMacOS: boolean;
}

// Cache the environment info to avoid repeated checks
let cachedEnv: EnvironmentInfo | null = null;

/**
 * Check if running in Tauri environment
 */
export function isTauri(): boolean {
  try {
    return typeof window !== 'undefined' && 
           ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
  } catch {
    return false;
  }
}

/**
 * Detect the current platform (OS)
 */
export async function detectPlatform(): Promise<Platform> {
  if (!isTauri()) {
    return 'web';
  }

  try {
    const { platform } = await import('@tauri-apps/plugin-os');
    const os = await platform();
    
    switch (os) {
      case 'linux':
        return 'linux';
      case 'windows':
        return 'windows';
      case 'macos':
        return 'macos';
      default:
        return 'unknown';
    }
  } catch {
    // Fallback: try to detect from user agent
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('linux')) return 'linux';
    if (ua.includes('win')) return 'windows';
    if (ua.includes('mac')) return 'macos';
    return 'unknown';
  }
}

/**
 * Get complete environment information
 */
export async function getEnvironment(): Promise<EnvironmentInfo> {
  if (cachedEnv) {
    return cachedEnv;
  }

  const tauriEnv = isTauri();
  const platform = await detectPlatform();

  cachedEnv = {
    runtime: tauriEnv ? 'tauri' : 'browser',
    platform,
    isTauri: tauriEnv,
    isWeb: !tauriEnv,
    isDesktop: tauriEnv,
    isLinux: platform === 'linux',
    isWindows: platform === 'windows',
    isMacOS: platform === 'macos',
  };

  return cachedEnv;
}

/**
 * Synchronous check for Tauri (use in components)
 */
export function getEnvironmentSync(): Pick<EnvironmentInfo, 'runtime' | 'isTauri' | 'isWeb' | 'isDesktop'> {
  const tauriEnv = isTauri();
  return {
    runtime: tauriEnv ? 'tauri' : 'browser',
    isTauri: tauriEnv,
    isWeb: !tauriEnv,
    isDesktop: tauriEnv,
  };
}

/**
 * Reset cached environment (useful for testing)
 */
export function resetEnvironmentCache(): void {
  cachedEnv = null;
}


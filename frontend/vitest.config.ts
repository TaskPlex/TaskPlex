/// <reference types="vitest" />
import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// Environment configuration
const testEnv = process.env.TEST_ENV || 'web';
const testPlatform = process.env.TEST_PLATFORM || 'linux';

// Configuration based on test environment
const getSetupFiles = () => {
  const baseSetup = './src/setupTests.ts';
  
  if (testEnv === 'tauri') {
    return [baseSetup, './src/__tests__/setup/tauri.setup.ts'];
  }
  
  return [baseSetup];
};

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/mocks': path.resolve(__dirname, './src/mocks'),
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: getSetupFiles(),
    css: true,
    
    // Environment variables for tests
    env: {
      TEST_ENV: testEnv,
      TEST_PLATFORM: testPlatform,
    },
    
    // Test file patterns
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      ...configDefaults.exclude,
      'src/__tests__/e2e/**',
      'src/__tests__/benchmark/**',
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src-tauri/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/*.bench.{ts,tsx}',
        '**/test-utils.tsx',
        '**/mocks/**',
        '**/__tests__/**',
      ],
      thresholds: {
        lines: 55,
        functions: 50,
        branches: 40,
        statements: 55,
      },
    },
    
    // Performance settings
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Pool configuration for parallel testing
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4,
      },
    },
    
    // Retry failed tests
    retry: process.env.CI ? 2 : 0,
    
    // Reporters
    reporters: process.env.CI 
      ? ['default', 'junit'] 
      : ['default'],
    outputFile: {
      junit: './test-results/junit.xml',
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          'pdf-vendor': ['react-pdf', 'pdfjs-dist'],
          'ui-vendor': ['lucide-react', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});


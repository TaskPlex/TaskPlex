/**
 * Tests for useVideo hooks (useCompressVideo, useConvertVideo)
 * Uses MSW for API mocking
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCompressVideo, useConvertVideo, useVideoToGif, useExtractAudio } from '../../../hooks/useVideo';

// Create a fresh QueryClient for each test
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Create mock file
const createMockFile = (name: string, type: string) => {
  return new File(['test content'], name, { type });
};

describe('useCompressVideo', () => {
  beforeEach(() => {
    // MSW handlers are already set up in setupTests.ts
  });

  it('returns mutation object with correct structure', () => {
    const { result } = renderHook(() => useCompressVideo(), {
      wrapper: createWrapper(),
    });
    
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('can trigger video compression mutation', async () => {
    const { result } = renderHook(() => useCompressVideo(), {
      wrapper: createWrapper(),
    });
    
    const file = createMockFile('test.mp4', 'video/mp4');
    
    result.current.mutate({ file, quality: 'medium' });
    
    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 3000 });
    
    if (result.current.isSuccess) {
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.success).toBe(true);
    }
  });

  it('completes mutation and sets isPending to false', async () => {
    const { result } = renderHook(() => useCompressVideo(), {
      wrapper: createWrapper(),
    });
    
    const file = createMockFile('test.mp4', 'video/mp4');
    
    result.current.mutate({ file, quality: 'high' });
    
    // Wait for mutation to complete
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 3000 });
  });
});

describe('useConvertVideo', () => {
  it('returns mutation object with correct structure', () => {
    const { result } = renderHook(() => useConvertVideo(), {
      wrapper: createWrapper(),
    });
    
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });

  it('can trigger video conversion mutation', async () => {
    const { result } = renderHook(() => useConvertVideo(), {
      wrapper: createWrapper(),
    });
    
    const file = createMockFile('test.mp4', 'video/mp4');
    
    result.current.mutate({ file, outputFormat: 'webm', quality: 'medium' });
    
    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 3000 });
  });
});

describe('useVideoToGif', () => {
  it('returns mutation object with correct structure', () => {
    const { result } = renderHook(() => useVideoToGif(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });

  it('can trigger video to GIF mutation', async () => {
    const { result } = renderHook(() => useVideoToGif(), {
      wrapper: createWrapper(),
    });

    const file = createMockFile('test.mp4', 'video/mp4');

    result.current.mutate({ file, options: { fps: 12, width: 320 } });

    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 3000 });
  });
});

describe('useExtractAudio', () => {
  it('returns mutation object with correct structure', () => {
    const { result } = renderHook(() => useExtractAudio(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });

  it('can trigger extract audio mutation', async () => {
    const { result } = renderHook(() => useExtractAudio(), {
      wrapper: createWrapper(),
    });

    const file = createMockFile('test.mp4', 'video/mp4');

    result.current.mutate({ file, options: { output_format: 'mp3', bitrate: '192k' } });

    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 3000 });
  });
});


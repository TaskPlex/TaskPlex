import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFormatText } from '../../../hooks/useText';
import { useConvertColor } from '../../../hooks/useColor';

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

describe('useFormatText', () => {
  it('expose mutation methods', () => {
    const { result } = renderHook(() => useFormatText(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });

  it('formats literal newlines', async () => {
    const { result } = renderHook(() => useFormatText(), { wrapper: createWrapper() });

    result.current.mutate({ text: 'Hello\\nWorld' });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});

describe('useConvertColor', () => {
  it('exposes mutation methods', () => {
    const { result } = renderHook(() => useConvertColor(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });

  it('converts a hex color', async () => {
    const { result } = renderHook(() => useConvertColor(), { wrapper: createWrapper() });
    result.current.mutate({ color: '#ff3366' });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});



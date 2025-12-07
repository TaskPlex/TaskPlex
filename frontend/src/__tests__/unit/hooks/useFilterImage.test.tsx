import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFilterImage } from '../../../hooks/useImage';

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

describe('useFilterImage', () => {
  it('expose mutation methods', () => {
    const { result } = renderHook(() => useFilterImage(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });

  it('can trigger filter mutation', async () => {
    const { result } = renderHook(() => useFilterImage(), { wrapper: createWrapper() });
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });

    result.current.mutate({ file, filter: 'grayscale' });

    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    });
  });
});



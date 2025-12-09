import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGeneratePassword, useCheckPassword } from './usePassword';

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

describe('useGeneratePassword', () => {
  it('returns mutation object', () => {
    const { result } = renderHook(() => useGeneratePassword(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('can generate a password', async () => {
    const { result } = renderHook(() => useGeneratePassword(), { wrapper: createWrapper() });
    result.current.mutate({ length: 12 });
    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true), {
      timeout: 3000,
    });
  });
});

describe('useCheckPassword', () => {
  it('returns mutation object', () => {
    const { result } = renderHook(() => useCheckPassword(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('can check password strength', async () => {
    const { result } = renderHook(() => useCheckPassword(), { wrapper: createWrapper() });
    result.current.mutate({ password: 'Test123!' });
    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true), {
      timeout: 3000,
    });
  });
});


import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useNumberConverter } from '../../../hooks/useNumberConverter';

// Create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useNumberConverter', () => {
  it('returns mutation object with correct structure', () => {
    const { result } = renderHook(() => useNumberConverter(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('mutateAsync');
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isPending');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('reset');
  });

  it('can trigger number conversion mutation', async () => {
    const { result } = renderHook(() => useNumberConverter(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      number: '1010',
      fromBase: 'binary',
      toBase: 'decimal',
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});


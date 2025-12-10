import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useJSONDataGenerator } from '../../../hooks/useJSONDataGenerator';

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

describe('useJSONDataGenerator', () => {
  it('returns mutation object with correct structure', () => {
    const { result } = renderHook(() => useJSONDataGenerator(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('mutateAsync');
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isPending');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('reset');
  });

  it('can trigger JSON data generation mutation', async () => {
    const { result } = renderHook(() => useJSONDataGenerator(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      template: '{"id": "{{regex:\\d{1,3}}}"}',
      iterations: 3,
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});


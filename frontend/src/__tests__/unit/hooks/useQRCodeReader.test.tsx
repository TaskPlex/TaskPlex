import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useQRCodeReader } from '../../../hooks/useQRCodeReader';

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

describe('useQRCodeReader', () => {
  it('returns mutation object with correct structure', () => {
    const { result } = renderHook(() => useQRCodeReader(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('mutateAsync');
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isPending');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('reset');
  });

  it('can trigger QR code reading mutation', async () => {
    const { result } = renderHook(() => useQRCodeReader(), {
      wrapper: createWrapper(),
    });

    const file = new File(['test'], 'test.png', { type: 'image/png' });

    result.current.mutate(file);

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});


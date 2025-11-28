/**
 * Benchmark tests for React hooks
 * Measures performance of critical hooks under load
 *
 * Run with: npm run test:bench
 */

import { describe, bench } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ============================================
// Test Wrapper
// ============================================

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

// ============================================
// State Management Benchmarks
// ============================================

describe('State Management Performance', () => {
  bench('useState updates (1000 iterations)', () => {
    const useCounter = () => {
      const [count, setCount] = React.useState(0);
      return { count, increment: () => setCount((c) => c + 1) };
    };

    const { result } = renderHook(() => useCounter());
    
    for (let i = 0; i < 1000; i++) {
      act(() => {
        result.current.increment();
      });
    }
  });

  bench('useReducer updates (1000 iterations)', () => {
    type Action = { type: 'increment' } | { type: 'decrement' };
    
    const reducer = (state: number, action: Action) => {
      switch (action.type) {
        case 'increment':
          return state + 1;
        case 'decrement':
          return state - 1;
        default:
          return state;
      }
    };

    const useCounterReducer = () => {
      const [count, dispatch] = React.useReducer(reducer, 0);
      return { count, dispatch };
    };

    const { result } = renderHook(() => useCounterReducer());
    
    for (let i = 0; i < 1000; i++) {
      act(() => {
        result.current.dispatch({ type: 'increment' });
      });
    }
  });
});

// ============================================
// Memoization Benchmarks
// ============================================

describe('Memoization Performance', () => {
  bench('useMemo with complex calculation', () => {
    const useExpensiveCalculation = (n: number) => {
      return React.useMemo(() => {
        // Simulate expensive calculation
        let result = 0;
        for (let i = 0; i < n; i++) {
          result += Math.sqrt(i) * Math.sin(i);
        }
        return result;
      }, [n]);
    };

    const { rerender } = renderHook(
      ({ n }) => useExpensiveCalculation(n),
      { initialProps: { n: 1000 } }
    );

    // Should use cached value
    for (let i = 0; i < 100; i++) {
      rerender({ n: 1000 });
    }
  });

  bench('useCallback stability', () => {
    const useStableCallback = () => {
      const [count, setCount] = React.useState(0);
      const callback = React.useCallback(() => {
        setCount((c) => c + 1);
      }, []);
      return { count, callback };
    };

    const { result, rerender } = renderHook(() => useStableCallback());
    const initialCallback = result.current.callback;

    for (let i = 0; i < 100; i++) {
      rerender();
      // Callback reference should remain stable
      if (result.current.callback !== initialCallback) {
        throw new Error('Callback reference changed');
      }
    }
  });
});

// ============================================
// Effect Benchmarks
// ============================================

describe('Effect Performance', () => {
  bench('useEffect cleanup cycle', () => {
    const useEffectWithCleanup = () => {
      const [count, setCount] = React.useState(0);
      
      React.useEffect(() => {
        const timer = setTimeout(() => {}, 0);
        return () => clearTimeout(timer);
      }, [count]);

      return { count, increment: () => setCount((c) => c + 1) };
    };

    const { result } = renderHook(() => useEffectWithCleanup());

    for (let i = 0; i < 100; i++) {
      act(() => {
        result.current.increment();
      });
    }
  });
});

// ============================================
// React Query Benchmarks
// ============================================

describe('React Query Performance', () => {
  bench('Query client cache operations', () => {
    const wrapper = createWrapper();
    
    const useQueryCache = () => {
      const queryClient = new QueryClient();
      
      return {
        setData: (key: string, data: unknown) => {
          queryClient.setQueryData([key], data);
        },
        getData: (key: string) => {
          return queryClient.getQueryData([key]);
        },
      };
    };

    const { result } = renderHook(() => useQueryCache(), { wrapper });

    for (let i = 0; i < 1000; i++) {
      result.current.setData(`key-${i}`, { value: i });
      result.current.getData(`key-${i}`);
    }
  });
});

// ============================================
// Array/Object Processing Benchmarks
// ============================================

describe('Data Processing Performance', () => {
  bench('Large array filtering (10000 items)', () => {
    const items = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      active: i % 2 === 0,
    }));

    const useFilteredItems = (filter: boolean) => {
      return React.useMemo(
        () => items.filter((item) => item.active === filter),
        [filter]
      );
    };

    const { result, rerender } = renderHook(
      ({ filter }) => useFilteredItems(filter),
      { initialProps: { filter: true } }
    );

    // Toggle filter
    for (let i = 0; i < 10; i++) {
      rerender({ filter: i % 2 === 0 });
    }

    // Access result to ensure it's computed
    if (result.current.length === 0) {
      throw new Error('Empty result');
    }
  });

  bench('Object spread updates (1000 iterations)', () => {
    interface State {
      data: Record<string, number>;
    }

    const useObjectState = () => {
      const [state, setState] = React.useState<State>({ data: {} });
      
      const updateKey = (key: string, value: number) => {
        setState((prev) => ({
          ...prev,
          data: { ...prev.data, [key]: value },
        }));
      };

      return { state, updateKey };
    };

    const { result } = renderHook(() => useObjectState());

    for (let i = 0; i < 1000; i++) {
      act(() => {
        result.current.updateKey(`key-${i}`, i);
      });
    }
  });
});


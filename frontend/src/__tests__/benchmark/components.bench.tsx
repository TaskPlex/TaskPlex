/**
 * Benchmark tests for React components
 * Measures rendering performance of UI components
 *
 * Run with: npm run test:bench
 */

import { describe, bench } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { DownloadNotificationProvider } from '@/contexts/DownloadNotificationContext';

// ============================================
// Test Wrapper
// ============================================

// eslint-disable-next-line react-refresh/only-export-components
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider>
        <DownloadNotificationProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </DownloadNotificationProvider>
      </FavoritesProvider>
    </QueryClientProvider>
  );
}

// ============================================
// Simple Component Benchmarks
// ============================================

describe('Simple Component Rendering', () => {
  bench('Button render (100 iterations)', () => {
    const Button = ({ label }: { label: string }) => (
      <button className="px-4 py-2 bg-blue-500 text-white rounded">
        {label}
      </button>
    );

    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Button label={`Button ${i}`} />);
      unmount();
    }
  });

  bench('Card component render', () => {
    const Card = ({ title, content }: { title: string; content: string }) => (
      <div className="p-4 border rounded-lg shadow">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-gray-600">{content}</p>
      </div>
    );

    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <Card title={`Card ${i}`} content="Lorem ipsum dolor sit amet" />
      );
      unmount();
    }
  });
});

// ============================================
// List Rendering Benchmarks
// ============================================

describe('List Rendering Performance', () => {
  const items = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `Description for item ${i}`,
  }));

  bench('Render list of 100 items', () => {
    const List = () => (
      <ul>
        {items.map((item) => (
          <li key={item.id} className="p-2 border-b">
            <span className="font-bold">{item.name}</span>
            <p className="text-sm text-gray-500">{item.description}</p>
          </li>
        ))}
      </ul>
    );

    const { unmount } = render(<List />);
    unmount();
  });

  bench('Render virtualized-like list (windowed)', () => {
    const VirtualList = ({ visibleStart = 0, visibleEnd = 20 }) => (
      <div className="h-96 overflow-auto">
        <div style={{ height: visibleStart * 50 }} />
        <ul>
          {items.slice(visibleStart, visibleEnd).map((item) => (
            <li key={item.id} className="h-12 p-2 border-b">
              <span className="font-bold">{item.name}</span>
            </li>
          ))}
        </ul>
        <div style={{ height: (items.length - visibleEnd) * 50 }} />
      </div>
    );

    for (let i = 0; i < 10; i++) {
      const { unmount } = render(
        <VirtualList visibleStart={i * 10} visibleEnd={i * 10 + 20} />
      );
      unmount();
    }
  });
});

// ============================================
// Form Component Benchmarks
// ============================================

describe('Form Component Performance', () => {
  bench('Form with multiple inputs', () => {
    const Form = () => {
      const [values, setValues] = React.useState({
        name: '',
        email: '',
        password: '',
        confirm: '',
      });

      const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues((prev) => ({ ...prev, [field]: e.target.value }));
      };

      return (
        <form className="space-y-4">
          <input
            type="text"
            value={values.name}
            onChange={handleChange('name')}
            placeholder="Name"
            className="border p-2 rounded"
          />
          <input
            type="email"
            value={values.email}
            onChange={handleChange('email')}
            placeholder="Email"
            className="border p-2 rounded"
          />
          <input
            type="password"
            value={values.password}
            onChange={handleChange('password')}
            placeholder="Password"
            className="border p-2 rounded"
          />
          <input
            type="password"
            value={values.confirm}
            onChange={handleChange('confirm')}
            placeholder="Confirm Password"
            className="border p-2 rounded"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Submit
          </button>
        </form>
      );
    };

    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Form />);
      unmount();
    }
  });
});

// ============================================
// Context Provider Benchmarks
// ============================================

describe('Context Provider Performance', () => {
  bench('Deeply nested providers', () => {
    const Context1 = React.createContext({ value: 1 });
    const Context2 = React.createContext({ value: 2 });
    const Context3 = React.createContext({ value: 3 });
    const Context4 = React.createContext({ value: 4 });
    const Context5 = React.createContext({ value: 5 });

    const DeepComponent = () => {
      const c1 = React.useContext(Context1);
      const c2 = React.useContext(Context2);
      const c3 = React.useContext(Context3);
      const c4 = React.useContext(Context4);
      const c5 = React.useContext(Context5);

      return (
        <div>
          {c1.value + c2.value + c3.value + c4.value + c5.value}
        </div>
      );
    };

    const NestedProviders = () => (
      <Context1.Provider value={{ value: 1 }}>
        <Context2.Provider value={{ value: 2 }}>
          <Context3.Provider value={{ value: 3 }}>
            <Context4.Provider value={{ value: 4 }}>
              <Context5.Provider value={{ value: 5 }}>
                <DeepComponent />
              </Context5.Provider>
            </Context4.Provider>
          </Context3.Provider>
        </Context2.Provider>
      </Context1.Provider>
    );

    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NestedProviders />);
      unmount();
    }
  });

  bench('App providers render', () => {
    const SimpleApp = () => (
      <div>
        <h1>TaskPlex</h1>
        <p>Application content</p>
      </div>
    );

    for (let i = 0; i < 20; i++) {
      const { unmount } = render(
        <TestWrapper>
          <SimpleApp />
        </TestWrapper>
      );
      unmount();
    }
  });
});

// ============================================
// Conditional Rendering Benchmarks
// ============================================

describe('Conditional Rendering Performance', () => {
  bench('Toggle visibility (100 toggles)', () => {
    const ToggledComponent = ({ visible }: { visible: boolean }) => (
      <div>
        {visible && (
          <div className="p-4 bg-gray-100">
            <h2>Visible Content</h2>
            <p>This content is conditionally rendered</p>
            <ul>
              {[1, 2, 3, 4, 5].map((n) => (
                <li key={n}>Item {n}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );

    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ToggledComponent visible={i % 2 === 0} />);
      unmount();
    }
  });

  bench('Switch between components', () => {
    const ComponentA = () => <div className="p-4 bg-blue-100">Component A</div>;
    const ComponentB = () => <div className="p-4 bg-green-100">Component B</div>;
    const ComponentC = () => <div className="p-4 bg-red-100">Component C</div>;

    const Switcher = ({ active }: { active: 'a' | 'b' | 'c' }) => {
      switch (active) {
        case 'a':
          return <ComponentA />;
        case 'b':
          return <ComponentB />;
        case 'c':
          return <ComponentC />;
      }
    };

    const states: Array<'a' | 'b' | 'c'> = ['a', 'b', 'c'];
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Switcher active={states[i % 3]} />);
      unmount();
    }
  });
});


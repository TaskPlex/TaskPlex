/**
 * Tests for useTaskProgress hook
 * Tests SSE-based task progress tracking functionality
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTaskProgress } from '../../../hooks/useTaskProgress';

// Mock EventSource
class MockEventSource {
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  listeners: Map<string, ((event: MessageEvent) => void)[]> = new Map();
  readyState = 0;

  constructor(url: string) {
    this.url = url;
    this.readyState = 1; // OPEN
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: (event: MessageEvent) => void) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  close() {
    this.readyState = 2; // CLOSED
  }

  // Test helpers
  simulateProgress(percent: number, message?: string) {
    const event = new MessageEvent('progress', {
      data: JSON.stringify({ percent, message }),
    });
    this.listeners.get('progress')?.forEach(listener => listener(event));
  }

  simulateComplete(result: object) {
    const event = new MessageEvent('complete', {
      data: JSON.stringify(result),
    });
    this.listeners.get('complete')?.forEach(listener => listener(event));
  }

  simulateError(message: string) {
    const event = new MessageEvent('error', {
      data: JSON.stringify({ message }),
    });
    this.listeners.get('error')?.forEach(listener => listener(event));
  }
}

// Store for accessing mock EventSource instances
let mockEventSourceInstance: MockEventSource | null = null;

// Factory function to create MockEventSource and store reference
function createMockEventSource(url: string): MockEventSource {
  const instance = new MockEventSource(url);
  mockEventSourceInstance = instance;
  return instance;
}

// Mock the global EventSource
vi.stubGlobal('EventSource', createMockEventSource);

describe('useTaskProgress', () => {
  beforeEach(() => {
    mockEventSourceInstance = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should have initial idle state', () => {
    const { result } = renderHook(() => useTaskProgress());

    expect(result.current.status).toBe('idle');
    expect(result.current.progress).toBe(0);
    expect(result.current.taskId).toBeNull();
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should call API function when startTask is called', async () => {
    const { result } = renderHook(() => useTaskProgress());

    const mockApiCall = vi.fn().mockResolvedValue({ task_id: 'test-task-123' });

    await act(async () => {
      await result.current.startTask(mockApiCall);
    });

    // API should have been called
    expect(mockApiCall).toHaveBeenCalledTimes(1);
    // Should have passed abort signal
    expect(mockApiCall).toHaveBeenCalledWith(expect.any(AbortSignal));
  });

  it('should transition to processing state after receiving task_id', async () => {
    const { result } = renderHook(() => useTaskProgress());

    const mockApiCall = vi.fn().mockResolvedValue({ task_id: 'test-task-123' });

    await act(async () => {
      await result.current.startTask(mockApiCall);
    });

    // Wait for processing state
    await waitFor(() => {
      expect(result.current.status).toBe('processing');
    });

    expect(result.current.taskId).toBe('test-task-123');
    expect(result.current.isProcessing).toBe(true);
    expect(mockEventSourceInstance).not.toBeNull();
  });

  it('should update progress when receiving SSE progress events', async () => {
    const { result } = renderHook(() => useTaskProgress());

    const mockApiCall = vi.fn().mockResolvedValue({ task_id: 'test-task-123' });

    await act(async () => {
      await result.current.startTask(mockApiCall);
    });

    // Wait for SSE connection
    await waitFor(() => {
      expect(mockEventSourceInstance).not.toBeNull();
    });

    // Simulate progress events
    await act(async () => {
      mockEventSourceInstance!.simulateProgress(25, 'Analyzing...');
    });

    expect(result.current.progress).toBe(25);
    expect(result.current.message).toBe('Analyzing...');

    await act(async () => {
      mockEventSourceInstance!.simulateProgress(50, 'Encoding...');
    });

    expect(result.current.progress).toBe(50);
    expect(result.current.message).toBe('Encoding...');
  });

  it('should transition to completed state on SSE complete event', async () => {
    const { result } = renderHook(() => useTaskProgress());

    const mockApiCall = vi.fn().mockResolvedValue({ task_id: 'test-task-123' });

    await act(async () => {
      await result.current.startTask(mockApiCall);
    });

    await waitFor(() => {
      expect(mockEventSourceInstance).not.toBeNull();
    });

    const mockResult = {
      success: true,
      download_url: '/download/video.mp4',
      compression_ratio: 50,
    };

    await act(async () => {
      mockEventSourceInstance!.simulateComplete(mockResult);
    });

    expect(result.current.status).toBe('completed');
    expect(result.current.progress).toBe(100);
    expect(result.current.isCompleted).toBe(true);
    expect(result.current.result).toEqual(mockResult);
    expect(mockEventSourceInstance!.readyState).toBe(2); // CLOSED
  });

  it('should transition to error state on SSE error event', async () => {
    const { result } = renderHook(() => useTaskProgress());

    const mockApiCall = vi.fn().mockResolvedValue({ task_id: 'test-task-123' });

    await act(async () => {
      await result.current.startTask(mockApiCall);
    });

    await waitFor(() => {
      expect(mockEventSourceInstance).not.toBeNull();
    });

    await act(async () => {
      mockEventSourceInstance!.simulateError('Processing failed');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe('Processing failed');
    expect(mockEventSourceInstance!.readyState).toBe(2); // CLOSED
  });

  it('should handle API call failure', async () => {
    const { result } = renderHook(() => useTaskProgress());

    const mockApiCall = vi.fn().mockRejectedValue(new Error('Network error'));

    await act(async () => {
      await result.current.startTask(mockApiCall);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.isError).toBe(true);
  });

  it('should handle missing task_id in response', async () => {
    const { result } = renderHook(() => useTaskProgress());

    const mockApiCall = vi.fn().mockResolvedValue({});

    await act(async () => {
      await result.current.startTask(mockApiCall);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.error).toBe('No task_id received from server');
  });

  it('should cancel task when cancel is called', async () => {
    const { result } = renderHook(() => useTaskProgress());

    const mockApiCall = vi.fn().mockResolvedValue({ task_id: 'test-task-123' });

    await act(async () => {
      await result.current.startTask(mockApiCall);
    });

    await waitFor(() => {
      expect(mockEventSourceInstance).not.toBeNull();
    });

    await act(async () => {
      result.current.cancel();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.progress).toBe(0);
    expect(result.current.message).toBe('Cancelled');
    expect(mockEventSourceInstance!.readyState).toBe(2); // CLOSED
  });

  it('should reset to initial state when reset is called', async () => {
    const { result } = renderHook(() => useTaskProgress());

    const mockApiCall = vi.fn().mockResolvedValue({ task_id: 'test-task-123' });

    await act(async () => {
      await result.current.startTask(mockApiCall);
    });

    await waitFor(() => {
      expect(mockEventSourceInstance).not.toBeNull();
    });

    await act(async () => {
      mockEventSourceInstance!.simulateProgress(50);
    });

    await act(async () => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.progress).toBe(0);
    expect(result.current.message).toBe('');
    expect(result.current.taskId).toBeNull();
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should provide correct boolean flags throughout lifecycle', async () => {
    const { result } = renderHook(() => useTaskProgress());

    // Initial state
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isLoading).toBe(false);

    const mockApiCall = vi.fn().mockResolvedValue({ task_id: 'test-task-123' });

    await act(async () => {
      await result.current.startTask(mockApiCall);
    });

    // After API resolves, should be processing
    await waitFor(() => {
      expect(result.current.isProcessing).toBe(true);
    });

    expect(result.current.isIdle).toBe(false);
    expect(result.current.isLoading).toBe(true);

    // Simulate completion
    await act(async () => {
      mockEventSourceInstance!.simulateComplete({ success: true });
    });

    expect(result.current.isCompleted).toBe(true);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});


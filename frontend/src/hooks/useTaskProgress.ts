/**
 * Hook for tracking long-running task progress via Server-Sent Events (SSE)
 * 
 * Usage:
 * const { progress, status, message, result, startTask, reset } = useTaskProgress();
 * 
 * await startTask(() => ApiService.compressVideoAsync(file, quality));
 */
import { useState, useCallback, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export type TaskStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export interface TaskState<T = unknown> {
  taskId: string | null;
  status: TaskStatus;
  progress: number;
  message: string;
  result: T | null;
  error: string | null;
}

interface TaskResponse {
  task_id: string;
}

interface ProgressEvent {
  percent: number;
  message?: string;
  stage?: string;
}

interface CompleteEvent<T> {
  success: boolean;
  download_url?: string;
  filename?: string;
  original_size?: number;
  processed_size?: number;
  data?: T;
}

interface ErrorEvent {
  message: string;
  code?: string;
}

export function useTaskProgress<T = unknown>() {
  const [state, setState] = useState<TaskState<T>>({
    taskId: null,
    status: 'idle',
    progress: 0,
    message: '',
    result: null,
    error: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Clean up SSE connection
   */
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Connect to SSE stream for task progress
   */
  const connectToStream = useCallback((taskId: string) => {
    cleanup();

    const eventSource = new EventSource(`${API_URL}/tasks/${taskId}/stream`);
    eventSourceRef.current = eventSource;

    // Handle progress updates
    eventSource.addEventListener('progress', (event: MessageEvent) => {
      try {
        const data: ProgressEvent = JSON.parse(event.data);
        setState(prev => ({
          ...prev,
          progress: data.percent,
          message: data.message || data.stage || 'Processing...',
        }));
      } catch (e) {
        console.error('Failed to parse progress event:', e);
      }
    });

    // Handle completion
    eventSource.addEventListener('complete', (event: MessageEvent) => {
      try {
        const data: CompleteEvent<T> = JSON.parse(event.data);
        setState(prev => ({
          ...prev,
          status: 'completed',
          progress: 100,
          message: 'Complete!',
          result: data as T,
        }));
        cleanup();
      } catch (e) {
        console.error('Failed to parse complete event:', e);
      }
    });

    // Handle cancellation
    eventSource.addEventListener('cancelled', () => {
      setState(prev => ({
        ...prev,
        status: 'idle',
        progress: 0,
        message: 'Cancelled',
      }));
      cleanup();
    });

    // Handle errors
    eventSource.addEventListener('error', (event: MessageEvent | Event) => {
      if ('data' in event && event.data) {
        try {
          const data: ErrorEvent = JSON.parse(event.data);
          setState(prev => ({
            ...prev,
            status: 'error',
            error: data.message || 'An error occurred',
          }));
        } catch {
          setState(prev => ({
            ...prev,
            status: 'error',
            error: 'Connection error',
          }));
        }
      } else {
        // SSE connection error
        setState(prev => ({
          ...prev,
          status: 'error',
          error: 'Connection lost',
        }));
      }
      cleanup();
    });

    // Handle generic messages (fallback)
    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.percent !== undefined) {
          setState(prev => ({
            ...prev,
            progress: data.percent,
            message: data.message || 'Processing...',
          }));
        }
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };
  }, [cleanup]);

  /**
   * Start a long-running task
   * @param apiCall - Function that initiates the task and returns { task_id }
   * @param onUploadProgress - Optional callback for upload progress
   */
  const startTask = useCallback(async (
    apiCall: (signal?: AbortSignal) => Promise<TaskResponse>,
    onUploadProgress?: (progress: number) => void
  ) => {
    cleanup();
    
    // Reset state and start uploading
    setState({
      taskId: null,
      status: 'uploading',
      progress: 0,
      message: 'Uploading file...',
      result: null,
      error: null,
    });

    abortControllerRef.current = new AbortController();

    try {
      // Simulate upload progress if callback provided
      if (onUploadProgress) {
        onUploadProgress(0);
      }

      // Call the API to start the task
      const response = await apiCall(abortControllerRef.current.signal);
      
      if (!response.task_id) {
        throw new Error('No task_id received from server');
      }

      // Update state with task ID and connect to SSE
      setState(prev => ({
        ...prev,
        taskId: response.task_id,
        status: 'processing',
        progress: 0,
        message: 'Processing started...',
      }));

      // Connect to SSE stream
      connectToStream(response.task_id);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setState(prev => ({
          ...prev,
          status: 'idle',
          message: 'Cancelled',
        }));
      } else {
        setState(prev => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to start task',
        }));
      }
    }
  }, [cleanup, connectToStream]);

  /**
   * Cancel the current task
   */
  const cancel = useCallback(async () => {
    if (state.taskId) {
      try {
        // Call API to cancel the task on the backend
        await fetch(`${API_URL}/tasks/${state.taskId}/cancel`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Failed to cancel task:', error);
      }
    }
    cleanup();
    setState(prev => ({
      ...prev,
      status: 'idle',
      progress: 0,
      message: 'Cancelled',
      taskId: null,
    }));
  }, [cleanup, state.taskId]);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    cleanup();
    setState({
      taskId: null,
      status: 'idle',
      progress: 0,
      message: '',
      result: null,
      error: null,
    });
  }, [cleanup]);

  return {
    ...state,
    isIdle: state.status === 'idle',
    isUploading: state.status === 'uploading',
    isProcessing: state.status === 'processing',
    isCompleted: state.status === 'completed',
    isError: state.status === 'error',
    isLoading: state.status === 'uploading' || state.status === 'processing',
    startTask,
    cancel,
    reset,
  };
}

export default useTaskProgress;


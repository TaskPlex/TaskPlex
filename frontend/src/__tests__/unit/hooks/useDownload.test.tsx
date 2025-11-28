/**
 * Tests for useDownload hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useDownload } from '@/hooks/useDownload';
import { DownloadNotificationProvider } from '@/contexts/DownloadNotificationContext';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Store original createElement
const originalCreateElement = document.createElement.bind(document);

// Wrapper component with provider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DownloadNotificationProvider>{children}</DownloadNotificationProvider>
);

describe('useDownload', () => {
  let mockLink: HTMLAnchorElement & { click: ReturnType<typeof vi.fn> };
  let createElementSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Create a real anchor element and mock its click method
    mockLink = originalCreateElement('a') as HTMLAnchorElement & { click: ReturnType<typeof vi.fn> };
    mockLink.click = vi.fn();

    // Spy on createElement and return our mock for 'a' elements
    createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return mockLink;
      }
      return originalCreateElement(tag);
    });

    mockFetch.mockReset();
  });

  afterEach(() => {
    createElementSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('downloadDirect', () => {
    it('creates a download link with correct attributes', () => {
      const { result } = renderHook(() => useDownload(), { wrapper });

      act(() => {
        result.current.downloadDirect('http://example.com/file.pdf', 'test.pdf');
      });

      expect(mockLink.href).toBe('http://example.com/file.pdf');
      expect(mockLink.download).toBe('test.pdf');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('extracts filename from URL when not provided', () => {
      const { result } = renderHook(() => useDownload(), { wrapper });

      act(() => {
        result.current.downloadDirect('http://example.com/path/to/document.pdf');
      });

      expect(mockLink.download).toBe('document.pdf');
    });

    it('uses default filename when URL has no filename', () => {
      const { result } = renderHook(() => useDownload(), { wrapper });

      act(() => {
        result.current.downloadDirect('http://example.com/');
      });

      expect(mockLink.download).toBe('download');
    });

    it('calls onSuccess callback', () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useDownload({ onSuccess }), { wrapper });

      act(() => {
        result.current.downloadDirect('http://example.com/file.pdf', 'test.pdf');
      });

      expect(onSuccess).toHaveBeenCalledWith('test.pdf');
    });

    it('triggers link click for download', () => {
      const { result } = renderHook(() => useDownload(), { wrapper });

      act(() => {
        result.current.downloadDirect('http://example.com/file.pdf');
      });

      // The mock link should have been clicked
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('download (with fetch)', () => {
    it('calls fetch for the file', async () => {
      const mockBlob = new Blob(['test content']);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      const { result } = renderHook(() => useDownload(), { wrapper });

      await act(async () => {
        await result.current.download('http://example.com/file.pdf', 'test.pdf');
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('handles fetch error gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      const onError = vi.fn();
      const { result } = renderHook(() => useDownload({ onError }), { wrapper });

      await act(async () => {
        await result.current.download('http://example.com/file.pdf');
      });

      // Should have called onError
      expect(onError).toHaveBeenCalled();
    });

    it('handles network error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const onError = vi.fn();
      const { result } = renderHook(() => useDownload({ onError }), { wrapper });

      await act(async () => {
        await result.current.download('http://example.com/file.pdf');
      });

      expect(onError).toHaveBeenCalled();
    });
  });
});


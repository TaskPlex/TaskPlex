import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { JSONFormatterScreen } from '../../pages/JSONFormatterScreen';
import { renderWithProviders } from '../../test-utils';
import '@testing-library/jest-dom/vitest';

// Mock useJSONFormatter hook
const mockMutate = vi.fn();
const mockReset = vi.fn();

vi.mock('../../hooks/useJSONFormatter', () => ({
  useJSONFormatter: vi.fn(() => ({
    mutate: mockMutate,
    data: null,
    isPending: false,
    error: null,
    reset: mockReset,
  })),
}));

describe('JSONFormatterScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate.mockClear();
    mockReset.mockClear();
  });

  it('renders properly', () => {
    renderWithProviders(<JSONFormatterScreen />);
    expect(screen.getByText('JSON Formatter')).toBeInTheDocument();
  });

  it('displays input and output textareas', () => {
    renderWithProviders(<JSONFormatterScreen />);
    expect(screen.getByPlaceholderText(/Paste your JSON code here/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Formatted JSON will appear here/i)).toBeInTheDocument();
  });

  it('calls mutate when format button is clicked', async () => {
    renderWithProviders(<JSONFormatterScreen />);

    const input = screen.getByPlaceholderText(/Paste your JSON code here/i);
    fireEvent.change(input, { target: { value: '{"test":"value"}' } });

    const formatButton = screen.getByRole('button', { name: /Format JSON/i });
    fireEvent.click(formatButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('displays formatted result when format is successful', async () => {
    const { useJSONFormatter } = await import('../../hooks/useJSONFormatter');
    const mockResponse = {
      success: true,
      message: 'JSON formatted successfully',
      result: '{\n  "test": "value"\n}',
      original_size: 15,
      result_size: 20,
    };

    vi.mocked(useJSONFormatter).mockReturnValue({
      mutate: mockMutate,
      data: mockResponse,
      isPending: false,
      error: null,
      reset: mockReset,
    });

    renderWithProviders(<JSONFormatterScreen />);

    await waitFor(() => {
      expect(screen.getByText(/JSON formatted successfully/i)).toBeInTheDocument();
    });
  });

  it('displays error message on failure', async () => {
    const { useJSONFormatter } = await import('../../hooks/useJSONFormatter');
    const mockError = new Error('Invalid JSON');

    vi.mocked(useJSONFormatter).mockReturnValue({
      mutate: mockMutate,
      data: null,
      isPending: false,
      error: mockError,
      reset: mockReset,
    });

    renderWithProviders(<JSONFormatterScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON/i)).toBeInTheDocument();
    });
  });
});




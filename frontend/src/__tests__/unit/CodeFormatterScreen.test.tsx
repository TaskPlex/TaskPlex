import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { CodeFormatterScreen } from '../../pages/CodeFormatterScreen';
import { renderWithProviders } from '../../test-utils';
import '@testing-library/jest-dom/vitest';

// Mock useCodeFormatter hook
const mockMutate = vi.fn();
const mockReset = vi.fn();

vi.mock('../../hooks/useCodeFormatter', () => ({
  useCodeFormatter: vi.fn(() => ({
    mutate: mockMutate,
    data: null,
    isPending: false,
    error: null,
    reset: mockReset,
  })),
}));

describe('CodeFormatterScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate.mockClear();
    mockReset.mockClear();
  });

  it('renders properly', () => {
    renderWithProviders(<CodeFormatterScreen />);
    expect(screen.getByText('Code Formatter')).toBeInTheDocument();
  });

  it('displays input and output textareas', () => {
    renderWithProviders(<CodeFormatterScreen />);
    expect(screen.getByPlaceholderText(/Paste your code here/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Formatted code will appear here/i)).toBeInTheDocument();
  });

  it('calls mutate when format button is clicked', async () => {
    renderWithProviders(<CodeFormatterScreen />);

    const input = screen.getByPlaceholderText(/Paste your code here/i);
    fireEvent.change(input, { target: { value: '{"test":"value"}' } });

    const formatButton = screen.getByRole('button', { name: /Format Code/i });
    fireEvent.click(formatButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('displays formatted code after successful format', async () => {
    const { useCodeFormatter } = await import('../../hooks/useCodeFormatter');
    const mockResponse = {
      success: true,
      message: 'Code formatted successfully',
      formatted_code: '{\n  "test": "value"\n}',
      original_length: 15,
      formatted_length: 20,
    };

    vi.mocked(useCodeFormatter).mockReturnValue({
      mutate: mockMutate,
      data: mockResponse,
      isPending: false,
      error: null,
      reset: mockReset,
    });

    renderWithProviders(<CodeFormatterScreen />);

    await waitFor(() => {
      const output = screen.getByPlaceholderText(/Formatted code will appear here/i);
      expect(output).toHaveValue('{\n  "test": "value"\n}');
    });
  });

  it('displays error message on failure', async () => {
    const { useCodeFormatter } = await import('../../hooks/useCodeFormatter');
    const mockError = new Error('Invalid JSON');

    vi.mocked(useCodeFormatter).mockReturnValue({
      mutate: mockMutate,
      data: null,
      isPending: false,
      error: mockError,
      reset: mockReset,
    });

    renderWithProviders(<CodeFormatterScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON/i)).toBeInTheDocument();
    });
  });
});


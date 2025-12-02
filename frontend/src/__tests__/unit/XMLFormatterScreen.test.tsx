import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { XMLFormatterScreen } from '../../pages/XMLFormatterScreen';
import { renderWithProviders } from '../../test-utils';
import '@testing-library/jest-dom/vitest';

// Mock useXMLFormatter hook
const mockMutate = vi.fn();
const mockReset = vi.fn();

vi.mock('../../hooks/useXMLFormatter', () => ({
  useXMLFormatter: vi.fn(() => ({
    mutate: mockMutate,
    data: null,
    isPending: false,
    error: null,
    reset: mockReset,
  })),
}));

describe('XMLFormatterScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate.mockClear();
    mockReset.mockClear();
  });

  it('renders properly', () => {
    renderWithProviders(<XMLFormatterScreen />);
    expect(screen.getByText('XML Formatter')).toBeInTheDocument();
  });

  it('displays input and output textareas', () => {
    renderWithProviders(<XMLFormatterScreen />);
    expect(screen.getByPlaceholderText(/Paste your XML code here/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Formatted XML will appear here/i)).toBeInTheDocument();
  });

  it('calls mutate when format button is clicked', async () => {
    renderWithProviders(<XMLFormatterScreen />);

    const input = screen.getByPlaceholderText(/Paste your XML code here/i);
    fireEvent.change(input, { target: { value: '<root><item>test</item></root>' } });

    const formatButton = screen.getByRole('button', { name: /Format XML/i });
    fireEvent.click(formatButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('displays formatted result when format is successful', async () => {
    const { useXMLFormatter } = await import('../../hooks/useXMLFormatter');
    const mockResponse = {
      success: true,
      message: 'XML formatted successfully',
      result: '<root>\n  <item>test</item>\n</root>',
      original_size: 30,
      result_size: 35,
    };

    vi.mocked(useXMLFormatter).mockReturnValue({
      mutate: mockMutate,
      data: mockResponse,
      isPending: false,
      error: null,
      reset: mockReset,
    });

    renderWithProviders(<XMLFormatterScreen />);

    await waitFor(() => {
      expect(screen.getByText(/XML formatted successfully/i)).toBeInTheDocument();
    });
  });

  it('displays error message on failure', async () => {
    const { useXMLFormatter } = await import('../../hooks/useXMLFormatter');
    const mockError = new Error('Invalid XML');

    vi.mocked(useXMLFormatter).mockReturnValue({
      mutate: mockMutate,
      data: null,
      isPending: false,
      error: mockError,
      reset: mockReset,
    });

    renderWithProviders(<XMLFormatterScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Invalid XML/i)).toBeInTheDocument();
    });
  });
});




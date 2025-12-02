import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { JSMinifierScreen } from '../../pages/JSMinifierScreen';
import { ApiService } from '../../services/api';
import { renderWithProviders } from '../../test-utils';
import '@testing-library/jest-dom/vitest';

// Mock ApiService
vi.mock('../../services/api', () => ({
  ApiService: {
    minifyJS: vi.fn(),
  },
}));

describe('JSMinifierScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders properly', () => {
    renderWithProviders(<JSMinifierScreen />);
    expect(screen.getByText('JavaScript Minifier')).toBeInTheDocument();
  });

  it('displays input and output textareas', () => {
    renderWithProviders(<JSMinifierScreen />);
    expect(screen.getByPlaceholderText(/Paste your JavaScript code here/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Minified JavaScript will appear here/i)).toBeInTheDocument();
  });

  it('calls API when minify button is clicked', async () => {
    const mockResponse = {
      success: true,
      message: 'JavaScript minified successfully',
      minified_js: 'function test(){return 1}',
      original_size: 30,
      minified_size: 20,
      compression_ratio: 33.33,
    };

    vi.mocked(ApiService.minifyJS).mockResolvedValue(mockResponse);

    renderWithProviders(<JSMinifierScreen />);

    const input = screen.getByPlaceholderText(/Paste your JavaScript code here/i);
    fireEvent.change(input, { target: { value: 'function test() {\n  return 1;\n}' } });

    const minifyButton = screen.getByRole('button', { name: /Minify JavaScript/i });
    fireEvent.click(minifyButton);

    await waitFor(() => {
      expect(ApiService.minifyJS).toHaveBeenCalled();
    });
  });

  it('displays minified JavaScript after successful minification', async () => {
    const mockResponse = {
      success: true,
      message: 'JavaScript minified successfully',
      minified_js: 'function test(){return 1}',
      original_size: 30,
      minified_size: 20,
      compression_ratio: 33.33,
    };

    vi.mocked(ApiService.minifyJS).mockResolvedValue(mockResponse);

    renderWithProviders(<JSMinifierScreen />);

    const input = screen.getByPlaceholderText(/Paste your JavaScript code here/i);
    fireEvent.change(input, { target: { value: 'function test() {\n  return 1;\n}' } });

    const minifyButton = screen.getByRole('button', { name: /Minify JavaScript/i });
    fireEvent.click(minifyButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('function test(){return 1}')).toBeInTheDocument();
    });
  });

  it('displays compression statistics', async () => {
    const mockResponse = {
      success: true,
      message: 'JavaScript minified successfully',
      minified_js: 'function test(){return 1}',
      original_size: 30,
      minified_size: 20,
      compression_ratio: 33.33,
    };

    vi.mocked(ApiService.minifyJS).mockResolvedValue(mockResponse);

    renderWithProviders(<JSMinifierScreen />);

    const input = screen.getByPlaceholderText(/Paste your JavaScript code here/i);
    fireEvent.change(input, { target: { value: 'function test() {\n  return 1;\n}' } });

    const minifyButton = screen.getByRole('button', { name: /Minify JavaScript/i });
    fireEvent.click(minifyButton);

    await waitFor(() => {
      expect(screen.getByText(/Original Size/i)).toBeInTheDocument();
      expect(screen.getByText(/Minified Size/i)).toBeInTheDocument();
      expect(screen.getByText(/Compression Ratio/i)).toBeInTheDocument();
    });
  });
});




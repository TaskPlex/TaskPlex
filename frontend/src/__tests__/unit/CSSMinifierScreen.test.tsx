import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { CSSMinifierScreen } from '../../pages/CSSMinifierScreen';
import { ApiService } from '../../services/api';
import { renderWithProviders } from '../../test-utils';
import '@testing-library/jest-dom/vitest';

// Mock ApiService
vi.mock('../../services/api', () => ({
  ApiService: {
    minifyCSS: vi.fn(),
  },
}));

describe('CSSMinifierScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders properly', () => {
    renderWithProviders(<CSSMinifierScreen />);
    expect(screen.getByText('CSS Minifier')).toBeInTheDocument();
  });

  it('displays input and output textareas', () => {
    renderWithProviders(<CSSMinifierScreen />);
    expect(screen.getByPlaceholderText(/Paste your CSS code here/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Minified CSS will appear here/i)).toBeInTheDocument();
  });

  it('calls API when minify button is clicked', async () => {
    const mockResponse = {
      success: true,
      message: 'CSS minified successfully',
      minified_css: '.test{color:red}',
      original_size: 20,
      minified_size: 15,
      compression_ratio: 25.0,
    };

    vi.mocked(ApiService.minifyCSS).mockResolvedValue(mockResponse);

    renderWithProviders(<CSSMinifierScreen />);

    const input = screen.getByPlaceholderText(/Paste your CSS code here/i);
    fireEvent.change(input, { target: { value: '.test { color: red; }' } });

    const minifyButton = screen.getByRole('button', { name: /Minify CSS/i });
    fireEvent.click(minifyButton);

    await waitFor(() => {
      expect(ApiService.minifyCSS).toHaveBeenCalled();
    });
  });

  it('displays minified CSS after successful minification', async () => {
    const mockResponse = {
      success: true,
      message: 'CSS minified successfully',
      minified_css: '.test{color:red}',
      original_size: 20,
      minified_size: 15,
      compression_ratio: 25.0,
    };

    vi.mocked(ApiService.minifyCSS).mockResolvedValue(mockResponse);

    renderWithProviders(<CSSMinifierScreen />);

    const input = screen.getByPlaceholderText(/Paste your CSS code here/i);
    fireEvent.change(input, { target: { value: '.test { color: red; }' } });

    const minifyButton = screen.getByRole('button', { name: /Minify CSS/i });
    fireEvent.click(minifyButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('.test{color:red}')).toBeInTheDocument();
    });
  });

  it('displays compression statistics', async () => {
    const mockResponse = {
      success: true,
      message: 'CSS minified successfully',
      minified_css: '.test{color:red}',
      original_size: 20,
      minified_size: 15,
      compression_ratio: 25.0,
    };

    vi.mocked(ApiService.minifyCSS).mockResolvedValue(mockResponse);

    renderWithProviders(<CSSMinifierScreen />);

    const input = screen.getByPlaceholderText(/Paste your CSS code here/i);
    fireEvent.change(input, { target: { value: '.test { color: red; }' } });

    const minifyButton = screen.getByRole('button', { name: /Minify CSS/i });
    fireEvent.click(minifyButton);

    await waitFor(() => {
      expect(screen.getByText(/Original Size/i)).toBeInTheDocument();
      expect(screen.getByText(/Minified Size/i)).toBeInTheDocument();
      expect(screen.getByText(/Compression Ratio/i)).toBeInTheDocument();
    });
  });
});




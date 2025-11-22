import React from 'react';
import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFCompress } from './PDFCompress';
import { renderWithProviders } from '../../test-utils';

// Mock ApiService
vi.mock('../../services/api', () => ({
  ApiService: {
    compressPDF: vi.fn(),
    getDownloadUrl: vi.fn((path) => path),
  },
}));

describe('PDFCompress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders properly', () => {
    renderWithProviders(<PDFCompress />);
    expect(screen.getByText('Compress PDF')).toBeInTheDocument();
    expect(screen.getByText('Select PDF file')).toBeInTheDocument();
  });
});

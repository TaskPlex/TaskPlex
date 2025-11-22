import React from 'react';
import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFSplit } from './PDFSplit';
import { renderWithProviders } from '../../test-utils';

// Mock ApiService
vi.mock('../../services/api', () => ({
  ApiService: {
    splitPDF: vi.fn(),
    getDownloadUrl: vi.fn((path) => path),
  },
}));

describe('PDFSplit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders properly', () => {
    renderWithProviders(<PDFSplit />);
    expect(screen.getByText('Split PDF')).toBeInTheDocument();
    expect(screen.getByText('Select PDF file')).toBeInTheDocument();
  });
});

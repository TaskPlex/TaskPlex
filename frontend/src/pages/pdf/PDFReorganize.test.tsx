import React from 'react';
import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFReorganize } from './PDFReorganize';
import { renderWithProviders } from '../../test-utils';

// Mock ApiService
vi.mock('../../services/api', () => ({
  ApiService: {
    reorganizePDF: vi.fn(),
    getDownloadUrl: vi.fn((path) => path),
  },
}));

// Mock react-pdf
vi.mock('react-pdf', () => ({
  pdfjs: { GlobalWorkerOptions: { workerSrc: '' } },
  Document: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Page: () => <div>Page Preview</div>,
}));

describe('PDFReorganize', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders properly', () => {
    renderWithProviders(<PDFReorganize />);
    expect(screen.getByText('Organize PDF')).toBeInTheDocument();
    expect(screen.getByText('Select PDF file')).toBeInTheDocument();
  });
});

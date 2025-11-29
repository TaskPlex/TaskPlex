import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HomeDashboard } from '../../pages/HomeDashboard';
import { renderWithProviders } from '../../test-utils';

describe('HomeDashboard', () => {
  it('renders the welcome message', () => {
    renderWithProviders(<HomeDashboard />);
    expect(screen.getByText(/Your Universal/i)).toBeInTheDocument();
    expect(screen.getByText(/TaskPlex/i)).toBeInTheDocument();
  });

  it('renders search bar and tools', () => {
    renderWithProviders(<HomeDashboard />);
    // Search bar should be present
    expect(screen.getByPlaceholderText(/Search tools/i)).toBeInTheDocument();
    // Some tools should be visible
    expect(screen.getByText(/Compress Video/i)).toBeInTheDocument();
  });

  it('filters tools when searching', () => {
    renderWithProviders(<HomeDashboard />);
    
    // At the start, all tools are there (ex: Compress Video and Regex Tester)
    expect(screen.getByText(/Compress Video/i)).toBeInTheDocument();
    expect(screen.getByText(/Regex Tester/i)).toBeInTheDocument();

    // Search for "PDF"
    const searchInput = screen.getByPlaceholderText(/Search tools/i);
    fireEvent.change(searchInput, { target: { value: 'PDF' } });

    // PDF-related tools should be visible
    expect(screen.getByText(/Compress PDF/i)).toBeInTheDocument();
    // Non-PDF tools should not be visible
    expect(screen.queryByText(/Compress Video/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Regex Tester/i)).not.toBeInTheDocument();
  });
});


import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HomeDashboard } from './HomeDashboard';
import { renderWithProviders } from '../test-utils';

describe('HomeDashboard', () => {
  it('renders the welcome message', () => {
    renderWithProviders(<HomeDashboard />);
    expect(screen.getByText(/Your Universal/i)).toBeInTheDocument();
    expect(screen.getByText(/TaskPlex/i)).toBeInTheDocument();
  });

  it('renders tool categories', () => {
    renderWithProviders(<HomeDashboard />);
    expect(screen.getByText(/All Tools/i)).toBeInTheDocument();
    expect(screen.getByText(/Media/i)).toBeInTheDocument();
    // Documents appears in both button and description, so use getAllByText
    expect(screen.getAllByText(/Documents/i).length).toBeGreaterThan(0);
  });

  it('filters tools when clicking a category', () => {
    renderWithProviders(<HomeDashboard />);
    
    // Au début, tous les outils sont là (ex: Video Tools et Regex Tester)
    expect(screen.getByText(/Video Tools/i)).toBeInTheDocument();
    expect(screen.getByText(/Regex Tester/i)).toBeInTheDocument();

    // Clique sur "Media"
    fireEvent.click(screen.getByText(/Media/i));

    // Video Tools doit être là, mais Regex Tester (Developer tool) ne devrait plus être visible
    expect(screen.getByText(/Video Tools/i)).toBeInTheDocument();
    // Note: queryByText renvoie null si pas trouvé, getByText lance une erreur
    expect(screen.queryByText(/Regex Tester/i)).not.toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { HomeDashboard } from './HomeDashboard';

// Wrapper pour le router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('HomeDashboard', () => {
  it('renders the welcome message', () => {
    renderWithRouter(<HomeDashboard />);
    expect(screen.getByText(/Your Universal/i)).toBeInTheDocument();
    expect(screen.getByText(/TaskPlex/i)).toBeInTheDocument();
  });

  it('renders tool categories', () => {
    renderWithRouter(<HomeDashboard />);
    expect(screen.getByText('All Tools')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
  });

  it('filters tools when clicking a category', () => {
    renderWithRouter(<HomeDashboard />);
    
    // Au début, tous les outils sont là (ex: Video Tools et Regex Tester)
    expect(screen.getByText('Video Tools')).toBeInTheDocument();
    expect(screen.getByText('Regex Tester')).toBeInTheDocument();

    // Clique sur "Media"
    fireEvent.click(screen.getByText('Media'));

    // Video Tools doit être là, mais Regex Tester (Developer tool) ne devrait plus être visible
    expect(screen.getByText('Video Tools')).toBeInTheDocument();
    // Note: queryByText renvoie null si pas trouvé, getByText lance une erreur
    expect(screen.queryByText('Regex Tester')).not.toBeInTheDocument();
  });
});


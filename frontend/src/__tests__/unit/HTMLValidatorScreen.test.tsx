import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { HTMLValidatorScreen } from '../../pages/HTMLValidatorScreen';
import { ApiService } from '../../services/api';
import { renderWithProviders } from '../../test-utils';

vi.mock('../../services/api', () => ({
  ApiService: {
    validateHTML: vi.fn(),
  },
}));

describe('HTMLValidatorScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rend les champs et le bouton', () => {
    renderWithProviders(<HTMLValidatorScreen />);

    expect(screen.getByText('HTML Validator')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Paste or type HTML here...')).toBeInTheDocument();
    expect(screen.getByText('Validate HTML')).toBeInTheDocument();
  });

  it('désactive le bouton quand le champ est vide', () => {
    renderWithProviders(<HTMLValidatorScreen />);
    const btn = screen.getByText('Validate HTML');
    fireEvent.click(btn);
    expect(ApiService.validateHTML).not.toHaveBeenCalled();
  });

  it('affiche valide quand la réponse est valide', async () => {
    vi.mocked(ApiService.validateHTML).mockResolvedValue({
      success: true,
      message: 'HTML is valid',
      valid: true,
      errors: [],
      warnings: [],
    });

    renderWithProviders(<HTMLValidatorScreen />);

    fireEvent.change(screen.getByPlaceholderText('Paste or type HTML here...'), {
      target: { value: '<div></div>' },
    });

    fireEvent.click(screen.getByText('Validate HTML'));

    await waitFor(() => {
      expect(ApiService.validateHTML).toHaveBeenCalledWith('<div></div>');
      expect(screen.getByText('Valid HTML')).toBeInTheDocument();
    });
  });

  it('affiche les erreurs quand HTML est invalide', async () => {
    vi.mocked(ApiService.validateHTML).mockResolvedValue({
      success: true,
      message: 'Found issues',
      valid: false,
      errors: [{ message: 'Unclosed tag <p>', line: 1, column: 5 }],
      warnings: [],
    });

    renderWithProviders(<HTMLValidatorScreen />);

    fireEvent.change(screen.getByPlaceholderText('Paste or type HTML here...'), {
      target: { value: '<div><p></div>' },
    });

    fireEvent.click(screen.getByText('Validate HTML'));

    await waitFor(() => {
      expect(screen.getByText('Unclosed tag <p>')).toBeInTheDocument();
    });
  });
});


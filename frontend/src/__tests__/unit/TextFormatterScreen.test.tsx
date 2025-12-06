import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { TextFormatterScreen } from '../../pages/TextFormatterScreen';
import { renderWithProviders } from '../../test-utils';
import '@testing-library/jest-dom/vitest';

const mockMutate = vi.fn();
const mockReset = vi.fn();

vi.mock('../../hooks/useText', () => ({
  useFormatText: vi.fn(() => ({
    mutate: mockMutate,
    data: null,
    isPending: false,
    error: null,
    reset: mockReset,
  })),
}));

describe('TextFormatterScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate.mockClear();
    mockReset.mockClear();
  });

  it('affiche le titre et les zones de texte', () => {
    renderWithProviders(<TextFormatterScreen />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/text containing literal \\n/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/text will appear here/i)).toBeInTheDocument();
  });

  it('déclenche le formatage au clic', async () => {
    renderWithProviders(<TextFormatterScreen />);

    const input = screen.getByPlaceholderText(/Paste your text containing literal \\n/i);
    fireEvent.change(input, { target: { value: 'Hello\\nWorld' } });

    const button = screen.getByRole('button', { name: /Format text/i });
    fireEvent.click(button);

    await waitFor(() => expect(mockMutate).toHaveBeenCalled());
  });
});



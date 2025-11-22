import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnitsScreen } from './UnitsScreen';
import { ApiService } from '../services/api';
import { renderWithProviders } from '../test-utils';

// Mock ApiService
vi.mock('../services/api', () => ({
  ApiService: {
    convertUnits: vi.fn(),
  },
}));

describe('UnitsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders properly', () => {
    renderWithProviders(<UnitsScreen />);
    expect(screen.getByText('Unit Converter')).toBeInTheDocument();
    expect(screen.getByText('Length')).toBeInTheDocument();
    expect(screen.getByText('Mass')).toBeInTheDocument();
  });

  it('calls API when input changes', async () => {
    vi.mocked(ApiService.convertUnits).mockResolvedValue({ success: true, converted_value: 1000, converted_unit: 'meter' });
    
    renderWithProviders(<UnitsScreen />);
    
    const inputs = screen.getAllByPlaceholderText('0');
    const fromInput = inputs[0];

    fireEvent.change(fromInput, { target: { value: '1' } });

    await waitFor(() => {
      expect(ApiService.convertUnits).toHaveBeenCalledWith(1, 'meter', 'kilometer');
    }, { timeout: 2000 });
  });

  it('updates result on success', async () => {
    vi.mocked(ApiService.convertUnits).mockResolvedValue({ success: true, converted_value: 0.001, converted_unit: 'kilometer' });
    
    renderWithProviders(<UnitsScreen />);
    
    const inputs = screen.getAllByPlaceholderText('0');
    const fromInput = inputs[0];

    fireEvent.change(fromInput, { target: { value: '1' } });

    await waitFor(() => {
      expect(inputs[1]).toHaveValue('0.001');
    }, { timeout: 2000 });
  });

  it('swaps units correctly', () => {
    renderWithProviders(<UnitsScreen />);
    
    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toHaveValue('meter');
    expect(selects[1]).toHaveValue('kilometer');

    const swapBtn = screen.getByLabelText('Swap units');
    fireEvent.click(swapBtn);

    expect(selects[0]).toHaveValue('kilometer');
    expect(selects[1]).toHaveValue('meter');
  });
});

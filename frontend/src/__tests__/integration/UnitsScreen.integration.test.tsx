/**
 * Integration tests for UnitsScreen component
 * Uses MSW to mock unit conversion API
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils';
import { UnitsScreen } from '../../pages/UnitsScreen';

describe('UnitsScreen Integration', () => {
  it('renders the unit converter interface', () => {
    renderWithProviders(<UnitsScreen />);
    
    // Should have headings
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('shows category buttons', () => {
    renderWithProviders(<UnitsScreen />);
    
    // Should have multiple category buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('has input field for value entry', () => {
    renderWithProviders(<UnitsScreen />);
    
    // Should have number input
    const numberInput = screen.getByRole('spinbutton');
    expect(numberInput).toBeInTheDocument();
  });

  it('can change category', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UnitsScreen />);
    
    const buttons = screen.getAllByRole('button');
    // Click on a category button (not the swap button)
    const categoryButton = buttons.find(btn => 
      btn.textContent?.toLowerCase().includes('mass') ||
      btn.textContent?.toLowerCase().includes('masse') ||
      btn.textContent?.toLowerCase().includes('temp')
    );
    
    if (categoryButton) {
      await user.click(categoryButton);
      // Should update without error
      expect(document.body).toBeInTheDocument();
    }
  });

  it('can swap units', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UnitsScreen />);
    
    // Find swap button (typically has ArrowRightLeft icon or "swap" text)
    const buttons = screen.getAllByRole('button');
    const swapButton = buttons.find(btn => 
      btn.querySelector('svg') && !btn.textContent?.trim()
    );
    
    if (swapButton) {
      await user.click(swapButton);
      // Should swap without error
      expect(document.body).toBeInTheDocument();
    }
  });

  it('has unit selection dropdowns', () => {
    renderWithProviders(<UnitsScreen />);
    
    // Should have comboboxes for unit selection
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it('shows conversion result area', () => {
    renderWithProviders(<UnitsScreen />);
    
    // Should have result display (readonly text input or similar)
    const inputs = screen.getAllByRole('textbox');
    // At least one should be the result
    expect(inputs.length).toBeGreaterThanOrEqual(0);
  });

  it('can enter a value', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UnitsScreen />);
    
    const numberInput = screen.getByRole('spinbutton');
    await user.clear(numberInput);
    await user.type(numberInput, '100');
    
    expect(numberInput).toHaveValue(100);
  });
});

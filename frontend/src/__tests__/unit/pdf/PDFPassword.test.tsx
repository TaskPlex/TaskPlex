import React from 'react';
import { screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFPassword } from '../../../pages/pdf/PDFPassword';
import { renderWithProviders } from '../../../test-utils';
import { usePasswordPDF } from '../../../hooks/usePDF';

// Mock ApiService
vi.mock('../../../services/api', () => ({
  ApiService: {
    passwordPDF: vi.fn(),
    getDownloadUrl: vi.fn((path) => path),
  },
}));

// Mock usePasswordPDF hook
vi.mock('../../../hooks/usePDF', () => ({
  usePasswordPDF: vi.fn(),
}));

// Mock useDownload hook
vi.mock('../../../hooks/useDownload', () => ({
  useDownload: vi.fn(() => ({
    downloadDirect: vi.fn(),
  })),
}));

describe('PDFPassword', () => {
  const mockMutate = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePasswordPDF as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      data: null,
      error: null,
      reset: mockReset,
    });
  });

  it('renders properly', () => {
    const { container } = renderWithProviders(<PDFPassword />);
    // Check that the component renders
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    // Check for file input
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it('displays add password action by default', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<PDFPassword />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    // Get the action toggle button (the one with flex-1 class, not the process button)
    const addButtons = screen.getAllByRole('button', { name: /add password/i });
    const actionButton = addButtons.find(btn => btn.classList.contains('flex-1'));
    expect(actionButton).toBeDefined();
    expect(actionButton).toBeInTheDocument();
    expect(actionButton).toHaveClass('bg-red-600');
  });

  it('allows switching between add and remove actions', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<PDFPassword />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    const removeButton = screen.getByRole('button', { name: /remove password/i });
    await user.click(removeButton);

    expect(removeButton).toHaveClass('bg-blue-600');
  });

  it('shows password input field', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<PDFPassword />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    const passwordInput = container.querySelector('#password-input') as HTMLInputElement;
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<PDFPassword />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    const passwordInput = container.querySelector('#password-input') as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    await user.type(passwordInput, 'test123');
    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
  });

  it('handles file selection', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<PDFPassword />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(fileInput, file);

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  it('disables process button when password is empty', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<PDFPassword />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    // Get the process button (the one that's disabled when password is empty)
    const processButtons = screen.getAllByRole('button', { name: /add password/i });
    const processButton = processButtons.find(btn => btn.hasAttribute('disabled') || btn.classList.contains('disabled'));
    expect(processButton).toBeInTheDocument();
    expect(processButton).toBeDisabled();
  });

  it('enables process button when password is provided', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<PDFPassword />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    const passwordInput = container.querySelector('#password-input') as HTMLInputElement;
    await user.type(passwordInput, 'test123');

    // Get the process button (the full-width button at the bottom)
    const processButtons = screen.getAllByRole('button', { name: /add password/i });
    const processButton = processButtons.find(btn => btn.classList.contains('w-full'));
    expect(processButton).toBeInTheDocument();
    expect(processButton).not.toBeDisabled();
  });

  it('calls mutate with correct parameters when processing', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<PDFPassword />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(fileInput, file);

    const passwordInput = container.querySelector('#password-input') as HTMLInputElement;
    await user.type(passwordInput, 'test123');

    // Get the process button (the full-width button at the bottom)
    const processButtons = screen.getAllByRole('button', { name: /add password/i });
    const processButton = processButtons.find(btn => btn.classList.contains('w-full'));
    expect(processButton).toBeInTheDocument();
    await user.click(processButton!);

    expect(mockMutate).toHaveBeenCalledWith({
      file,
      action: 'add',
      password: 'test123',
    });
  });

  it('calls mutate with remove action when remove is selected', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<PDFPassword />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(fileInput, file);

    const removeButton = screen.getByRole('button', { name: /remove password/i });
    await user.click(removeButton);

    const passwordInput = container.querySelector('#password-input') as HTMLInputElement;
    await user.type(passwordInput, 'test123');

    // Get the process button (the full-width button at the bottom)
    const processButtons = screen.getAllByRole('button', { name: /remove password/i });
    const processButton = processButtons.find(btn => btn.classList.contains('w-full'));
    expect(processButton).toBeInTheDocument();
    await user.click(processButton!);

    expect(mockMutate).toHaveBeenCalledWith({
      file,
      action: 'remove',
      password: 'test123',
    });
  });

  it('displays error message when error occurs', async () => {
    (usePasswordPDF as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      data: { success: false, message: 'Test error' },
      error: new Error('Test error'),
      reset: mockReset,
    });

    const { container } = renderWithProviders(<PDFPassword />);
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(screen.getByText(/test error/i)).toBeInTheDocument();
    });
  });

  it('displays success message and download button when processing succeeds', async () => {
    (usePasswordPDF as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      data: {
        success: true,
        message: 'PDF password protection added successfully',
        filename: 'protected_test.pdf',
        download_url: '/api/v1/download/protected_test.pdf',
      },
      error: null,
      reset: mockReset,
    });

    const { container } = renderWithProviders(<PDFPassword />);
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    });

    await waitFor(() => {
      const successElements = screen.getAllByText(/success/i);
      expect(successElements.length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
    });
  });

  it('shows loading state when processing', async () => {
    (usePasswordPDF as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      data: null,
      error: null,
      reset: mockReset,
    });

    const { container } = renderWithProviders(<PDFPassword />);
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const user = userEvent.setup();
    
    await user.upload(fileInput, file);
    const passwordInput = container.querySelector('#password-input') as HTMLInputElement;
    await user.type(passwordInput, 'test123');

    // Check that processing text appears in the button
    const processButton = screen.getByRole('button', { name: /processing/i });
    expect(processButton).toBeInTheDocument();
  });
});


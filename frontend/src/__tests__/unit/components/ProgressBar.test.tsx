/**
 * Tests for ProgressBar component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar, ProgressIndicator } from '@/components/ui/ProgressBar';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

// Mock ThemeContext
vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}));

describe('ProgressBar', () => {
  describe('visibility', () => {
    it('returns null when status is idle', () => {
      const { container } = render(
        <ProgressBar progress={0} status="idle" />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders when status is uploading', () => {
      render(<ProgressBar progress={25} status="uploading" />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders when status is processing', () => {
      render(<ProgressBar progress={50} status="processing" />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders when status is completed', () => {
      render(<ProgressBar progress={100} status="completed" />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders when status is error', () => {
      render(<ProgressBar progress={50} status="error" />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('progress display', () => {
    it('displays correct percentage', () => {
      render(<ProgressBar progress={75} status="processing" />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('clamps progress to 0-100 range', () => {
      const { rerender } = render(<ProgressBar progress={-10} status="processing" />);
      expect(screen.getByText('0%')).toBeInTheDocument();

      rerender(<ProgressBar progress={150} status="processing" />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('hides percentage when showPercentage is false', () => {
      render(<ProgressBar progress={50} status="processing" showPercentage={false} />);
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('hides percentage when status is error', () => {
      render(<ProgressBar progress={50} status="error" />);
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });
  });

  describe('messages', () => {
    it('displays custom message when provided', () => {
      render(<ProgressBar progress={50} status="processing" message="Custom message" />);
      expect(screen.getByText('Custom message')).toBeInTheDocument();
    });

    it('displays default uploading message', () => {
      render(<ProgressBar progress={25} status="uploading" />);
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });

    it('displays default processing message', () => {
      render(<ProgressBar progress={50} status="processing" />);
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('displays default completed message', () => {
      render(<ProgressBar progress={100} status="completed" />);
      expect(screen.getByText('Completed!')).toBeInTheDocument();
    });

    it('displays default error message', () => {
      render(<ProgressBar progress={50} status="error" />);
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  describe('size variants', () => {
    it('renders small size', () => {
      const { container } = render(<ProgressBar progress={50} status="processing" size="sm" />);
      expect(container.querySelector('.h-1\\.5')).toBeInTheDocument();
    });

    it('renders medium size by default', () => {
      const { container } = render(<ProgressBar progress={50} status="processing" />);
      expect(container.querySelector('.h-2\\.5')).toBeInTheDocument();
    });

    it('renders large size', () => {
      const { container } = render(<ProgressBar progress={50} status="processing" size="lg" />);
      expect(container.querySelector('.h-4')).toBeInTheDocument();
    });
  });

  describe('color variants', () => {
    it('applies success variant color', () => {
      const { container } = render(
        <ProgressBar progress={50} status="processing" variant="success" />
      );
      expect(container.querySelector('.bg-green-500')).toBeInTheDocument();
    });

    it('applies error variant color', () => {
      const { container } = render(
        <ProgressBar progress={50} status="processing" variant="error" />
      );
      expect(container.querySelector('.bg-red-500')).toBeInTheDocument();
    });

    it('applies info variant color', () => {
      const { container } = render(
        <ProgressBar progress={50} status="processing" variant="info" />
      );
      expect(container.querySelector('.bg-blue-500')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<ProgressBar progress={50} status="processing" />);
      const progressbar = screen.getByRole('progressbar');
      
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });
  });
});

describe('ProgressIndicator', () => {
  it('returns null when status is idle', () => {
    const { container } = render(
      <ProgressIndicator progress={0} status="idle" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders progress for uploading status', () => {
    render(<ProgressIndicator progress={50} status="uploading" />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders progress for processing status', () => {
    render(<ProgressIndicator progress={75} status="processing" />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('hides percentage for completed status', () => {
    render(<ProgressIndicator progress={100} status="completed" />);
    expect(screen.queryByText('100%')).not.toBeInTheDocument();
  });

  it('hides percentage for error status', () => {
    render(<ProgressIndicator progress={50} status="error" />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });
});


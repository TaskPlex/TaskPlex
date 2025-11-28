/**
 * Tests for ResultCard component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultCard } from '@/components/ui/ResultCard';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useDownload hook
const mockDownloadDirect = vi.fn();
vi.mock('@/hooks/useDownload', () => ({
  useDownload: () => ({
    downloadDirect: mockDownloadDirect,
  }),
}));

// Mock ApiService
vi.mock('@/services/api', () => ({
  ApiService: {
    getDownloadUrl: (url: string) => `http://localhost:8000${url}`,
  },
}));

describe('ResultCard', () => {
  beforeEach(() => {
    mockDownloadDirect.mockClear();
  });

  describe('visibility', () => {
    it('returns null when success is false', () => {
      const { container } = render(
        <ResultCard success={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders when success is true', () => {
      render(<ResultCard success={true} />);
      expect(screen.getByText('common.success')).toBeInTheDocument();
    });
  });

  describe('message display', () => {
    it('displays custom message when provided', () => {
      render(<ResultCard success={true} message="Operation completed!" />);
      expect(screen.getByText('Operation completed!')).toBeInTheDocument();
    });

    it('displays default success message when no message provided', () => {
      render(<ResultCard success={true} />);
      expect(screen.getByText('common.success')).toBeInTheDocument();
    });
  });

  describe('download functionality', () => {
    it('renders download button when downloadUrl is provided', () => {
      render(
        <ResultCard 
          success={true} 
          downloadUrl="/api/v1/download/file.pdf" 
          filename="file.pdf"
        />
      );
      expect(screen.getByText('common.download')).toBeInTheDocument();
    });

    it('does not render download button when no downloadUrl', () => {
      render(<ResultCard success={true} />);
      expect(screen.queryByText('common.download')).not.toBeInTheDocument();
    });

    it('calls downloadDirect when download button is clicked', () => {
      render(
        <ResultCard 
          success={true} 
          downloadUrl="/api/v1/download/file.pdf" 
          filename="file.pdf"
        />
      );

      const downloadButton = screen.getByText('common.download');
      fireEvent.click(downloadButton);

      expect(mockDownloadDirect).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/download/file.pdf',
        'file.pdf'
      );
    });

    it('extracts filename from URL when not provided', () => {
      render(
        <ResultCard 
          success={true} 
          downloadUrl="/api/v1/download/extracted.pdf"
        />
      );

      const downloadButton = screen.getByText('common.download');
      fireEvent.click(downloadButton);

      expect(mockDownloadDirect).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/download/extracted.pdf',
        'extracted.pdf'
      );
    });
  });

  describe('size information', () => {
    it('displays compression ratio when provided', () => {
      render(
        <ResultCard 
          success={true} 
          compressionRatio={75}
        />
      );
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('calculates and displays reduction from sizes', () => {
      render(
        <ResultCard 
          success={true} 
          originalSize={102400}  // 100KB
          processedSize={51200}  // 50KB
        />
      );
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('displays size details when both sizes provided', () => {
      render(
        <ResultCard 
          success={true} 
          originalSize={102400}  // 100KB
          processedSize={51200}  // 50KB
        />
      );
      expect(screen.getByText(/100KB → 50KB/)).toBeInTheDocument();
    });
  });

  describe('color variants', () => {
    it('applies green color by default', () => {
      const { container } = render(<ResultCard success={true} />);
      expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
    });

    it('applies purple color when specified', () => {
      const { container } = render(<ResultCard success={true} color="purple" />);
      expect(container.querySelector('.bg-purple-50')).toBeInTheDocument();
    });

    it('applies blue color when specified', () => {
      const { container } = render(<ResultCard success={true} color="blue" />);
      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
    });

    it('applies red color when specified', () => {
      const { container } = render(<ResultCard success={true} color="red" />);
      expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
    });
  });

  describe('children', () => {
    it('renders children content', () => {
      render(
        <ResultCard success={true}>
          <div data-testid="child-content">Additional content</div>
        </ResultCard>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ResultCard success={true} className="custom-class" />
      );
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });
});


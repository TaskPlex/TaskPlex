import React from 'react';
import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VideoScreen } from './VideoScreen';
import { renderWithProviders } from '../test-utils';

// Mock ApiService
vi.mock('../services/api', () => ({
  ApiService: {
    compressVideo: vi.fn(),
    convertVideo: vi.fn(),
    getDownloadUrl: vi.fn((path) => path),
  },
}));

describe('VideoScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders properly', () => {
    renderWithProviders(<VideoScreen />);
    expect(screen.getByText('Video Processing')).toBeInTheDocument();
    expect(screen.getByText('Operation')).toBeInTheDocument();
  });
});

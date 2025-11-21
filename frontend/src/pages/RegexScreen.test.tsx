import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegexScreen } from './RegexScreen';
import { ApiService } from '../services/api';

// Mock ApiService
vi.mock('../services/api', () => ({
  ApiService: {
    testRegex: vi.fn(),
  },
}));

describe('RegexScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders properly', () => {
    render(<RegexScreen />);
    expect(screen.getByText('Regex Tester')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. [a-z]+')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Paste your text here to test the regex...')).toBeInTheDocument();
  });

  it('calls API when inputs are filled', async () => {
    vi.mocked(ApiService.testRegex).mockResolvedValue({ success: true, matches: [], count: 0 });
    render(<RegexScreen />);
    
    const patternInput = screen.getByPlaceholderText('e.g. [a-z]+');
    const textInput = screen.getByPlaceholderText('Paste your text here to test the regex...');

    fireEvent.change(patternInput, { target: { value: '[0-9]+' } });
    fireEvent.change(textInput, { target: { value: '123 test' } });

    // Wait for debounce (500ms)
    await waitFor(() => {
      expect(ApiService.testRegex).toHaveBeenCalledWith('[0-9]+', '123 test', 'g');
    }, { timeout: 1000 });
  });

  it('displays results on success', async () => {
    // Mock successful response
    const mockResponse = {
      success: true,
      count: 1,
      matches: [
        { match: '123', start: 0, end: 3, groups: [], named_groups: {} }
      ]
    };
    vi.mocked(ApiService.testRegex).mockResolvedValue(mockResponse);

    render(<RegexScreen />);
    
    fireEvent.change(screen.getByPlaceholderText('e.g. [a-z]+'), { target: { value: '[0-9]+' } });
    fireEvent.change(screen.getByPlaceholderText('Paste your text here to test the regex...'), { target: { value: '123 test' } });

    await waitFor(() => {
      expect(screen.getByText('1 matches found')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('displays error on invalid regex', async () => {
    // Mock error response
    const mockResponse = {
      success: false,
      matches: [],
      count: 0,
      error: 'bad pattern'
    };
    vi.mocked(ApiService.testRegex).mockResolvedValue(mockResponse);

    render(<RegexScreen />);
    
    fireEvent.change(screen.getByPlaceholderText('e.g. [a-z]+'), { target: { value: '[' } }); // Invalid regex
    fireEvent.change(screen.getByPlaceholderText('Paste your text here to test the regex...'), { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('bad pattern')).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});

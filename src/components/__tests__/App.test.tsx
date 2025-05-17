import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../App';

// Mock the Timeline component to isolate App testing
vi.mock('../Timeline', () => ({
  default: vi.fn(({ items }) => (
    <div data-testid="mocked-timeline">
      <span>Mocked Timeline with {items.length} items</span>
    </div>
  ))
}));

describe('App Component', () => {
  it('renders the header with correct title', () => {
    render(<App />);
    expect(screen.getByText('React Timeline')).toBeInTheDocument();
    expect(screen.getByText('Interactive timeline component for visualizing events')).toBeInTheDocument();
  });

  it('renders the Timeline component with sample data', () => {
    render(<App />);
    expect(screen.getByTestId('mocked-timeline')).toBeInTheDocument();
    expect(screen.getByText(/Mocked Timeline with \d+ items/)).toBeInTheDocument();
  });

  it('provides sample data with the correct structure', () => {
    render(<App />);
    // Check that we have the correct number of items indicated in the mocked component
    expect(screen.getByText('Mocked Timeline with 14 items')).toBeInTheDocument();
  });
}); 
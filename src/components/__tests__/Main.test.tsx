import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import React from 'react';

// Mock react-dom/client module
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn()
  }))
}));

// Mock App component
vi.mock('../../App', () => ({
  default: () => <div data-testid="mocked-app">Mocked App</div>
}));

describe('Main entry point', () => {
  beforeEach(() => {
    // Create a div to simulate the root element
    document.body.innerHTML = '<div id="root"></div>';
    
    // Clear mocks before each test
    vi.clearAllMocks();
  });
  
  it('renders the app into the root element', async () => {
    // Import main module dynamically to trigger its execution
    await import('../../main.tsx');
    
    // Verify createRoot was called with the root element
    const rootElement = document.getElementById('root');
    expect(rootElement).not.toBeNull();
    expect(createRoot).toHaveBeenCalledTimes(1);
    expect(createRoot).toHaveBeenCalledWith(rootElement);
    
    // Clean up
    document.body.innerHTML = '';
  });
}); 
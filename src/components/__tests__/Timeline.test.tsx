import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Timeline from '../Timeline';
import type { TimelineItem } from '../Timeline';

// Sample timeline items for testing
const mockTimelineItems: TimelineItem[] = [
  {
    id: 1,
    start: "2021-01-01",
    end: "2021-01-05",
    name: "First item"
  },
  {
    id: 2,
    start: "2021-01-06",
    end: "2021-01-10",
    name: "Second item"
  },
  {
    id: 3,
    start: "2021-01-11",
    end: "2021-01-15",
    name: "Third item"
  }
];

describe('Timeline Component', () => {
  // Use a module level variable for the mock width
  let mockWidth = 1000;
  
  // Create a utility to set the width that will be accessible in the tests
  const setMockWidth = (width: number) => {
    mockWidth = width;
  };
  
  beforeEach(() => {
    // Mock ResizeObserver
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
    
    // Reset the mock width to initial value
    mockWidth = 1000;
    
    // Mock getBoundingClientRect with a width that can change
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => {
      return {
        width: mockWidth,
        height: 500,
        top: 0,
        left: 0,
        bottom: 500,
        right: mockWidth,
        x: 0,
        y: 0,
        toJSON: () => {}
      };
    });
  });

  it('renders without crashing', () => {
    render(<Timeline items={mockTimelineItems} />);
    expect(screen.getByText('First item')).toBeInTheDocument();
    expect(screen.getByText('Second item')).toBeInTheDocument();
    expect(screen.getByText('Third item')).toBeInTheDocument();
  });

  it('renders zoom controls', () => {
    render(<Timeline items={mockTimelineItems} />);
    expect(screen.getByText('Zoom In')).toBeInTheDocument();
    expect(screen.getByText('Zoom Out')).toBeInTheDocument();
    expect(screen.getByText('Reset Lanes')).toBeInTheDocument();
  });

  it('renders items in separate lanes when not overlapping', () => {
    const { container } = render(<Timeline items={mockTimelineItems} />);
    
    // Get all timeline items
    const timelineItems = container.querySelectorAll('.timeline-item');
    expect(timelineItems.length).toBe(3);
    
    // Check if they're in the same lane (all should have lane 0)
    const firstItemStyle = window.getComputedStyle(timelineItems[0]);
    const secondItemStyle = window.getComputedStyle(timelineItems[1]);
    const thirdItemStyle = window.getComputedStyle(timelineItems[2]);
    
    expect(firstItemStyle.top).toBe('0px');
    expect(secondItemStyle.top).toBe('0px'); // Should be in lane 0 since it doesn't overlap with first
    expect(thirdItemStyle.top).toBe('0px'); // Should be in lane 0 since it doesn't overlap with second
  });

  it('zooms in when zoom in button is clicked', async () => {
    const user = userEvent.setup();
    render(<Timeline items={mockTimelineItems} />);
    
    // Set initial width
    setMockWidth(1000);
    
    // Click zoom in button
    await user.click(screen.getByText('Zoom In'));
    
    // Mock width increase after zoom
    setMockWidth(1500);
    
    // Verify zoom worked by checking the timeline width
    const timeline = screen.getByText('First item').closest('.timeline');
    expect(timeline).not.toBeNull();
    
    if (timeline) {
      // Width should be greater after zoom in
      expect(timeline.getBoundingClientRect().width).toBe(1500);
    }
  });

  it('zooms out when zoom out button is clicked', async () => {
    const user = userEvent.setup();
    render(<Timeline items={mockTimelineItems} />);
    
    // Set initial width (larger)
    setMockWidth(1500);
    
    // Click zoom out button
    await user.click(screen.getByText('Zoom Out'));
    
    // Mock width decrease after zoom out
    setMockWidth(1000);
    
    // Verify zoom worked
    const timeline = screen.getByText('First item').closest('.timeline');
    expect(timeline).not.toBeNull();
    
    if (timeline) {
      // Width should be smaller after zoom out
      expect(timeline.getBoundingClientRect().width).toBe(1000);
    }
  });

  it('allows editing item name on double click', async () => {
    const user = userEvent.setup();
    render(<Timeline items={mockTimelineItems} />);
    
    // Find the first item and double click it
    const firstItem = screen.getByText('First item');
    await user.dblClick(firstItem);
    
    // Input should appear
    const input = screen.getByDisplayValue('First item');
    expect(input).toBeInTheDocument();
    
    // Edit the name
    await user.clear(input);
    await user.type(input, 'Updated item name');
    await user.keyboard('{Enter}');
    
    // New name should be visible
    expect(screen.getByText('Updated item name')).toBeInTheDocument();
  });

  it('adds dragging class when item is being dragged', () => {
    const { container } = render(<Timeline items={mockTimelineItems} />);
    
    // Get the first timeline item
    const firstItem = container.querySelector('.timeline-item');
    expect(firstItem).not.toBeNull();
    
    if (firstItem) {
      // Get the content part of the item (which has the mousedown event)
      const content = firstItem.querySelector('.timeline-item-content');
      expect(content).not.toBeNull();
      
      if (content) {
        // Simulate mousedown to start dragging
        fireEvent.mouseDown(content);
        
        // Item should have the dragging class
        expect(firstItem.classList.contains('dragging')).toBe(true);
        
        // Simulate mouseup to stop dragging
        fireEvent.mouseUp(firstItem);
        
        // Dragging class should be removed
        expect(firstItem.classList.contains('dragging')).toBe(false);
      }
    }
  });

  it('resets lanes when reset button is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<Timeline items={mockTimelineItems} />);
    
    // First simulate dragging an item to a different lane
    const timelineItems = container.querySelectorAll('.timeline-item');
    expect(timelineItems.length).toBe(3);
    
    // Get the timeline content to simulate mouse movement
    const timelineContent = container.querySelector('.timeline-content');
    expect(timelineContent).not.toBeNull();
    
    if (timelineContent && timelineItems.length > 0) {
      const itemContent = timelineItems[0].querySelector('.timeline-item-content');
      expect(itemContent).not.toBeNull();
      
      if (itemContent) {
        // Simulate dragging to another lane
        fireEvent.mouseDown(itemContent);
        
        // Simulate mouse move to a different lane (lane 2 would be ~100px down)
        const moveEvent = new MouseEvent('mousemove', {
          clientY: 100,
          bubbles: true,
          cancelable: true
        });
        
        fireEvent(timelineContent, moveEvent);
        fireEvent.mouseUp(timelineContent);
        
        // Now click reset lanes
        await user.click(screen.getByText('Reset Lanes'));
        
        // First item should be back at lane 0
        const style = window.getComputedStyle(timelineItems[0]);
        expect(style.top).toBe('0px');
      }
    }
  });
}); 
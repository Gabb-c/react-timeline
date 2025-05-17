import { describe, it, expect } from 'vitest';
import type { TimelineItem } from '../Timeline';

// Helper function to mimic the lane calculation logic in the Timeline component
function calculateLanes(items: TimelineItem[]): { item: TimelineItem, lane: number }[] {
  if (!items.length) return [];

  // Sort items by start date
  const sortedItems = [...items].sort((a, b) => 
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const lanes: { end: number }[] = [];
  const result: { item: TimelineItem, lane: number }[] = [];

  // Position each item in a lane
  sortedItems.forEach(item => {
    const startTime = new Date(item.start).getTime();
    const endTime = new Date(item.end).getTime();
    
    // Find the first lane where this item can fit
    let laneIndex = 0;
    while (laneIndex < lanes.length) {
      if (lanes[laneIndex].end < startTime) {
        break;
      }
      laneIndex++;
    }
    
    // If no lane was found, create a new one
    if (laneIndex === lanes.length) {
      lanes.push({ end: 0 });
    }
    
    // Update the lane's end time
    lanes[laneIndex].end = endTime;
    
    // Add positioned item to result
    result.push({
      item,
      lane: laneIndex
    });
  });

  return result;
}

describe('Timeline Lane Calculation Logic', () => {
  it('places non-overlapping items in the same lane', () => {
    const items: TimelineItem[] = [
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
    
    const result = calculateLanes(items);
    
    // All items should be in lane 0 since they don't overlap
    expect(result[0].lane).toBe(0);
    expect(result[1].lane).toBe(0);
    expect(result[2].lane).toBe(0);
  });
  
  it('places overlapping items in different lanes', () => {
    const items: TimelineItem[] = [
      {
        id: 1,
        start: "2021-01-01",
        end: "2021-01-10",
        name: "First item"
      },
      {
        id: 2,
        start: "2021-01-05",
        end: "2021-01-15",
        name: "Second item"
      },
      {
        id: 3,
        start: "2021-01-08",
        end: "2021-01-20",
        name: "Third item"
      }
    ];
    
    const result = calculateLanes(items);
    
    // Items overlap, so should be in different lanes
    expect(result[0].lane).toBe(0);
    expect(result[1].lane).toBe(1);
    expect(result[2].lane).toBe(2);
  });
  
  it('reuses lanes when possible', () => {
    const items: TimelineItem[] = [
      {
        id: 1,
        start: "2021-01-01",
        end: "2021-01-05",
        name: "First item"
      },
      {
        id: 3,
        start: "2021-01-03",
        end: "2021-01-08",
        name: "Overlapping item"
      },
      {
        id: 2,
        start: "2021-01-09",
        end: "2021-01-12",
        name: "Second item"
      }
    ];
    
    const result = calculateLanes(items);
    
    // Items will be sorted by start date for lane assignment:
    // item1: 2021-01-01 to 2021-01-05 (lane 0)
    // item3: 2021-01-03 to 2021-01-08 (lane 1 - overlaps with item1)
    // item2: 2021-01-09 to 2021-01-12 (lane 0 - doesn't overlap with item1 or item3)
    
    const item1Result = result.find(r => r.item.id === 1);
    const item2Result = result.find(r => r.item.id === 2);
    const item3Result = result.find(r => r.item.id === 3);
    
    expect(item1Result?.lane).toBe(0);
    expect(item3Result?.lane).toBe(1);
    expect(item2Result?.lane).toBe(0);
  });
  
  it('handles empty input', () => {
    const result = calculateLanes([]);
    expect(result).toEqual([]);
  });
  
  it('handles items with same start and end date', () => {
    const items: TimelineItem[] = [
      {
        id: 1,
        start: "2021-01-01",
        end: "2021-01-01",
        name: "Single day item 1"
      },
      {
        id: 2,
        start: "2021-01-01",
        end: "2021-01-01",
        name: "Single day item 2"
      }
    ];
    
    const result = calculateLanes(items);
    
    // Both items are on the same day, so they should be in different lanes
    expect(result[0].lane).toBe(0);
    expect(result[1].lane).toBe(1);
  });
  
  it('sorts items by start date before lane calculation', () => {
    const items: TimelineItem[] = [
      {
        id: 1,
        start: "2021-01-10",
        end: "2021-01-15",
        name: "Later item"
      },
      {
        id: 2,
        start: "2021-01-01",
        end: "2021-01-05",
        name: "Earlier item"
      }
    ];
    
    const result = calculateLanes(items);
    
    // The earlier item should be processed first and get lane 0
    expect(result.find(r => r.item.id === 2)?.lane).toBe(0);
    expect(result.find(r => r.item.id === 1)?.lane).toBe(0); // Doesn't overlap, so same lane
  });
}); 
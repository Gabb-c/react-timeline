import { useState, useEffect, useMemo, useRef } from 'react';
import './Timeline.css';

export interface TimelineItem {
  id: number;
  start: string;
  end: string;
  name: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

interface PositionedItem extends TimelineItem {
  lane: number;
  startX: number;
  width: number;
}

const Timeline: React.FC<TimelineProps> = ({ items }) => {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState<{ 
    id: number, 
    type: 'start' | 'end' | 'move', 
    initialX: number, 
    initialY: number,
    initialDate: Date,
    initialLane?: number
  } | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>(items);
  const [customLanes, setCustomLanes] = useState<Record<number, number>>({});
  const timelineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate the date range of all items
  const { minDate, maxDate, daysDifference } = useMemo(() => {
    if (!timelineItems.length) return { minDate: new Date(), maxDate: new Date(), daysDifference: 0 };

    // Find earliest start date and latest end date
    const dates = timelineItems.flatMap(item => [new Date(item.start), new Date(item.end)]);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Add some padding days
    minDate.setDate(minDate.getDate() - 2);
    maxDate.setDate(maxDate.getDate() + 2);
    
    // Calculate total days in our range
    const daysDifference = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return { minDate, maxDate, daysDifference };
  }, [timelineItems]);

  // Position items in lanes to avoid overlaps
  const positionedItems: PositionedItem[] = useMemo(() => {
    if (!timelineItems.length) return [];

    // Sort items by start date
    const sortedItems = [...timelineItems].sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    const lanes: { end: number }[] = [];
    const result: PositionedItem[] = [];

    // Position each item in a lane
    sortedItems.forEach(item => {
      const startTime = new Date(item.start).getTime();
      const endTime = new Date(item.end).getTime();
      
      // Calculate position based on minDate
      const startX = (startTime - minDate.getTime()) / (1000 * 60 * 60 * 24);
      const width = Math.max(1, (endTime - startTime) / (1000 * 60 * 60 * 24) + 1);
      
      // If this item has a custom lane, use it
      if (customLanes[item.id] !== undefined) {
        result.push({
          ...item,
          lane: customLanes[item.id],
          startX,
          width
        });
        return;
      }
      
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
        ...item,
        lane: laneIndex,
        startX,
        width
      });
    });

    return result;
  }, [timelineItems, minDate, customLanes]);

  // Calculate the maximum lane index
  const maxLane = useMemo(() => {
    if (!positionedItems.length) return 0;
    return Math.max(...positionedItems.map(item => item.lane));
  }, [positionedItems]);

  // Handle zoom functionality
  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale * 1.5, 5));
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale / 1.5, 0.5));
  };

  // Generate dates for the timeline header
  const timelineDates = useMemo(() => {
    const dates = [];
    const currentDate = new Date(minDate);
    
    while (currentDate <= maxDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }, [minDate, maxDate]);

  // Get a day coordinate from a mouse event
  const getDayFromMouseEvent = (e: React.MouseEvent): number | null => {
    if (!timelineRef.current) return null;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // If outside timeline, return null
    if (x < 0 || x > rect.width) return null;
    
    // Calculate day width and get the day offset
    const dayWidth = (rect.width) / (daysDifference * scale);
    return x / dayWidth;
  };

  // Get a lane coordinate from a mouse event
  const getLaneFromMouseEvent = (e: React.MouseEvent): number | null => {
    if (!contentRef.current) return null;
    
    const rect = contentRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // If outside timeline content, return null
    if (y < 0) return null;
    
    // Calculate lane based on Y position (lane height is 50px)
    const laneHeight = 50;
    const lane = Math.floor(y / laneHeight);
    
    // Ensure lane is not negative
    return Math.max(0, lane);
  };

  // Handle item dragging
  const handleMouseDown = (id: number, type: 'start' | 'end' | 'move') => (e: React.MouseEvent) => {
    e.preventDefault();
    const dayOffset = getDayFromMouseEvent(e);
    if (dayOffset === null) return;

    // Find the item and its position to get current dates and lane
    const item = timelineItems.find(item => item.id === id);
    const positionedItem = positionedItems.find(item => item.id === id);
    if (!item || !positionedItem) return;
    
    // Store initial position, date and lane
    const initialDate = new Date(type === 'end' ? item.end : item.start);
    const initialY = e.clientY;
    
    setIsDragging(true);
    setDragItem({ 
      id, 
      type, 
      initialX: dayOffset,
      initialY,
      initialDate,
      initialLane: positionedItem.lane
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragItem) return;
    
    const dayOffset = getDayFromMouseEvent(e);
    if (dayOffset === null) return;
    
    // Calculate how many days we've moved horizontally
    const dayDelta = Math.round(dayOffset - dragItem.initialX);
    
    // Calculate the new date based on the initial date plus the delta
    const newDate = new Date(dragItem.initialDate);
    newDate.setDate(newDate.getDate() + dayDelta);
    
    // Format to YYYY-MM-DD
    const formattedDate = newDate.toISOString().split('T')[0];
    
    // Handle vertical movement for 'move' type only
    if (dragItem.type === 'move') {
      const lane = getLaneFromMouseEvent(e);
      if (lane !== null && lane !== dragItem.initialLane) {
        // Update the custom lane for this item
        setCustomLanes(prev => ({
          ...prev,
          [dragItem.id]: lane
        }));
      }
    }
    
    setTimelineItems(prevItems => 
      prevItems.map(item => {
        if (item.id === dragItem.id) {
          if (dragItem.type === 'start') {
            // Ensure start date is not after end date
            const endDate = new Date(item.end);
            if (newDate > endDate) return item;
            return { ...item, start: formattedDate };
          } else if (dragItem.type === 'end') {
            // Ensure end date is not before start date
            const startDate = new Date(item.start);
            if (newDate < startDate) return item;
            return { ...item, end: formattedDate };
          } else if (dragItem.type === 'move') {
            // Move both start and end dates, maintaining the duration
            const startDate = new Date(item.start);
            const endDate = new Date(item.end);
            const duration = endDate.getTime() - startDate.getTime();
            
            const newStartDate = new Date(dragItem.initialDate);
            newStartDate.setDate(newStartDate.getDate() + dayDelta);
            
            const newEndDate = new Date(newStartDate.getTime() + duration);
            
            return { 
              ...item, 
              start: newStartDate.toISOString().split('T')[0],
              end: newEndDate.toISOString().split('T')[0]
            };
          }
        }
        return item;
      })
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragItem(null);
  };

  useEffect(() => {
    // Add global mouse up event to handle dragging that goes outside the component
    if (isDragging) {
      const handleGlobalMouseUp = () => {
        setIsDragging(false);
        setDragItem(null);
      };
      
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging]);

  // Handle inline editing
  const handleDoubleClick = (id: number, name: string) => {
    setEditingItem(id);
    setEditingText(name);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingText(e.target.value);
  };

  const handleEditComplete = () => {
    if (editingItem !== null) {
      setTimelineItems(prevItems => 
        prevItems.map(item => 
          item.id === editingItem ? { ...item, name: editingText } : item
        )
      );
      setEditingItem(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditComplete();
    } else if (e.key === 'Escape') {
      setEditingItem(null);
    }
  };

  // Reset all custom lanes
  const handleResetLanes = () => {
    setCustomLanes({});
  };

  return (
    <div className="timeline-container">
      <div className="timeline-controls">
        <button onClick={handleZoomIn}>Zoom In</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
        <button onClick={handleResetLanes}>Reset Lanes</button>
      </div>
      
      <div 
        ref={timelineRef}
        className="timeline" 
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ width: `${daysDifference * scale * 30}px` }}
      >
        {/* Timeline header with dates */}
        <div className="timeline-header">
          {timelineDates.map((date, i) => (
            <div 
              key={i} 
              className="timeline-date"
              style={{ 
                width: `${scale * 30}px`,
                minWidth: `${scale * 30}px`
              }}
            >
              {i % 2 === 0 && (
                <div className="date-label">
                  {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Timeline content with items */}
        <div 
          ref={contentRef}
          className="timeline-content"
          style={{ height: `${(maxLane + 2) * 50}px` }}
        >
          {/* Lane guidelines */}
          {Array.from({ length: maxLane + 2 }).map((_, index) => (
            <div 
              key={`lane-${index}`}
              className="timeline-lane"
              style={{ top: `${index * 50}px` }}
            />
          ))}
          
          {positionedItems.map((item) => (
            <div 
              key={item.id}
              className={`timeline-item ${isDragging && dragItem?.id === item.id ? 'dragging' : ''}`}
              style={{
                left: `${item.startX * scale * 30}px`,
                width: `${item.width * scale * 30}px`,
                top: `${item.lane * 50}px`,
              }}
            >
              <div 
                className="timeline-item-resizer left"
                onMouseDown={handleMouseDown(item.id, 'start')}
              />
              
              <div 
                className="timeline-item-content"
                onMouseDown={handleMouseDown(item.id, 'move')}
                onDoubleClick={() => handleDoubleClick(item.id, item.name)}
              >
                {editingItem === item.id ? (
                  <input 
                    type="text" 
                    value={editingText}
                    onChange={handleEditChange}
                    onBlur={handleEditComplete}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                ) : (
                  <span className="timeline-item-name">{item.name}</span>
                )}
                <div className="timeline-item-dates">
                  {item.start} - {item.end}
                </div>
              </div>
              
              <div 
                className="timeline-item-resizer right"
                onMouseDown={handleMouseDown(item.id, 'end')}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline; 
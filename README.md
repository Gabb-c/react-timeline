# React Timeline

A component for visualizing events on a timeline with space-efficient layout.

## Features

- Arranges events in a compact space-efficient way (events that don't overlap in time can share a horizontal lane)
- Zoom in/out functionality for better visualization
- Drag and drop support to modify event dates
- Inline editing of event names
- Responsive design

## Installation and Setup

This project is built with React, TypeScript, and Vite.

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm

### Setup Instructions

1. Clone the repository
2. Install dependencies
```bash
pnpm install
```
3. Start the development server
```bash
pnpm dev
```
4. Open your browser and navigate to http://localhost:5173

## Usage

The Timeline component takes an array of events, where each event has a name, start date, and end date.

```tsx
import Timeline from './components/Timeline';
import type { TimelineItem } from './components/Timeline';

const events: TimelineItem[] = [
  {
    id: 1,
    start: "2021-01-01",
    end: "2021-01-05",
    name: "Event 1"
  },
  // Add more events here
];

function App() {
  return (
    <div>
      <Timeline items={events} />
    </div>
  );
}
```

## How It Works

The timeline layout uses an algorithm to arrange events efficiently:

1. Events are sorted by start date
2. Each event is placed in the first available lane (horizontal row)
3. An event can share a lane with another event if it starts after the other event ends

## Testing

The project includes comprehensive unit tests built with Vitest and React Testing Library. Tests cover core functionality including:

- Lane calculation algorithm
- Date utility functions
- Component rendering
- User interactions (zooming, dragging, editing)

### Running Tests

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Time Spent

I spent approximately 3 hours on this assignment.

## What I Like About My Implementation

- The timeline algorithm efficiently packs events to minimize vertical space
- Interactive features (zoom, drag-drop, editing) make the component practical for real-world use
- Clean separation of concerns in the component architecture
- TypeScript for improved type safety and developer experience
- Modern React patterns using hooks and functional components
- Comprehensive test coverage for reliability

## What I Would Change

- Improve performance for large datasets with virtualization
- Add more customization options (colors, sizes, etc.)
- Implement keyboard navigation for better accessibility
- Add unit and integration tests for better coverage
- Further optimize the lane-assignment algorithm for edge cases

## Design Decisions

I drew inspiration from tools like Google Calendar and project management timelines. Key design decisions included:

1. Horizontal layout for time progression (left to right)
2. Lane-based event arrangement for efficient space usage
3. Interactive features for a modern UX
4. Simple and clean visual design with good contrast
5. Responsive approach to handle different screen sizes

## Testing Approach

The testing approach included:

1. Unit tests for the lane assignment algorithm and date utilities
2. Component tests for event rendering
3. Interactive tests for user interactions (drag, edit, zoom)
4. Visual verification of layout changes

Technologies used: Vitest, React Testing Library, and JSDOM.

## Build and Run Instructions

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test
```

The production build will be available in the `dist` folder.

import './App.css';
import Timeline from './components/Timeline';
import type { TimelineItem } from './components/Timeline';

const timelineItems: TimelineItem[] = [
  {
    id: 1,
    start: "2021-01-01",
    end: "2021-01-05",
    name: "First item"
  },
  {
    id: 2,
    start: "2021-01-02",
    end: "2021-01-08",
    name: "Second item"
  },
  {
    id: 3,
    start: "2021-01-06",
    end: "2021-01-13",
    name: "Another item"
  },
  {
    id: 4,
    start: "2021-01-14",
    end: "2021-01-14",
    name: "Another item"
  },
  {
    id: 5,
    start: "2021-02-01",
    end: "2021-02-15",
    name: "Third item"
  },
  {
    id: 6,
    start: "2021-01-12",
    end: "2021-02-16",
    name: "Fourth item with a super long name"
  },
  {
    id: 7,
    start: "2021-02-01",
    end: "2021-02-02",
    name: "Fifth item with a super long name"
  },
  {
    id: 8,
    start: "2021-01-03",
    end: "2021-01-05",
    name: "First item"
  },
  {
    id: 9,
    start: "2021-01-04",
    end: "2021-01-08",
    name: "Second item"
  },
  {
    id: 10,
    start: "2021-01-06",
    end: "2021-01-13",
    name: "Another item"
  },
  {
    id: 11,
    start: "2021-01-09",
    end: "2021-01-09",
    name: "Another item"
  },
  {
    id: 12,
    start: "2021-02-01",
    end: "2021-02-15",
    name: "Third item"
  },
  {
    id: 13,
    start: "2021-01-12",
    end: "2021-02-16",
    name: "Fourth item with a super long name"
  },
  {
    id: 14,
    start: "2021-02-01",
    end: "2021-02-02",
    name: "Fifth item with a super long name"
  }
];

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>React Timeline</h1>
        <p>Interactive timeline component for visualizing events</p>
      </header>
      <main className="app-content">
        <Timeline items={timelineItems} />
      </main>
    </div>
  );
}

export default App;

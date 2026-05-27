# Zenith — Minimal Productivity App

A beautifully minimal productivity app inspired by apps like **Things 3**, **Bear**, and **Oak**. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features

### 📋 Today View
- Personalized greeting based on time of day
- Daily progress bar to visualize completion
- **Focus task** callout — star any task to highlight it as your main priority
- Tasks with priority levels (High / Medium / Low)

### ✅ Task Manager
- Add tasks with a single-line input
- Expandable task notes
- Filter by status (All / Pending / Done)
- Sort by date, priority, or alphabetically
- Full-text search

### ⏱ Pomodoro Timer
- Classic 25/5 work-break cycle (fully customizable)
- Animated circular progress ring
- Session tracking with dot indicators
- Long break after N sessions
- Browser notifications when sessions complete
- Updates the page title with live countdown

### 📝 Notes
- Two-panel layout (list + editor)
- Auto-saves as you type
- Pin important notes to the top
- First line becomes the note title
- Search across all notes

### 📊 Stats (Sidebar)
- 🔥 Daily streak tracking
- ⚡ Total focus time accumulated

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🛠 Tech Stack

- **React 19** + **TypeScript**
- **Vite 8** (lightning-fast build tool)
- **Tailwind CSS v4** (utility-first styling)
- **Lucide React** (beautiful icons)
- **localStorage** for data persistence (no backend needed)

## 📁 Project Structure

```
src/
├── components/
│   ├── Sidebar.tsx       # Navigation + stats
│   ├── TaskItem.tsx      # Individual task card
│   └── AddTaskInput.tsx  # Task creation input
├── views/
│   ├── TodayView.tsx     # Today's dashboard
│   ├── TasksView.tsx     # Full task manager
│   ├── TimerView.tsx     # Pomodoro timer
│   └── NotesView.tsx     # Notes editor
├── hooks/
│   ├── useLocalStorage.ts  # Persistent state
│   └── useTimer.ts         # Timer logic
├── types/
│   └── index.ts          # TypeScript interfaces
├── App.tsx               # Root component + state
└── index.css             # Global styles + animations
```

## 🎨 Design Philosophy

- **No clutter** — every element earns its place
- **Keyboard friendly** — press Enter to add tasks, Escape to cancel
- **Zero dependencies on external services** — all data stays local
- **Smooth micro-animations** — slide-in tasks, animated progress ring, hover states

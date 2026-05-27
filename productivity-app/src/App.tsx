import { useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TodayView } from './views/TodayView';
import { TasksView } from './views/TasksView';
import { TimerView } from './views/TimerView';
import { NotesView } from './views/NotesView';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Task, Note, View, Priority, TimerSettings, AppData } from './types';

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLong: 4,
};

const DEFAULT_DATA: AppData = {
  tasks: [],
  notes: [],
  timerSettings: DEFAULT_TIMER_SETTINGS,
  stats: {
    totalTasksCompleted: 0,
    currentStreak: 0,
    lastActiveDate: '',
    totalFocusMinutes: 0,
  },
};

export default function App() {
  const [data, setData] = useLocalStorage<AppData>('zenith-data', DEFAULT_DATA);
  const [view, setView] = useLocalStorage<View>('zenith-view', 'today');

  // ── Task operations ──────────────────────────────────────────
  const addTask = useCallback((text: string, priority: Priority) => {
    const task: Task = {
      id: generateId(),
      text,
      priority,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };
    setData(d => ({ ...d, tasks: [task, ...d.tasks] }));
  }, [setData]);

  const toggleTask = useCallback((id: string) => {
    setData(d => {
      const tasks = d.tasks.map(t => {
        if (t.id !== id) return t;
        const isDone = t.status === 'done';
        return {
          ...t,
          status: isDone ? 'todo' : 'done',
          completedAt: isDone ? undefined : new Date().toISOString(),
          isFocus: isDone ? t.isFocus : false,
        } as Task;
      });

      const justCompleted = d.tasks.find(t => t.id === id && t.status === 'todo');
      const newCompleted = justCompleted ? d.stats.totalTasksCompleted + 1 : d.stats.totalTasksCompleted;

      // Update streak
      const last = d.stats.lastActiveDate;
      const today = todayKey();
      let streak = d.stats.currentStreak;
      if (justCompleted) {
        if (last === today) {
          streak = d.stats.currentStreak;
        } else {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yKey = yesterday.toISOString().slice(0, 10);
          streak = last === yKey ? streak + 1 : 1;
        }
      }

      return {
        ...d,
        tasks,
        stats: {
          ...d.stats,
          totalTasksCompleted: newCompleted,
          currentStreak: streak,
          lastActiveDate: justCompleted ? today : d.stats.lastActiveDate,
        },
      };
    });
  }, [setData]);

  const deleteTask = useCallback((id: string) => {
    setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) }));
  }, [setData]);

  const setFocusTask = useCallback((id: string) => {
    setData(d => ({
      ...d,
      tasks: d.tasks.map(t => ({ ...t, isFocus: t.id === id ? !t.isFocus : false })),
    }));
  }, [setData]);

  const updateTaskNote = useCallback((id: string, note: string) => {
    setData(d => ({
      ...d,
      tasks: d.tasks.map(t => t.id === id ? { ...t, notes: note } : t),
    }));
  }, [setData]);

  // ── Note operations ──────────────────────────────────────────
  const addNote = useCallback(() => {
    const note: Note = {
      id: generateId(),
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData(d => ({ ...d, notes: [note, ...d.notes] }));
  }, [setData]);

  const updateNote = useCallback((id: string, content: string) => {
    setData(d => ({
      ...d,
      notes: d.notes.map(n =>
        n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n
      ),
    }));
  }, [setData]);

  const deleteNote = useCallback((id: string) => {
    setData(d => ({ ...d, notes: d.notes.filter(n => n.id !== id) }));
  }, [setData]);

  const pinNote = useCallback((id: string) => {
    setData(d => ({
      ...d,
      notes: d.notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n),
    }));
  }, [setData]);

  // ── Timer ────────────────────────────────────────────────────
  const handleFocusComplete = useCallback((minutes: number) => {
    setData(d => ({
      ...d,
      stats: { ...d.stats, totalFocusMinutes: d.stats.totalFocusMinutes + minutes },
    }));
  }, [setData]);

  const handleSettingsChange = useCallback((s: TimerSettings) => {
    setData(d => ({ ...d, timerSettings: s }));
  }, [setData]);

  // ── Derived values ───────────────────────────────────────────
  const pendingCount = data.tasks.filter(t => t.status === 'todo').length;
  const focusTask = data.tasks.find(t => t.isFocus && t.status === 'todo');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        view={view}
        onViewChange={setView}
        todayCount={pendingCount}
        streak={data.stats.currentStreak}
        focusMinutes={data.stats.totalFocusMinutes}
      />

      {/* Main content */}
      <main className={`flex-1 overflow-y-auto ${view === 'notes' ? 'flex' : 'px-8 py-8'}`}>
        <div className={view === 'notes' ? 'flex-1 flex' : 'w-full fade-in'}>
          {view === 'today' && (
            <TodayView
              tasks={data.tasks}
              onAddTask={addTask}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onSetFocus={setFocusTask}
              onUpdateNote={updateTaskNote}
              focusTask={focusTask}
            />
          )}
          {view === 'tasks' && (
            <TasksView
              tasks={data.tasks}
              onAddTask={addTask}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onSetFocus={setFocusTask}
              onUpdateNote={updateTaskNote}
            />
          )}
          {view === 'timer' && (
            <TimerView
              settings={data.timerSettings}
              onFocusComplete={handleFocusComplete}
              onSettingsChange={handleSettingsChange}
            />
          )}
          {view === 'notes' && (
            <NotesView
              notes={data.notes}
              onAdd={addNote}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onPin={pinNote}
            />
          )}
        </div>
      </main>
    </div>
  );
}

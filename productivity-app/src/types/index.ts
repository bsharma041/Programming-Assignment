export type Priority = 'high' | 'medium' | 'low';

export type TaskStatus = 'todo' | 'done';

export interface Task {
  id: string;
  text: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
  isFocus?: boolean;
}

export interface Note {
  id: string;
  content: string;
  updatedAt: string;
  createdAt: string;
  pinned?: boolean;
}

export interface TimerSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLong: number;
}

export interface TimerState {
  phase: 'work' | 'shortBreak' | 'longBreak';
  secondsLeft: number;
  isRunning: boolean;
  sessionCount: number;
  totalFocusMinutes: number;
}

export interface AppData {
  tasks: Task[];
  notes: Note[];
  timerSettings: TimerSettings;
  stats: {
    totalTasksCompleted: number;
    currentStreak: number;
    lastActiveDate: string;
    totalFocusMinutes: number;
  };
}

export type View = 'today' | 'tasks' | 'timer' | 'notes';

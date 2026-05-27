
import { Sunrise, CheckCircle2, Zap } from 'lucide-react';
import type { Task, Priority } from '../types';
import { TaskItem } from '../components/TaskItem';
import { AddTaskInput } from '../components/AddTaskInput';

interface TodayViewProps {
  tasks: Task[];
  onAddTask: (text: string, priority: Priority) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSetFocus: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  focusTask?: Task;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function TodayView({ tasks, onAddTask, onToggle, onDelete, onSetFocus, onUpdateNote, focusTask }: TodayViewProps) {
  const pending = tasks.filter(t => t.status === 'todo');
  const done = tasks.filter(t => t.status === 'done');
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done.length / total) * 100) : 0;

  return (
    <div className="max-w-xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <Sunrise size={16} />
          <span className="text-sm font-medium">{formatDate()}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{getGreeting()} 👋</h1>
        <p className="text-gray-400 text-sm mt-1">
          {pending.length === 0 && total > 0
            ? "You've completed everything today! 🎉"
            : `${pending.length} task${pending.length !== 1 ? 's' : ''} left to go`}
        </p>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Daily progress</span>
            <span className="font-semibold text-gray-600">{done.length}/{total}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Focus task callout */}
      {focusTask && focusTask.status === 'todo' && (
        <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-2 text-blue-500 text-xs font-semibold mb-2">
            <Zap size={13} fill="currentColor" />
            <span>TODAY'S FOCUS</span>
          </div>
          <p className="text-gray-800 font-medium text-sm leading-relaxed">{focusTask.text}</p>
          <button
            onClick={() => onToggle(focusTask.id)}
            className="mt-3 text-xs text-blue-500 font-medium hover:text-blue-600 flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 size={13} />
            Mark complete
          </button>
        </div>
      )}

      {/* Add task */}
      <div className="mb-4">
        <AddTaskInput onAdd={onAddTask} placeholder="What needs to get done today?" />
      </div>

      {/* Pending tasks */}
      {pending.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Pending</h2>
          <div className="space-y-2">
            {pending.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onSetFocus={onSetFocus}
                onUpdateNote={onUpdateNote}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed tasks */}
      {done.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-300 uppercase tracking-widest mb-3">
            Completed · {done.length}
          </h2>
          <div className="space-y-2">
            {done.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onSetFocus={onSetFocus}
                onUpdateNote={onUpdateNote}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {total === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center mb-4 text-3xl">
            ✨
          </div>
          <p className="text-gray-400 text-sm">Your day is a blank canvas.</p>
          <p className="text-gray-300 text-xs mt-1">Add your first task to get started.</p>
        </div>
      )}
    </div>
  );
}

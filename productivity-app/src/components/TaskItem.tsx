import { useState } from 'react';
import { Trash2, Star, ChevronDown, ChevronUp } from 'lucide-react';
import type { Task, Priority } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSetFocus: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
}

const priorityColors: Record<Priority, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-gray-300',
};

const priorityRing: Record<Priority, string> = {
  high: 'ring-red-200',
  medium: 'ring-amber-200',
  low: 'ring-gray-200',
};

export function TaskItem({ task, onToggle, onDelete, onSetFocus, onUpdateNote }: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(task.notes ?? '');
  const isDone = task.status === 'done';

  return (
    <div
      className={`task-enter group bg-white rounded-2xl border transition-all duration-200 ${
        isDone ? 'border-gray-100 opacity-60' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
      } ${task.isFocus && !isDone ? 'ring-2 ring-blue-200 border-blue-100' : ''}`}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isDone
              ? 'bg-green-500 border-green-500'
              : `border-gray-300 hover:border-blue-400 ring-2 ring-transparent hover:ring-blue-100 ${priorityRing[task.priority]}`
          }`}
        >
          {isDone && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Priority dot */}
        <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${priorityColors[task.priority]} ${isDone ? 'opacity-40' : ''}`} />

        {/* Text */}
        <span
          className={`flex-1 text-sm leading-snug ${
            isDone ? 'line-through text-gray-400' : 'text-gray-800'
          }`}
        >
          {task.text}
        </span>

        {/* Focus star */}
        {!isDone && (
          <button
            onClick={() => onSetFocus(task.id)}
            className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
              task.isFocus ? '!opacity-100 text-amber-400' : 'text-gray-300 hover:text-amber-400'
            }`}
          >
            <Star size={14} fill={task.isFocus ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* Expand notes */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-gray-500 cursor-pointer"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(task.id)}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Expanded notes */}
      {expanded && (
        <div className="px-4 pb-3 pt-0 border-t border-gray-50">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            onBlur={() => onUpdateNote(task.id, note)}
            placeholder="Add a note…"
            rows={2}
            className="w-full text-xs text-gray-500 placeholder-gray-300 resize-none bg-transparent outline-none pt-2.5 leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}

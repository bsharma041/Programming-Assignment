import { useState } from 'react';
import { SortAsc } from 'lucide-react';
import type { Task, Priority } from '../types';
import { TaskItem } from '../components/TaskItem';
import { AddTaskInput } from '../components/AddTaskInput';

interface TasksViewProps {
  tasks: Task[];
  onAddTask: (text: string, priority: Priority) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSetFocus: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
}

type FilterType = 'all' | 'todo' | 'done';
type SortType = 'created' | 'priority' | 'alpha';

const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function TasksView({ tasks, onAddTask, onToggle, onDelete, onSetFocus, onUpdateNote }: TasksViewProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('created');
  const [search, setSearch] = useState('');

  const filtered = tasks
    .filter(t => {
      if (filter === 'todo') return t.status === 'todo';
      if (filter === 'done') return t.status === 'done';
      return true;
    })
    .filter(t => !search || t.text.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
      if (sort === 'alpha') return a.text.localeCompare(b.text);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="max-w-xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">All Tasks</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {todoCount} pending · {doneCount} completed
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search tasks…"
          className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all"
        />
      </div>

      {/* Filters + Sort */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(['all', 'todo', 'done'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filter === f ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {f === 'all' ? 'All' : f === 'todo' ? 'Pending' : 'Done'}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
          <SortAsc size={13} />
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortType)}
            className="bg-transparent text-gray-500 text-xs outline-none cursor-pointer"
          >
            <option value="created">Date</option>
            <option value="priority">Priority</option>
            <option value="alpha">A–Z</option>
          </select>
        </div>
      </div>

      {/* Add task */}
      <div className="mb-5">
        <AddTaskInput onAdd={onAddTask} placeholder="Add a new task…" />
      </div>

      {/* Task list */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map(task => (
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
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-4">{search ? '🔍' : '📋'}</div>
          <p className="text-gray-400 text-sm">
            {search ? 'No tasks match your search.' : 'No tasks here yet.'}
          </p>
          {!search && <p className="text-gray-300 text-xs mt-1">Add one above to get started.</p>}
        </div>
      )}
    </div>
  );
}

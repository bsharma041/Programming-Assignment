import { useState, useRef } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import type { Priority } from '../types';

interface AddTaskInputProps {
  onAdd: (text: string, priority: Priority) => void;
  placeholder?: string;
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: 'text-red-500' },
  { value: 'medium', label: 'Medium', color: 'text-amber-500' },
  { value: 'low', label: 'Low', color: 'text-gray-400' },
];

export function AddTaskInput({ onAdd, placeholder = 'Add a task…' }: AddTaskInputProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [showPriority, setShowPriority] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed, priority);
    setText('');
    inputRef.current?.focus();
  };

  const selected = priorities.find(p => p.value === priority)!;

  return (
    <div className="relative flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm hover:border-gray-200 focus-within:border-blue-200 focus-within:shadow-md focus-within:ring-4 focus-within:ring-blue-50 transition-all duration-200">
      <button
        onClick={submit}
        className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-300 hover:border-blue-400 hover:text-blue-400 transition-colors cursor-pointer"
      >
        <Plus size={11} strokeWidth={3} />
      </button>

      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') { setText(''); setShowPriority(false); }
        }}
        placeholder={placeholder}
        className="flex-1 text-sm text-gray-800 placeholder-gray-300 bg-transparent outline-none"
      />

      {/* Priority picker */}
      <div className="relative">
        <button
          onClick={() => setShowPriority(s => !s)}
          className={`flex items-center gap-1 text-xs font-medium ${selected.color} hover:opacity-70 transition-opacity cursor-pointer`}
        >
          <span>{selected.label}</span>
          <ChevronDown size={11} />
        </button>

        {showPriority && (
          <div className="absolute right-0 bottom-full mb-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-10 min-w-[90px] slide-up">
            {priorities.map(p => (
              <button
                key={p.value}
                onClick={() => { setPriority(p.value); setShowPriority(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-medium ${p.color} hover:bg-gray-50 transition-colors cursor-pointer`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

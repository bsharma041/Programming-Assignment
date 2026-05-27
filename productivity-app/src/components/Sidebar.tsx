import React from 'react';
import { CheckSquare, Clock, FileText, Home, BarChart2 } from 'lucide-react';
import type { View } from '../types';

interface SidebarProps {
  view: View;
  onViewChange: (v: View) => void;
  todayCount: number;
  streak: number;
  focusMinutes: number;
}

const navItems: { view: View; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string }[] = [
  { view: 'today', icon: Home, label: 'Today' },
  { view: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { view: 'timer', icon: Clock, label: 'Focus' },
  { view: 'notes', icon: FileText, label: 'Notes' },
];

export function Sidebar({ view, onViewChange, todayCount, streak, focusMinutes }: SidebarProps) {
  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col min-h-screen">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">Z</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm tracking-tight">Zenith</span>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">Minimal productivity</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ view: v, icon: Icon, label }) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
              view === v
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Icon size={16} strokeWidth={view === v ? 2.5 : 2} />
            <span>{label}</span>
            {v === 'today' && todayCount > 0 && (
              <span className="ml-auto text-xs font-semibold bg-blue-100 text-blue-600 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {todayCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Stats */}
      <div className="px-4 py-4 border-t border-gray-100 space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <BarChart2 size={13} />
          <span className="font-medium text-gray-500">Your stats</span>
        </div>
        <StatRow emoji="🔥" label="Streak" value={`${streak}d`} />
        <StatRow emoji="⚡" label="Focus" value={`${Math.round(focusMinutes / 60)}h ${focusMinutes % 60}m`} />
      </div>
    </aside>
  );
}

function StatRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <span>{emoji}</span>
        <span>{label}</span>
      </div>
      <span className="text-xs font-semibold text-gray-600">{value}</span>
    </div>
  );
}

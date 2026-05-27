import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Settings } from 'lucide-react';
import type { TimerSettings } from '../types';
import { useTimer } from '../hooks/useTimer';

interface TimerViewProps {
  settings: TimerSettings;
  onFocusComplete: (minutes: number) => void;
  onSettingsChange: (s: TimerSettings) => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const PHASE_COLORS = {
  work: {
    ring: '#4f7af8',
    bg: 'from-blue-50 to-indigo-50',
    label: 'Focus',
    accent: 'text-blue-600',
    button: 'bg-blue-500 hover:bg-blue-600',
    glow: 'timer-glow',
  },
  shortBreak: {
    ring: '#22c55e',
    bg: 'from-green-50 to-emerald-50',
    label: 'Short Break',
    accent: 'text-green-600',
    button: 'bg-green-500 hover:bg-green-600',
    glow: 'break-glow',
  },
  longBreak: {
    ring: '#8b5cf6',
    bg: 'from-violet-50 to-purple-50',
    label: 'Long Break',
    accent: 'text-violet-600',
    button: 'bg-violet-500 hover:bg-violet-600',
    glow: '',
  },
};

const CIRCUMFERENCE = 2 * Math.PI * 80; // r=80

export function TimerView({ settings, onFocusComplete, onSettingsChange }: TimerViewProps) {
  const { state, toggle, reset, skip, setPhase, progress } = useTimer(settings);
  const [showSettings, setShowSettings] = React.useState(false);
  const [localSettings, setLocalSettings] = React.useState(settings);

  const colors = PHASE_COLORS[state.phase];
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  // Notify parent when session completes
  const prevIsRunning = React.useRef(false);
  useEffect(() => {
    if (prevIsRunning.current && !state.isRunning && progress >= 0.99) {
      if (state.phase !== 'work') {
        // A work session just completed (phase already advanced)
        onFocusComplete(settings.workMinutes);
      }
    }
    prevIsRunning.current = state.isRunning;
  }, [state.isRunning, state.phase, progress, onFocusComplete, settings.workMinutes]);

  // Update document title
  useEffect(() => {
    if (state.isRunning) {
      document.title = `${formatTime(state.secondsLeft)} — ${colors.label} | Zenith`;
    } else {
      document.title = 'Zenith — Minimal Productivity';
    }
    return () => { document.title = 'Zenith — Minimal Productivity'; };
  }, [state.secondsLeft, state.isRunning, colors.label]);

  const saveSettings = () => {
    onSettingsChange(localSettings);
    setShowSettings(false);
  };

  const sessionDots = Array.from({ length: settings.sessionsBeforeLong }, (_, i) => (
    <div
      key={i}
      className={`w-2 h-2 rounded-full transition-all duration-300 ${
        i < state.sessionCount % settings.sessionsBeforeLong
          ? 'bg-blue-400 scale-110'
          : 'bg-gray-200'
      }`}
    />
  ));

  return (
    <div className="max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Focus Timer</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {Math.round(state.totalFocusMinutes / 60)}h {state.totalFocusMinutes % 60}m focused today
          </p>
        </div>
        <button
          onClick={() => setShowSettings(s => !s)}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Phase tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1 mb-8">
        {(['work', 'shortBreak', 'longBreak'] as const).map(phase => (
          <button
            key={phase}
            onClick={() => setPhase(phase)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              state.phase === phase
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {PHASE_COLORS[phase].label}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className={`relative flex items-center justify-center mb-8`}>
        <div className={`w-64 h-64 rounded-full bg-gradient-to-br ${colors.bg} ${colors.glow} transition-all duration-700`}>
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 200 200"
          >
            {/* Background ring */}
            <circle
              cx="100" cy="100" r="80"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="6"
            />
            {/* Progress ring */}
            <circle
              cx="100" cy="100" r="80"
              fill="none"
              stroke={colors.ring}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-gray-900 font-mono tracking-tight tabular-nums">
              {formatTime(state.secondsLeft)}
            </span>
            <span className={`text-sm font-semibold mt-1 ${colors.accent}`}>
              {colors.label}
            </span>
          </div>
        </div>
      </div>

      {/* Session dots */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {sessionDots}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={reset}
          className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={toggle}
          className={`w-20 h-20 rounded-3xl ${colors.button} flex items-center justify-center text-white shadow-lg transition-all duration-200 active:scale-95 cursor-pointer`}
        >
          {state.isRunning ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
        </button>

        <button
          onClick={skip}
          className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="mt-8 bg-white border border-gray-100 rounded-3xl p-6 slide-up">
          <h3 className="text-sm font-semibold text-gray-700 mb-5">Timer Settings</h3>
          <div className="space-y-5">
            <SettingRow
              label="Work"
              value={localSettings.workMinutes}
              min={1} max={90} step={5}
              unit="min"
              onChange={v => setLocalSettings(s => ({ ...s, workMinutes: v }))}
            />
            <SettingRow
              label="Short break"
              value={localSettings.shortBreakMinutes}
              min={1} max={30} step={1}
              unit="min"
              onChange={v => setLocalSettings(s => ({ ...s, shortBreakMinutes: v }))}
            />
            <SettingRow
              label="Long break"
              value={localSettings.longBreakMinutes}
              min={1} max={60} step={5}
              unit="min"
              onChange={v => setLocalSettings(s => ({ ...s, longBreakMinutes: v }))}
            />
            <SettingRow
              label="Sessions before long break"
              value={localSettings.sessionsBeforeLong}
              min={2} max={8} step={1}
              unit=""
              onChange={v => setLocalSettings(s => ({ ...s, sessionsBeforeLong: v }))}
            />
          </div>
          <button
            onClick={saveSettings}
            className="mt-6 w-full py-3 rounded-2xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Save settings
          </button>
        </div>
      )}

      {/* Quote */}
      <div className="mt-10 text-center">
        <p className="text-xs text-gray-300 italic">
          "The secret of getting ahead is getting started." — Mark Twain
        </p>
      </div>
    </div>
  );
}

function SettingRow({
  label, value, min, max, step, unit, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-600">{label}</label>
        <span className="text-xs font-bold text-gray-800">{value}{unit && ` ${unit}`}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}

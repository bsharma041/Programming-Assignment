import { useState, useEffect, useRef, useCallback } from 'react';
import type { TimerSettings, TimerState } from '../types';

const DEFAULT_SETTINGS: TimerSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLong: 4,
};

export function useTimer(settings: TimerSettings = DEFAULT_SETTINGS) {
  const [state, setState] = useState<TimerState>({
    phase: 'work',
    secondsLeft: settings.workMinutes * 60,
    isRunning: false,
    sessionCount: 0,
    totalFocusMinutes: 0,
  });

  const intervalRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const getDuration = useCallback((phase: TimerState['phase']) => {
    switch (phase) {
      case 'work': return settings.workMinutes * 60;
      case 'shortBreak': return settings.shortBreakMinutes * 60;
      case 'longBreak': return settings.longBreakMinutes * 60;
    }
  }, [settings]);

  const advance = useCallback(() => {
    setState(prev => {
      const newSessionCount = prev.phase === 'work' ? prev.sessionCount + 1 : prev.sessionCount;
      const earnedMinutes = prev.phase === 'work' ? settings.workMinutes : 0;
      let nextPhase: TimerState['phase'];

      if (prev.phase === 'work') {
        nextPhase = newSessionCount % settings.sessionsBeforeLong === 0 ? 'longBreak' : 'shortBreak';
      } else {
        nextPhase = 'work';
      }

      return {
        ...prev,
        phase: nextPhase,
        secondsLeft: getDuration(nextPhase),
        isRunning: false,
        sessionCount: newSessionCount,
        totalFocusMinutes: prev.totalFocusMinutes + earnedMinutes,
      };
    });
  }, [getDuration, settings]);

  useEffect(() => {
    if (!state.isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setState(prev => {
        if (prev.secondsLeft <= 1) {
          clearTimer();
          // Auto-advance
          const newSessionCount = prev.phase === 'work' ? prev.sessionCount + 1 : prev.sessionCount;
          const earnedMinutes = prev.phase === 'work' ? settings.workMinutes : 0;
          let nextPhase: TimerState['phase'];

          if (prev.phase === 'work') {
            nextPhase = newSessionCount % settings.sessionsBeforeLong === 0 ? 'longBreak' : 'shortBreak';
          } else {
            nextPhase = 'work';
          }

          // Notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(
              prev.phase === 'work' ? '🎉 Focus session complete!' : '⚡ Break over — back to work!',
              { body: prev.phase === 'work' ? 'Time for a well-deserved break.' : 'Ready to focus again?' }
            );
          }

          return {
            ...prev,
            phase: nextPhase,
            secondsLeft: getDuration(nextPhase),
            isRunning: false,
            sessionCount: newSessionCount,
            totalFocusMinutes: prev.totalFocusMinutes + earnedMinutes,
          };
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);

    return clearTimer;
  }, [state.isRunning, clearTimer, getDuration, settings, advance]);

  const toggle = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setState(prev => ({
      ...prev,
      secondsLeft: getDuration(prev.phase),
      isRunning: false,
    }));
  }, [clearTimer, getDuration]);

  const skip = useCallback(() => {
    clearTimer();
    setState(prev => {
      const newSessionCount = prev.phase === 'work' ? prev.sessionCount + 1 : prev.sessionCount;
      let nextPhase: TimerState['phase'];
      if (prev.phase === 'work') {
        nextPhase = newSessionCount % settings.sessionsBeforeLong === 0 ? 'longBreak' : 'shortBreak';
      } else {
        nextPhase = 'work';
      }
      return {
        ...prev,
        phase: nextPhase,
        secondsLeft: getDuration(nextPhase),
        isRunning: false,
        sessionCount: newSessionCount,
      };
    });
  }, [clearTimer, getDuration, settings]);

  const setPhase = useCallback((phase: TimerState['phase']) => {
    clearTimer();
    setState(prev => ({
      ...prev,
      phase,
      secondsLeft: getDuration(phase),
      isRunning: false,
    }));
  }, [clearTimer, getDuration]);

  const progress = 1 - state.secondsLeft / getDuration(state.phase);

  return { state, toggle, reset, skip, setPhase, progress };
}

export enum Phase {
  FOCUS = 'FOCUS',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
}

export interface Settings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  volume: number;
  alarmRepetitions: number;
  tickingEnabled: boolean;
  tickingVolume: number;
}

export interface TimerState {
  phase: Phase;
  isRunning: boolean;
  startTime: number | null; // Timestamp when timer started/resumed
  remainingTimeAtPause: number | null; // Milliseconds remaining when paused
  cycleCount: number; // To track 4x focus cycles
}

export interface TimelineSegment {
  id: string;
  type: Phase;
  duration: number; // ms spent in this segment
  status: 'completed' | 'interrupted' | 'ongoing'; // ongoing is used for live rendering
  timestamp: number;
}

export interface HistoryEntry {
  id: string;
  name: string;
  timestamp: number;
  duration: number;
  segments: TimelineSegment[];
}
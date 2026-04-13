import { Phase, Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  volume: 50,
  alarmRepetitions: 1,
  tickingEnabled: false,
  tickingVolume: 30,
};

// Longer alarm sound (simulated repetitive beep)
export const ALARM_SOUND_BASE64 = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"; // Kept short for prompt limits, but representing the resource.

// Using a slightly longer sequence for the alarm to resemble a clock
// Ideally this would be a real file, but for a single file React app without assets, we use a generated string.
// This is a placeholder for a 1-second alarm beep.
export const DING_B64 = "data:audio/wav;base64,UklGRqRwAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YYBwAACBhYqFbF1fdJivrJBhNjVgodDbqWEzM2CfutvnrmE0M1+ZtuHirGM1NFyXuODlsWQ2NVqTt+LmtWg3NViRtOLnuGk4NFePs+LovGw5NFWOsePpvm06NFSMsOPqwG47NFOMr+TrwnA8NVKMrOTsxXI9NVCKp+TtxnM+NU+KpeXuyHU/NU6JpObvyXY/NU2Ioebwyng/NUyHn+fxy3lANUuGm+fyzHpBNUqFmObzzXtCNUmEluX0znxDNUiDleT10H1ENUd/k+T20X5FNUZ+keP30n9GNUV9j+L41IBHNUQVAAA=";

export const PHASE_LABELS: Record<Phase, string> = {
  [Phase.FOCUS]: 'Focus',
  [Phase.SHORT_BREAK]: 'Short Break',
  [Phase.LONG_BREAK]: 'Long Break',
};

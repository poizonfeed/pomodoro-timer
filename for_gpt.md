# for_gpt.md - Full Project Source

This file contains the complete source code for the Fluorite Focus project.
Last updated: 2026-03-02

## File Tree
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `index.html`
- `index.tsx`
- `App.tsx`
- `types.ts`
- `constants.ts`
- `components/Controls.tsx`
- `components/HistoryModal.tsx`
- `components/Modal.tsx`
- `components/SettingsMenu.tsx`  ← active settings panel (gear icon toggle)
- `components/SettingsPanel.tsx` ← UNUSED (superseded by SettingsMenu)
- `components/Timeline.tsx`
- `components/TimerDisplay.tsx`

---

### package.json
```json
{
  "name": "pomodoro-timer",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
```

---

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "types": ["node"],
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": { "@/*": ["./*"] },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

---

### vite.config.ts
```ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
```

---

### index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fluorite Focus</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body {
        background-color: #000000;
        color: #ffffff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-feature-settings: "cv11", "ss01", "tnum";
      }
      input[type=range] {
        -webkit-appearance: none;
        width: 100%;
        background: transparent;
      }
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: #00ff88;
        cursor: pointer;
        margin-top: -6px;
        box-shadow: 0 0 10px #00ff88;
      }
      input[type=range]::-webkit-slider-runnable-track {
        width: 100%;
        height: 4px;
        cursor: pointer;
        background: #333;
        border-radius: 2px;
      }
      input[type=range]:focus {
        outline: none;
      }
      .font-tabular {
        font-variant-numeric: tabular-nums;
      }
      @keyframes resume-pulse {
        0%   { transform: scale(1);    box-shadow: 0 0 0px rgba(255,255,255,0);   filter: brightness(1);   }
        50%  { transform: scale(1.05); box-shadow: 0 0 35px rgba(255,255,255,0.4); filter: brightness(1.1); }
        100% { transform: scale(1);    box-shadow: 0 0 0px rgba(255,255,255,0);   filter: brightness(1);   }
      }
      .animate-resume-pulse {
        animation: resume-pulse 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        will-change: transform, box-shadow;
      }
    </style>
    <script type="importmap">
    {
      "imports": {
        "react/": "https://esm.sh/react@^19.2.4/",
        "react": "https://esm.sh/react@^19.2.4",
        "react-dom/": "https://esm.sh/react-dom@^19.2.4/"
      }
    }
    </script>
    <link rel="stylesheet" href="/index.css">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

---

### index.tsx
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### App.tsx
```tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Phase, Settings, TimerState, TimelineSegment, HistoryEntry } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { SettingsMenu } from './components/SettingsMenu';
import { Controls } from './components/Controls';
import { TimerDisplay } from './components/TimerDisplay';
import { Modal } from './components/Modal';
import { Timeline } from './components/Timeline';
import { HistoryModal } from './components/HistoryModal';

const STORAGE_KEY = 'fluoritefocus_v1';
const TIMELINE_KEY = 'fluoritefocus_timeline';
const HISTORY_KEY = 'fluoritefocus_history';

export default function App() {
  // --- State ---
  const [sessionName, setSessionName] = useState('');

  // Settings
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Timer State
  const [timerState, setTimerState] = useState<TimerState>({
    phase: Phase.FOCUS,
    isRunning: false,
    startTime: null,
    remainingTimeAtPause: DEFAULT_SETTINGS.focusDuration * 60 * 1000,
    cycleCount: 0,
  });

  // Derived display state
  const [displayTime, setDisplayTime] = useState(DEFAULT_SETTINGS.focusDuration * 60 * 1000);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Timeline State
  const [segments, setSegments] = useState<TimelineSegment[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(TIMELINE_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch (e) { console.error(e); }
    }
    return [];
  });

  // History State
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(HISTORY_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch (e) { console.error(e); }
    }
    return [];
  });

  // Current elapsed
  const [currentSegmentElapsed, setCurrentSegmentElapsed] = useState(0);

  // UI State
  const [isDistractionModalOpen, setIsDistractionModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Audio Context Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const previewCtxRef = useRef<AudioContext | null>(null);

  // Change Detection Refs for Smart Reset
  const prevSettingsRef = useRef(settings);
  const prevPhaseRef = useRef(timerState.phase);

  // --- Initialization & Persistence ---

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.settings) {
            setSettings(parsed.settings);
            prevSettingsRef.current = parsed.settings;
        }
        if (parsed.sessionName) setSessionName(parsed.sessionName);
        if (parsed.timerState) {
            const loadedState = {
                ...parsed.timerState,
                isRunning: false,
                startTime: null,
                remainingTimeAtPause: parsed.timerState.remainingTimeAtPause ?? (parsed.settings?.focusDuration || 25) * 60 * 1000
            };
            setTimerState(loadedState);
            setDisplayTime(loadedState.remainingTimeAtPause);
            prevPhaseRef.current = loadedState.phase;
        }
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      settings,
      sessionName,
      timerState: {
        phase: timerState.phase,
        cycleCount: timerState.cycleCount,
        remainingTimeAtPause: timerState.remainingTimeAtPause
      }
    }));
  }, [settings, sessionName, timerState]);

  useEffect(() => {
    localStorage.setItem(TIMELINE_KEY, JSON.stringify(segments));
  }, [segments]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  // Helper to get duration
  const getDurationForPhase = useCallback((phase: Phase): number => {
    switch (phase) {
      case Phase.FOCUS: return settings.focusDuration;
      case Phase.SHORT_BREAK: return settings.shortBreakDuration;
      case Phase.LONG_BREAK: return settings.longBreakDuration;
    }
  }, [settings]);

  // SMART RESET EFFECT (Settings/Phase change)
  useEffect(() => {
    const settingsChanged = prevSettingsRef.current !== settings;
    const phaseChanged = prevPhaseRef.current !== timerState.phase;

    if (settingsChanged || phaseChanged) {
        prevSettingsRef.current = settings;
        prevPhaseRef.current = timerState.phase;

        if (!timerState.isRunning) {
            const newDuration = getDurationForPhase(timerState.phase) * 60 * 1000;
            setTimerState(prev => ({ ...prev, remainingTimeAtPause: newDuration }));
            setDisplayTime(newDuration);
            setIsOverflowing(false);
            setCurrentSegmentElapsed(0);
        }
    }
  }, [settings, timerState.phase, timerState.isRunning, getDurationForPhase]);


  const playSound = useCallback(() => {
    try {
      const ACtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!ACtx) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new ACtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const volume = settings.volume / 100;
      if (volume === 0) return;

      // Power curve so 50% volume actually sounds like 50%, not 100%
      const peakGain = Math.pow(volume, 2) * 0.5;
      const reps = settings.alarmRepetitions;
      const repSpacing = 2.8; // seconds between repetition starts

      // Airplane cabin bell: fundamental sine + fast-decaying inharmonic overtone
      const playBell = (freq: number, startAt: number) => {
        const decayTime = 2.0;

        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startAt);
        osc.connect(env);
        env.connect(ctx.destination);
        env.gain.setValueAtTime(0, startAt);
        env.gain.linearRampToValueAtTime(peakGain, startAt + 0.004);
        env.gain.exponentialRampToValueAtTime(0.0001, startAt + decayTime);
        osc.start(startAt);
        osc.stop(startAt + decayTime + 0.05);

        // Inharmonic overtone at 2.756× for bell-like "clang" quality (fades quickly)
        const osc2 = ctx.createOscillator();
        const env2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2.756, startAt);
        osc2.connect(env2);
        env2.connect(ctx.destination);
        env2.gain.setValueAtTime(0, startAt);
        env2.gain.linearRampToValueAtTime(peakGain * 0.3, startAt + 0.004);
        env2.gain.exponentialRampToValueAtTime(0.0001, startAt + decayTime * 0.35);
        osc2.start(startAt);
        osc2.stop(startAt + decayTime * 0.35 + 0.05);
      };

      for (let i = 0; i < reps; i++) {
        const base = ctx.currentTime + i * repSpacing;
        playBell(880, base);          // A5 — high note
        playBell(659.25, base + 0.6); // E5 — low note (perfect fifth below)
      }
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }, [settings.volume, settings.alarmRepetitions]);

  // Preview: always plays exactly one chime in its own AudioContext so it can be
  // stopped instantly when the settings panel closes.
  const isPreviewBusyRef = useRef(false);

  const stopPreview = useCallback(() => {
    if (previewCtxRef.current) {
      previewCtxRef.current.close().catch(() => {});
      previewCtxRef.current = null;
    }
    isPreviewBusyRef.current = false;
  }, []);

  const previewSound = useCallback(() => {
    if (isPreviewBusyRef.current) return;
    isPreviewBusyRef.current = true;
    // 2.7 s covers: bell2 starts at 0.6 s, decays 2.0 s + small buffer
    setTimeout(() => { isPreviewBusyRef.current = false; }, 2700);

    try {
      const ACtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!ACtx) return;
      const ctx = new ACtx();
      previewCtxRef.current = ctx;

      const volume = settings.volume / 100;
      if (volume === 0) return;
      const peakGain = Math.pow(volume, 2) * 0.5;

      const playBell = (freq: number, startAt: number) => {
        const decayTime = 2.0;

        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startAt);
        osc.connect(env);
        env.connect(ctx.destination);
        env.gain.setValueAtTime(0, startAt);
        env.gain.linearRampToValueAtTime(peakGain, startAt + 0.004);
        env.gain.exponentialRampToValueAtTime(0.0001, startAt + decayTime);
        osc.start(startAt);
        osc.stop(startAt + decayTime + 0.05);

        const osc2 = ctx.createOscillator();
        const env2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2.756, startAt);
        osc2.connect(env2);
        env2.connect(ctx.destination);
        env2.gain.setValueAtTime(0, startAt);
        env2.gain.linearRampToValueAtTime(peakGain * 0.3, startAt + 0.004);
        env2.gain.exponentialRampToValueAtTime(0.0001, startAt + decayTime * 0.35);
        osc2.start(startAt);
        osc2.stop(startAt + decayTime * 0.35 + 0.05);
      };

      // Always one chime — preview never depends on alarmRepetitions
      playBell(880, ctx.currentTime);
      playBell(659.25, ctx.currentTime + 0.6);
    } catch (e) {
      console.warn('Preview audio failed', e);
    }
  }, [settings.volume]);

  // Kill preview the moment the settings panel closes
  useEffect(() => {
    if (!isSettingsOpen) stopPreview();
  }, [isSettingsOpen, stopPreview]);

  // --- Timer Tick ---

  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      if (!timerState.isRunning || !timerState.startTime) {
        return;
      }

      const now = Date.now();
      const elapsed = now - timerState.startTime;
      const timeLeft = (timerState.remainingTimeAtPause || 0) - elapsed;

      setDisplayTime(timeLeft);
      setIsOverflowing(timeLeft <= 0);

      const targetDuration = getDurationForPhase(timerState.phase) * 60 * 1000;
      const segmentElapsed = targetDuration - timeLeft;
      setCurrentSegmentElapsed(segmentElapsed);

      animationFrameId = requestAnimationFrame(tick);
    };

    if (timerState.isRunning) {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [timerState.isRunning, timerState.startTime, timerState.remainingTimeAtPause, timerState.phase, getDurationForPhase]);


  // Sound trigger
  const hasPlayedSoundRef = useRef(false);
  useEffect(() => {
    if (displayTime <= 0 && !hasPlayedSoundRef.current && timerState.isRunning) {
      playSound();
      hasPlayedSoundRef.current = true;
    }
    if (displayTime > 0) {
      hasPlayedSoundRef.current = false;
    }
  }, [displayTime, playSound, timerState.isRunning]);


  // --- Helper to Commit Segment ---
  const commitSegment = (status: 'completed' | 'interrupted') => {
    if (currentSegmentElapsed > 1000) {
        const newSegment: TimelineSegment = {
            id: Date.now().toString(),
            type: timerState.phase,
            duration: currentSegmentElapsed,
            status: status,
            timestamp: Date.now()
        };
        setSegments(prev => [...prev, newSegment]);
    }
    setCurrentSegmentElapsed(0);
  };


  // --- Actions ---

  const toggleTimer = useCallback(() => {
    if (timerState.isRunning) {
      // PAUSE
      const now = Date.now();
      const elapsed = now - (timerState.startTime || now);
      const newRemaining = (timerState.remainingTimeAtPause || 0) - elapsed;

      setTimerState(prev => ({
        ...prev,
        isRunning: false,
        startTime: null,
        remainingTimeAtPause: newRemaining
      }));
    } else {
      // START
      setTimerState(prev => ({
        ...prev,
        isRunning: true,
        startTime: Date.now(),
      }));
    }
  }, [timerState.isRunning, timerState.startTime, timerState.remainingTimeAtPause]);

  // "Restart Session" - Soft Reset (keeps timeline, cycle, phase)
  const restartCurrentSession = useCallback(() => {
    if (currentSegmentElapsed > 0) {
        commitSegment('interrupted');
    }

    const duration = getDurationForPhase(timerState.phase) * 60 * 1000;
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      startTime: null,
      remainingTimeAtPause: duration
    }));
    setDisplayTime(duration);
    setIsOverflowing(false);
    hasPlayedSoundRef.current = false;
    setCurrentSegmentElapsed(0);
  }, [getDurationForPhase, timerState.phase, currentSegmentElapsed]);

  // "Hard Reset" -> "Stop Session" logic
  const handleResetClick = () => {
    setIsResetConfirmOpen(true);
  };

  const confirmFullReset = useCallback(() => {
      const finalSegments = [...segments];

      if (currentSegmentElapsed > 1000) {
          finalSegments.push({
            id: 'end-' + Date.now(),
            type: timerState.phase,
            duration: currentSegmentElapsed,
            status: 'completed',
            timestamp: Date.now()
          });
      }

      const totalFocusMs = finalSegments.reduce((acc, s) => s.type === Phase.FOCUS ? acc + s.duration : acc, 0);

      if (totalFocusMs > 5000) {
          const totalMinutes = Math.max(1, Math.round(totalFocusMs / 60000));

          const newEntry: HistoryEntry = {
              id: Date.now().toString(),
              name: sessionName || 'Untitled Session',
              timestamp: Date.now(),
              duration: totalMinutes,
              segments: finalSegments
          };
          setHistory(prev => [newEntry, ...prev]);
      }

      setSegments([]);

      const duration = settings.focusDuration * 60 * 1000;
      setTimerState({
          phase: Phase.FOCUS,
          cycleCount: 0,
          isRunning: false,
          startTime: null,
          remainingTimeAtPause: duration
      });
      setDisplayTime(duration);
      setIsOverflowing(false);
      hasPlayedSoundRef.current = false;
      setCurrentSegmentElapsed(0);
      setIsResetConfirmOpen(false);
  }, [settings.focusDuration, segments, currentSegmentElapsed, sessionName, timerState.phase]);


  // Shared logic to proceed to the next phase
  const proceedToNextPhase = useCallback(() => {
    setIsDistractionModalOpen(false);

    const isFocus = timerState.phase === Phase.FOCUS;
    const isNaturalEnd = isOverflowing || displayTime <= 0;

    const status = (isNaturalEnd || !isFocus) ? 'completed' : 'interrupted';

    commitSegment(status);

    let nextPhase = Phase.FOCUS;
    let nextCycle = timerState.cycleCount;

    if (timerState.phase === Phase.FOCUS) {
      if (timerState.cycleCount >= 3) {
        nextPhase = Phase.LONG_BREAK;
        nextCycle = 0;
      } else {
        nextPhase = Phase.SHORT_BREAK;
        nextCycle = timerState.cycleCount + 1;
      }
    } else {
      nextPhase = Phase.FOCUS;
      if (timerState.phase === Phase.LONG_BREAK) {
          nextCycle = 0;
      }
    }

    const nextDur = (nextPhase === Phase.SHORT_BREAK ? settings.shortBreakDuration :
                     nextPhase === Phase.LONG_BREAK ? settings.longBreakDuration :
                     settings.focusDuration);

    setTimerState({
      phase: nextPhase,
      isRunning: false,
      startTime: null,
      remainingTimeAtPause: nextDur * 60 * 1000,
      cycleCount: nextCycle
    });
    setDisplayTime(nextDur * 60 * 1000);
    setIsOverflowing(false);
    hasPlayedSoundRef.current = false;
    setCurrentSegmentElapsed(0);
  }, [timerState.phase, timerState.cycleCount, isOverflowing, displayTime, currentSegmentElapsed, settings]);


  const handleStopNext = useCallback(() => {
    if (isOverflowing) {
        proceedToNextPhase();
        return;
    }

    if (timerState.phase !== Phase.FOCUS) {
        proceedToNextPhase();
        return;
    }

    setTimerState(prev => {
        if (!prev.isRunning) return prev;
        const now = Date.now();
        const elapsed = now - (prev.startTime || now);
        return {
            ...prev,
            isRunning: false,
            startTime: null,
            remainingTimeAtPause: (prev.remainingTimeAtPause || 0) - elapsed
        };
    });
    setIsDistractionModalOpen(true);

  }, [isOverflowing, proceedToNextPhase, timerState.phase]);

  // --- Modal Actions ---

  const handleModalRestart = () => {
    setIsDistractionModalOpen(false);
    restartCurrentSession();
  };

  const handleModalClose = () => {
    setIsDistractionModalOpen(false);
  };

  // --- History Actions ---
  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
    setIsHistoryModalOpen(false);
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) return;

      switch(e.code) {
        case 'Space':
          e.preventDefault();
          if (isOverflowing) handleStopNext();
          else toggleTimer();
          break;
        case 'KeyR':
          handleResetClick();
          break;
        case 'Escape':
          if (isDistractionModalOpen) setIsDistractionModalOpen(false);
          else if (isResetConfirmOpen) setIsResetConfirmOpen(false);
          else if (isHistoryModalOpen) setIsHistoryModalOpen(false);
          else handleStopNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTimer, handleStopNext, isDistractionModalOpen, isResetConfirmOpen, isHistoryModalOpen, isOverflowing]);

  // --- Logic to check if session has started ---
  const hasStarted = displayTime < getDurationForPhase(timerState.phase) * 60 * 1000;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 selection:bg-[#00ff88] selection:text-black">
      {/* Header */}
      <header className="w-full max-w-md flex items-center mb-4 relative">
        {/* Spacer to keep input visually centered */}
        <div className="w-9 flex-shrink-0" />
        <input
          id="sessionName"
          type="text"
          placeholder="Session name"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          className="bg-transparent border-b border-[#333] text-center text-2xl flex-1 py-2 font-bold focus:outline-none focus:border-[#00ff88] transition-colors placeholder-gray-700"
        />
        <button
          onClick={() => setIsSettingsOpen(prev => !prev)}
          title="Settings"
          className={`ml-3 flex-shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-all active:scale-95 ${
            isSettingsOpen
              ? 'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/5'
              : 'border-[#222] text-gray-500 hover:text-white hover:border-[#333] hover:bg-[#111]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </header>

      {/* Settings Dropdown */}
      {isSettingsOpen && (
        <SettingsMenu
          settings={settings}
          setSettings={setSettings}
          onPreviewSound={previewSound}
        />
      )}

      {/* Timer Display */}
      <main className="flex-1 flex flex-col items-center justify-center w-full relative">
        <div className="mb-6 text-gray-500 font-bold tracking-[0.2em] uppercase text-xs">
            {timerState.phase === Phase.FOCUS ? `Focus Cycle ${timerState.cycleCount + 1}/4` : 'Break Time'}
        </div>
        <TimerDisplay ms={displayTime} isOverflowing={isOverflowing} phase={timerState.phase} />

        {/* Shortcuts Hint */}
        <div className="absolute bottom-[-2rem] text-[10px] text-gray-700 uppercase font-bold tracking-[0.3em] pointer-events-none opacity-40">
          [Space] {isOverflowing ? 'Next' : 'Toggle'} · [R] End · [Esc] Menu
        </div>
      </main>

      {/* Controls */}
      <Controls
        isRunning={timerState.isRunning}
        isOverflowing={isOverflowing}
        hasStarted={hasStarted}
        phase={timerState.phase}
        onToggle={toggleTimer}
        onReset={handleResetClick}
        onStopNext={handleStopNext}
      />

      {/* Timeline */}
      <Timeline
        segments={segments}
        currentPhase={timerState.phase}
        currentDuration={currentSegmentElapsed}
        isRunning={timerState.isRunning}
        totalPhaseDuration={getDurationForPhase(timerState.phase) * 60 * 1000}
      />

      {/* Footer: History */}
      <footer className="w-full max-w-md mt-12 mb-6 flex justify-center">
        <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.25em] text-gray-600 hover:text-white transition-colors group"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-[#00ff88] transition-colors"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            History
        </button>
      </footer>

      {/* Distraction Modal */}
      {isDistractionModalOpen && (
        <Modal
          onRestart={handleModalRestart}
          onTakeBreak={proceedToNextPhase}
          onClose={handleModalClose}
        />
      )}

      {/* History Modal */}
      {isHistoryModalOpen && (
        <HistoryModal
            history={history}
            onClose={() => setIsHistoryModalOpen(false)}
            onDelete={handleDeleteHistory}
            onClear={handleClearHistory}
        />
      )}

      {/* Stop/Reset Confirmation Modal */}
      {isResetConfirmOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-red-900/40 p-8 rounded-3xl shadow-2xl w-full max-w-xs text-center border-t-red-600">
            <h3 className="text-xl font-extrabold text-white mb-3 tracking-tight">Stop Session?</h3>
            <p className="text-sm text-gray-500 mb-8 font-medium leading-relaxed">This will save your progress to history and reset the timers.</p>
            <div className="flex flex-col gap-3">
               <button
                 onClick={confirmFullReset}
                 className="w-full py-3.5 rounded-full bg-red-600 text-white hover:bg-red-500 text-[11px] font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.3)]"
               >
                 End & Save
               </button>
               <button
                 onClick={() => setIsResetConfirmOpen(false)}
                 className="w-full py-3.5 rounded-full border border-[#222] text-gray-400 hover:text-white hover:bg-white/5 text-[11px] font-bold uppercase tracking-widest"
               >
                 Cancel
               </button>
            </div>
          </div>
         </div>
      )}
    </div>
  );
}
```

---

### types.ts
```ts
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
}

export interface TimerState {
  phase: Phase;
  isRunning: boolean;
  startTime: number | null;         // Timestamp when timer started/resumed
  remainingTimeAtPause: number | null; // Milliseconds remaining when paused
  cycleCount: number;               // Tracks 4x focus cycles
}

export interface TimelineSegment {
  id: string;
  type: Phase;
  duration: number;                 // ms spent in this segment
  status: 'completed' | 'interrupted' | 'ongoing'; // 'ongoing' is used for live rendering only
  timestamp: number;
}

export interface HistoryEntry {
  id: string;
  name: string;
  timestamp: number;
  duration: number;                 // total focus minutes (rounded)
  segments: TimelineSegment[];
}
```

---

### constants.ts
```ts
import { Phase, Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  volume: 50,
  alarmRepetitions: 1,
};

export const DING_B64 = "data:audio/wav;base64,UklGRqRwAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YYBwAACBhYqFbF1fdJivrJBhNjVgodDbqWEzM2CfutvnrmE0M1+ZtuHirGM1NFyXuODlsWQ2NVqTt+LmtWg3NViRtOLnuGk4NFePs+LovGw5NFWOsePpvm06NFSMsOPqwG47NFOMr+TrwnA8NVKMrOTsxXI9NVCKp+TtxnM+NU+KpeXuyHU/NU6JpObvyXY/NU2Ioebwyng/NUyHn+fxy3lANUuGm+fyzHpBNUqFmObzzXtCNUmEluX0znxDNUiDleT10H1ENUd/k+T20X5FNUZ+keP30n9GNUV9j+L41IBHNUQVAAA=";

export const PHASE_LABELS: Record<Phase, string> = {
  [Phase.FOCUS]: 'Focus',
  [Phase.SHORT_BREAK]: 'Short Break',
  [Phase.LONG_BREAK]: 'Long Break',
};
```

---

### components/Controls.tsx
```tsx
import React from 'react';
import { Phase } from '../types';

interface ControlsProps {
  isRunning: boolean;
  isOverflowing: boolean;
  hasStarted: boolean;
  phase: Phase;
  onToggle: () => void;
  onReset: () => void;
  onStopNext: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isRunning,
  isOverflowing,
  hasStarted,
  phase,
  onToggle,
  onReset,
  onStopNext
}) => {
  const btnBase = "px-10 py-3.5 rounded-full border transition-all text-sm font-bold tracking-widest uppercase min-w-[140px] active:scale-95";

  const defaultBtnClass = `${btnBase} border-[#333] text-white hover:border-white hover:bg-white/5`;
  const startBtnClass = `${btnBase} bg-white text-black border-white hover:bg-gray-200`;
  const resumeBtnClass = `${btnBase} bg-white text-black border-white hover:bg-gray-200 animate-resume-pulse`;
  const pauseBtnClass = `${btnBase} bg-red-950/20 text-red-500 border-red-600/50 hover:bg-red-900/40 hover:border-red-500 hover:text-red-400 shadow-[0_0_20px_rgba(220,38,38,0.1)]`;
  const overflowBtnClass = `${btnBase} bg-red-600 text-white border-red-500 hover:bg-red-500 animate-pulse shadow-[0_0_25px_rgba(220,38,38,0.3)]`;
  const resetBtnClass = "mt-6 text-[11px] text-gray-500 hover:text-red-500 uppercase font-bold tracking-[0.25em] transition-colors border-b border-transparent hover:border-red-500/50 pb-1";

  let mainActionLabel = 'Stop';
  if (isOverflowing || phase !== Phase.FOCUS) {
    mainActionLabel = 'Next Phase';
  }

  let toggleBtnClass = startBtnClass;
  if (isRunning) toggleBtnClass = pauseBtnClass;
  else if (hasStarted) toggleBtnClass = resumeBtnClass;

  return (
    <div className="flex flex-col items-center mt-12 w-full">
      <div className="flex flex-wrap gap-5 justify-center">
        {!isOverflowing && (
          <button id="startPause" onClick={onToggle} className={toggleBtnClass}>
            {isRunning ? 'Pause' : (hasStarted ? 'Resume' : 'Start')}
          </button>
        )}
        <button id="stopNext" onClick={onStopNext} className={isOverflowing ? overflowBtnClass : defaultBtnClass}>
          {mainActionLabel}
        </button>
      </div>
      <button id="reset" onClick={onReset} className={resetBtnClass}>
        Stop Session
      </button>
    </div>
  );
};
```

---

### components/HistoryModal.tsx
```tsx
import React, { useState } from 'react';
import { HistoryEntry, Phase } from '../types';
import { Timeline } from './Timeline';

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface HistoryModalProps {
  history: HistoryEntry[];
  onClose: () => void;
  onClear: () => void;
  onDelete: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose, onClear, onDelete }) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isClearAllConfirm, setIsClearAllConfirm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const dateStamp = new Date().toISOString().slice(0, 10);

  const handleExportJSON = () => {
    triggerDownload(
      JSON.stringify(history, null, 2),
      `fluorite-focus-${dateStamp}.json`,
      'application/json'
    );
  };

  const handleExportCSV = () => {
    const headers = ['id', 'name', 'date', 'start_time', 'end_time', 'duration_min', 'focus_min', 'short_break_min', 'long_break_min'];
    const rows = history.map(entry => {
      const firstSeg = entry.segments?.[0];
      const startTs = firstSeg ? firstSeg.timestamp - firstSeg.duration : entry.timestamp - entry.duration * 60000;
      const sumMs = (phase: Phase) =>
        (entry.segments ?? []).filter(s => s.type === phase).reduce((acc, s) => acc + s.duration, 0);
      const cols = [
        entry.id,
        `"${entry.name.replace(/"/g, '""')}"`,
        new Date(entry.timestamp).toLocaleDateString(),
        new Date(startTs).toLocaleTimeString(),
        new Date(entry.timestamp).toLocaleTimeString(),
        entry.duration,
        Math.round(sumMs(Phase.FOCUS) / 60000),
        Math.round(sumMs(Phase.SHORT_BREAK) / 60000),
        Math.round(sumMs(Phase.LONG_BREAK) / 60000),
      ];
      return cols.join(',');
    });
    triggerDownload(
      [headers.join(','), ...rows].join('\n'),
      `fluorite-focus-${dateStamp}.csv`,
      'text/csv'
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0a0a0a] border border-[#222] w-full max-w-md h-[70vh] flex flex-col rounded-2xl shadow-2xl relative overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#222] bg-[#0a0a0a]">
          <h2 className="text-xl font-bold text-white tracking-tight">Session History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#222]"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
           {history.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                <span className="text-sm font-mono">No sessions recorded.</span>
             </div>
           )}
           {history.map(entry => {
              const hasTimeline = entry.segments && entry.segments.length > 0;
              const isExpanded = expandedId === entry.id;

              return (
                <div key={entry.id} className="bg-[#111] rounded-lg border border-[#222] overflow-hidden transition-all duration-300">
                  <div className="group flex justify-between items-center p-4 hover:bg-[#161616] relative">
                      <div>
                          <div className="font-bold text-white text-sm mb-1">{entry.name}</div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                            {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {entry.segments?.length > 0 ? new Date(entry.segments[0].timestamp - entry.segments[0].duration).toLocaleTimeString(undefined, { hour: '2-digit', minute:'2-digit' }) + ' → ' : ''}{new Date(entry.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute:'2-digit' })}
                          </div>
                      </div>
                      <div className="flex items-center gap-2 pl-4">
                          <div className="text-right mr-2">
                            <span className="font-mono text-[#00ff88] text-lg font-bold block leading-none">{entry.duration}</span>
                            <span className="text-[9px] text-gray-600 uppercase tracking-widest block text-right">min</span>
                          </div>

                          {/* Timeline Toggle Button */}
                          {hasTimeline && (
                             <button
                               onClick={() => toggleExpand(entry.id)}
                               className={`w-8 h-8 flex items-center justify-center rounded transition-all ${isExpanded ? 'text-[#00ff88] bg-[#00ff88]/10' : 'text-gray-600 hover:text-white hover:bg-[#222]'}`}
                               title="View Timeline"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                             </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteId(entry.id)}
                            className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:text-red-500 hover:bg-[#222] transition-colors"
                            title="Delete Entry"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                      </div>
                  </div>

                  {/* Expanded Timeline View */}
                  {isExpanded && hasTimeline && (
                    <div className="border-t border-[#222] bg-[#050505] p-4 animate-in fade-in slide-in-from-top-1">
                       <Timeline
                          segments={entry.segments}
                          currentPhase={Phase.FOCUS}
                          currentDuration={0}
                          isRunning={false}
                          totalPhaseDuration={0}
                       />
                    </div>
                  )}
                </div>
              );
           })}
        </div>

        {/* Footer */}
        {history.length > 0 && (
            <div className="p-4 border-t border-[#222] bg-[#0a0a0a] space-y-2">
                <div className="flex gap-2">
                    <button
                      onClick={handleExportJSON}
                      className="flex-1 py-2.5 rounded border border-[#333] text-gray-400 hover:text-white hover:border-[#555] hover:bg-[#1a1a1a] text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                      title="Download history as JSON"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      JSON
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="flex-1 py-2.5 rounded border border-[#333] text-gray-400 hover:text-white hover:border-[#555] hover:bg-[#1a1a1a] text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                      title="Download history as CSV"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      CSV
                    </button>
                </div>
                <button
                  onClick={() => setIsClearAllConfirm(true)}
                  className="w-full py-3 rounded border border-red-900/30 text-red-700 hover:bg-red-900/10 hover:border-red-800 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-all"
                >
                    Clear All History
                </button>
            </div>
        )}

        {/* Delete Confirmation Overlay (Individual) */}
        {deleteId && (
            <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-20 flex-col p-8 text-center animate-in fade-in duration-200">
                <div className="w-12 h-12 rounded-full bg-red-900/20 text-red-500 flex items-center justify-center mb-4 border border-red-900/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Delete this entry?</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-[200px] mx-auto leading-relaxed">This record will be permanently removed from your local history.</p>
                <div className="flex gap-3 w-full">
                    <button
                        onClick={() => setDeleteId(null)}
                        className="flex-1 py-3 border border-[#333] rounded text-gray-300 text-xs font-bold uppercase hover:bg-[#222] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onDelete(deleteId); setDeleteId(null); }}
                        className="flex-1 py-3 bg-red-600 rounded text-white text-xs font-bold uppercase hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all"
                    >
                        Delete
                    </button>
                </div>
            </div>
        )}

        {/* Clear All Confirmation Overlay */}
        {isClearAllConfirm && (
             <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-20 flex-col p-8 text-center animate-in fade-in duration-200">
                <h3 className="text-white font-bold text-lg mb-2 text-red-500">Clear All History?</h3>
                <p className="text-gray-500 text-sm mb-6">You are about to delete all {history.length} recorded sessions. This cannot be undone.</p>
                <div className="flex gap-3 w-full">
                    <button
                        onClick={() => setIsClearAllConfirm(false)}
                        className="flex-1 py-3 border border-[#333] rounded text-gray-300 text-xs font-bold uppercase hover:bg-[#222]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onClear(); setIsClearAllConfirm(false); }}
                        className="flex-1 py-3 bg-red-900/80 border border-red-700 rounded text-white text-xs font-bold uppercase hover:bg-red-800"
                    >
                        Yes, Clear All
                    </button>
                </div>
             </div>
        )}
      </div>
    </div>
  );
};
```

---

### components/Modal.tsx
```tsx
import React from 'react';

interface ModalProps {
  onRestart: () => void;
  onTakeBreak: () => void;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ onRestart, onTakeBreak, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111] border border-[#333] p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-6 transform scale-100">
        <h2 className="text-xl font-bold text-center">Session Interrupted</h2>
        <div className="flex flex-col gap-1 text-center">
          <p className="text-gray-400 text-sm">Distracted?</p>
          <p className="text-white font-bold text-base">What's next?</p>
        </div>
        <div className="flex flex-col gap-3 mt-2">
          <button onClick={onRestart} className="w-full py-3 rounded bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-gray-200">
            Restart Session
          </button>
          <button onClick={onTakeBreak} className="w-full py-3 rounded border border-[#333] hover:border-[#00ff88] hover:text-[#00ff88] text-gray-300 font-bold uppercase text-xs tracking-widest">
            Take a Break
          </button>
          <button onClick={onClose} className="w-full py-2 text-gray-500 hover:text-white text-xs">
            Close / Resume
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

### components/SettingsMenu.tsx
```tsx
import React from 'react';
import { Settings } from '../types';

interface SettingsMenuProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  onPreviewSound: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ settings, setSettings, onPreviewSound }) => {
  const handleChange = (key: keyof Settings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const timerSliders = [
    { label: 'Focus', key: 'focusDuration' as const, min: 1, max: 60, step: 1 },
    { label: 'Short Break', key: 'shortBreakDuration' as const, min: 1, max: 15, step: 1 },
    { label: 'Long Break', key: 'longBreakDuration' as const, min: 1, max: 30, step: 1 },
  ];

  return (
    <div className="w-full max-w-md border border-[#1c1c1c] rounded-2xl px-6 py-5 mb-8 flex flex-col gap-5 animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Timer Durations */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-700 mb-4">Durations</p>
        <div className="grid grid-cols-3 gap-6">
          {timerSliders.map(s => (
            <div key={s.key} className="flex flex-col gap-3">
              <div className="flex justify-between items-center min-h-[2rem]">
                <label className="text-gray-500 uppercase tracking-[0.15em] text-[10px] font-bold leading-tight">
                  {s.label.split(' ').map((word, i) => (
                    <span key={i} className="block">{word}</span>
                  ))}
                </label>
                <span className="font-bold text-[#00ff88] text-base">{settings[s.key]}m</span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={settings[s.key]}
                onChange={(e) => handleChange(s.key, parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#1c1c1c]" />

      {/* Alarm Volume */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-700 mb-4">Alarm Volume</p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={settings.volume}
            onChange={(e) => setSettings(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
            className="flex-1"
          />
          <span className="font-bold text-[#00ff88] text-sm tabular-nums w-8 text-right">{settings.volume}</span>
          <button
            onClick={onPreviewSound}
            title="Preview Sound"
            className="w-9 h-9 rounded-full border border-[#222] flex items-center justify-center text-[#00ff88] hover:bg-[#111] hover:border-[#333] active:scale-95 transition-all flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="border-t border-[#1c1c1c]" />

      {/* Alarm Repetitions */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-700 mb-4">Alarm Repetitions</p>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setSettings(prev => ({ ...prev, alarmRepetitions: n }))}
              className={`flex-1 h-9 rounded-full border text-xs font-bold tracking-widest transition-all active:scale-95 ${
                settings.alarmRepetitions === n
                  ? 'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/5'
                  : 'border-[#222] text-gray-500 hover:border-[#333] hover:text-white hover:bg-[#111]'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

### components/SettingsPanel.tsx (UNUSED)
```tsx
import React from 'react';
import { Settings } from '../types';

interface SettingsPanelProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings }) => {
  const handleChange = (key: keyof Settings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const sliders = [
    { label: 'Focus', key: 'focusDuration' as const, min: 1, max: 60, step: 1 },
    { label: 'Short Break', key: 'shortBreakDuration' as const, min: 1, max: 15, step: 1 },
    { label: 'Long Break', key: 'longBreakDuration' as const, min: 1, max: 30, step: 1 },
  ];

  return (
    <div className="w-full max-w-2xl grid grid-cols-3 gap-8 mb-10 text-sm">
      {sliders.map(s => (
        <div key={s.key} className="flex flex-col gap-3">
          <div className="flex justify-between items-baseline">
            <label className="text-gray-500 uppercase tracking-[0.15em] text-[10px] font-bold">{s.label}</label>
            <span className="font-tabular font-bold text-[#00ff88] text-base">{settings[s.key]}m</span>
          </div>
          <input
            type="range"
            min={s.min}
            max={s.max}
            step={s.step}
            value={settings[s.key]}
            onChange={(e) => handleChange(s.key, parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      ))}
    </div>
  );
};
```

---

### components/Timeline.tsx
```tsx
import React, { useMemo } from 'react';
import { Phase, TimelineSegment } from '../types';

interface TimelineProps {
  segments: TimelineSegment[];
  currentPhase: Phase;
  currentDuration: number;
  isRunning: boolean;
  totalPhaseDuration: number;
}

export const Timeline: React.FC<TimelineProps> = ({
  segments, currentPhase, currentDuration, isRunning, totalPhaseDuration
}) => {
  const fillPercent = totalPhaseDuration > 0
    ? Math.min(100, Math.max(0, (currentDuration / totalPhaseDuration) * 100))
    : 0;

  const isFocusPhase = currentPhase === Phase.FOCUS;
  const phaseColor = isFocusPhase ? '#00ff88' : '#4488ff';
  const phaseGlow = isFocusPhase
    ? '0 0 16px rgba(0, 255, 136, 0.4)'
    : '0 0 16px rgba(68, 136, 255, 0.4)';
  const phaseName = currentPhase === Phase.FOCUS ? 'Focus'
    : currentPhase === Phase.SHORT_BREAK ? 'Short Break'
    : 'Long Break';

  const allSegments = useMemo<TimelineSegment[]>(() => {
    const list = [...segments];
    if (currentDuration > 0) {
      list.push({
        id: 'current',
        type: currentPhase,
        duration: currentDuration,
        status: 'ongoing' as const,
        timestamp: Date.now()
      });
    }
    return list;
  }, [segments, currentPhase, currentDuration]);

  const stats = useMemo(() => {
    let totalFocus = 0;
    let totalBreak = 0;
    allSegments.forEach(s => {
      if (s.type === Phase.FOCUS) totalFocus += s.duration;
      else totalBreak += s.duration;
    });
    const total = totalFocus + totalBreak;
    const focusPercent = total > 0 ? Math.round((totalFocus / total) * 100) : 0;
    return { totalFocus, totalBreak, focusPercent };
  }, [allSegments]);

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  const hasContent = segments.length > 0 || currentDuration > 0 || isRunning;

  const outerTransition = hasContent
    ? 'grid-template-rows 480ms ease 0ms'
    : 'opacity 220ms ease 0ms, grid-template-rows 380ms ease 200ms';

  const sliderGridRows = (isRunning || !hasContent) ? '1fr' : '0fr';
  const sliderOpacity = (isRunning || !hasContent) ? 1 : 0;
  const sliderTransition = isRunning
    ? 'grid-template-rows 480ms ease 0ms, opacity 320ms ease 160ms'
    : 'opacity 220ms ease 0ms, grid-template-rows 380ms ease 200ms';

  const timelineTransition = !isRunning
    ? 'grid-template-rows 480ms ease 0ms, opacity 320ms ease 160ms'
    : 'opacity 220ms ease 0ms, grid-template-rows 380ms ease 200ms';

  return (
    <div
      className="w-full max-w-2xl"
      style={{
        display: 'grid',
        gridTemplateRows: hasContent ? '1fr' : '0fr',
        opacity: hasContent ? 1 : 0,
        transition: outerTransition,
      }}
    >
      <div style={{ overflow: 'hidden' }}>
      <div className="mt-8">

      {/* ── SLIDER VIEW (running) ── */}
      <div style={{ display: 'grid', gridTemplateRows: sliderGridRows, opacity: sliderOpacity, transition: sliderTransition }}>
        <div style={{ overflow: 'hidden' }}>
          <div className="flex flex-col gap-2 pb-1">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-gray-600">
              <span style={{ color: phaseColor }}>{phaseName}</span>
              <span>{Math.round(fillPercent)}%</span>
            </div>
            <div className="relative h-1.5 w-full rounded-full overflow-hidden bg-[#111]" style={{ border: '1px solid #1c1c1c' }}>
              <div className="h-full rounded-full" style={{ width: `${fillPercent}%`, backgroundColor: phaseColor, boxShadow: phaseGlow }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── FULL TIMELINE VIEW (paused / stopped) ── */}
      <div style={{ display: 'grid', gridTemplateRows: !isRunning ? '1fr' : '0fr', opacity: !isRunning ? 1 : 0, transition: timelineTransition }}>
        <div style={{ overflow: 'hidden' }}>
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex justify-between items-end text-xs uppercase tracking-widest text-gray-500 mb-2">
              <div><span className="text-white font-bold">{stats.focusPercent}%</span> Focus</div>
              <div className="flex gap-4">
                <span>Work: <span className="text-white">{formatTime(stats.totalFocus)}</span></span>
                <span>Rest: <span className="text-white">{formatTime(stats.totalBreak)}</span></span>
              </div>
            </div>
            <div className="flex h-4 w-full bg-[#111] rounded overflow-hidden border border-[#333]">
              {allSegments.map((seg, i) => {
                const segIsFocus = seg.type === Phase.FOCUS;
                const isInterrupted = seg.status === 'interrupted';
                let color = '#333';
                if (segIsFocus) color = isInterrupted ? '#006644' : '#00ff88';
                else color = isInterrupted ? '#224466' : '#4488ff';
                const flexGrow = Math.max(seg.duration, 1000);
                return (
                  <div
                    key={seg.id === 'current' ? `current-${i}` : seg.id}
                    style={{ flexGrow, backgroundColor: color }}
                    className="h-full"
                    title={`${seg.type} (${seg.status}): ${formatTime(seg.duration)}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-center gap-4 mt-1">
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#00ff88] rounded-full" /><span className="text-[10px] text-gray-600 uppercase">Focus</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#006644] rounded-full" /><span className="text-[10px] text-gray-600 uppercase">Interrupted</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#4488ff] rounded-full" /><span className="text-[10px] text-gray-600 uppercase">Break</span></div>
            </div>
          </div>
        </div>
      </div>

      </div>
      </div>
    </div>
  );
};
```

---

### components/TimerDisplay.tsx
```tsx
import React from 'react';
import { Phase } from '../types';

interface TimerDisplayProps {
  ms: number;
  isOverflowing: boolean;
  phase: Phase;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ ms, isOverflowing, phase }) => {
  const absMs = Math.abs(ms);
  const totalSeconds = Math.floor(absMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');
  const formatted = `${pad(minutes)}:${pad(seconds)}`;

  let textColorClass = 'text-white';
  let textShadowStyle = 'none';

  if (isOverflowing) {
    if (phase === Phase.FOCUS) {
      textColorClass = 'text-[#00ff88]';
      textShadowStyle = '0 0 40px rgba(0, 255, 136, 0.3)';
    } else {
      textColorClass = 'text-red-500';
      textShadowStyle = '0 0 40px rgba(239, 68, 68, 0.3)';
    }
  }

  return (
    <div
      id="timer"
      className={`font-tabular font-extrabold leading-none tracking-tight select-none drop-shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-colors duration-300 ${textColorClass}`}
      style={{
        fontSize: 'clamp(5rem, 18vw, 9.5rem)',
        textShadow: textShadowStyle
      }}
    >
      {isOverflowing && <span className="mr-2 opacity-80">+</span>}{formatted}
    </div>
  );
};
```

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Phase, Settings, TimerState, TimelineSegment, HistoryEntry } from './types';
import { DEFAULT_SETTINGS, DING_B64 } from './constants';
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

  // Audio Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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
    if (!audioRef.current) {
      audioRef.current = new Audio(DING_B64);
    }
    audioRef.current.volume = settings.volume / 100;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(e => console.warn("Audio play failed", e));
  }, [settings.volume]);

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
      // 1. Snapshot currently running segment info
      const finalSegments = [...segments];
      
      // If there is an active/paused segment that hasn't been committed yet, add it now.
      if (currentSegmentElapsed > 1000) {
          finalSegments.push({
            id: 'end-' + Date.now(),
            type: timerState.phase,
            duration: currentSegmentElapsed,
            status: 'completed', // Treated as completed/ended part of session
            timestamp: Date.now()
          });
      }

      // 2. Calculate Total Focus Time from the FINAL snapshot
      const totalFocusMs = finalSegments.reduce((acc, s) => s.type === Phase.FOCUS ? acc + s.duration : acc, 0);
      
      // 3. Save to History if valid (> 5 seconds of focus)
      // We accept > 5s to allow for easy testing, though functionally meaningful might be 1m.
      if (totalFocusMs > 5000) {
          const totalMinutes = Math.max(1, Math.round(totalFocusMs / 60000));
          
          const newEntry: HistoryEntry = {
              id: Date.now().toString(),
              name: sessionName || 'Untitled Session',
              timestamp: Date.now(),
              duration: totalMinutes,
              segments: finalSegments // Save the complete timeline
          };
          setHistory(prev => [newEntry, ...prev]);
      }

      // Clear Timeline
      setSegments([]);
      
      // Reset State to Defaults (Focus Phase, Cycle 0)
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


  // Shared logic to proceed to the next phase (used by Modal and 'Next Phase' button)
  const proceedToNextPhase = useCallback(() => {
    setIsDistractionModalOpen(false);
    
    // Logic: 
    // 1. If overflowing, it's completed (natural end).
    // 2. If it is NOT a focus phase (i.e., it's a break), skipping it is also "completed" (user chooses to work).
    // 3. If it IS focus phase and time remains, it's "interrupted".
    const isFocus = timerState.phase === Phase.FOCUS;
    const isNaturalEnd = isOverflowing || displayTime <= 0;
    
    const status = (isNaturalEnd || !isFocus) ? 'completed' : 'interrupted';
    
    commitSegment(status);

    // Cycle Logic
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
    // If overflowing, we skip the modal and go straight to next phase
    if (isOverflowing) {
        proceedToNextPhase();
        return;
    } 
    
    // If we are in a BREAK phase, "Stop/Next" just means "Start Focus" (Next Phase).
    // No need for a distraction modal.
    if (timerState.phase !== Phase.FOCUS) {
        proceedToNextPhase();
        return;
    }

    // Otherwise (Focus phase, not overflowing), pause and ask via modal
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
    // Closed means stayed paused.
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
          onPreviewSound={playSound}
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
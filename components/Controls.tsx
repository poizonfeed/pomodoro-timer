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
  
  // Start: White filled, high contrast black text (Static)
  const startBtnClass = `${btnBase} bg-white text-black border-white hover:bg-gray-200`;

  // Resume: Same as Start but with pulsating animation
  const resumeBtnClass = `${btnBase} bg-white text-black border-white hover:bg-gray-200 animate-resume-pulse`;
  
  // Pause: Red border with subtle glow
  const pauseBtnClass = `${btnBase} bg-red-950/20 text-red-500 border-red-600/50 hover:bg-red-900/40 hover:border-red-500 hover:text-red-400 shadow-[0_0_20px_rgba(220,38,38,0.1)]`;

  const overflowBtnClass = `${btnBase} bg-red-600 text-white border-red-500 hover:bg-red-500 animate-pulse shadow-[0_0_25px_rgba(220,38,38,0.3)]`;

  const resetBtnClass = "mt-6 text-[11px] text-gray-500 hover:text-red-500 uppercase font-bold tracking-[0.25em] transition-colors border-b border-transparent hover:border-red-500/50 pb-1";

  // Logic for the Stop/Next button label
  let mainActionLabel = 'Stop';
  if (isOverflowing) {
    mainActionLabel = 'Next Phase';
  } else if (phase !== Phase.FOCUS) {
    mainActionLabel = 'Next Phase';
  }

  // Determine button style based on state
  let toggleBtnClass = startBtnClass;
  if (isRunning) {
    toggleBtnClass = pauseBtnClass;
  } else if (hasStarted) {
    toggleBtnClass = resumeBtnClass;
  }

  return (
    <div className="flex flex-col items-center mt-12 w-full">
      
      {/* Main Control Row */}
      <div className="flex flex-wrap gap-5 justify-center">
        {!isOverflowing && (
          <button 
            id="startPause" 
            onClick={onToggle} 
            className={toggleBtnClass}
          >
            {isRunning ? 'Pause' : (hasStarted ? 'Resume' : 'Start')}
          </button>
        )}

        <button 
          id="stopNext" 
          onClick={onStopNext} 
          className={isOverflowing ? overflowBtnClass : defaultBtnClass}
        >
          {mainActionLabel}
        </button>
      </div>

      {/* Secondary Reset Row */}
      <button 
        id="reset" 
        onClick={onReset} 
        className={resetBtnClass}
      >
        End Session
      </button>

    </div>
  );
};
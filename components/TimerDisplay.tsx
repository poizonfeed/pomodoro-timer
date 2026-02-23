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
      // Green for Focus overflow (positive accumulation)
      textColorClass = 'text-[#00ff88]';
      textShadowStyle = '0 0 40px rgba(0, 255, 136, 0.3)';
    } else {
      // Red for Break overflow (overtime)
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
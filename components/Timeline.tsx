import React, { useMemo } from 'react';
import { Phase, TimelineSegment } from '../types';

interface TimelineProps {
  segments: TimelineSegment[];
  currentPhase: Phase;
  currentDuration: number; // ms elapsed in current session
  isRunning: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({ segments, currentPhase, currentDuration, isRunning }) => {
  // Merge completed segments with the current ongoing one for display
  const allSegments = useMemo(() => {
    const list = [...segments];
    if (currentDuration > 0) {
      list.push({
        id: 'current',
        type: currentPhase,
        duration: currentDuration,
        status: 'ongoing',
        timestamp: Date.now()
      });
    }
    return list;
  }, [segments, currentPhase, currentDuration]);

  // Stats calculation
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

  if (allSegments.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mt-8 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Stats Header */}
      <div className="flex justify-between items-end text-xs uppercase tracking-widest text-gray-500 mb-2">
        <div>
           <span className="text-white font-bold">{stats.focusPercent}%</span> Focus
        </div>
        <div className="flex gap-4">
            <span>Work: <span className="text-white">{formatTime(stats.totalFocus)}</span></span>
            <span>Rest: <span className="text-white">{formatTime(stats.totalBreak)}</span></span>
        </div>
      </div>

      {/* Visual Bar */}
      <div className="flex h-4 w-full bg-[#111] rounded overflow-hidden border border-[#333]">
        {allSegments.map((seg, i) => {
          const isFocus = seg.type === Phase.FOCUS;
          const isInterrupted = seg.status === 'interrupted';
          
          let color = '#333';
          if (isFocus) {
            color = isInterrupted ? '#006644' : '#00ff88'; // Darker green for interrupted
          } else {
            color = isInterrupted ? '#224466' : '#4488ff'; // Darker blue for interrupted break
          }
          
          // Minimum width for visibility
          const flexGrow = Math.max(seg.duration, 1000); 

          return (
            <div 
              key={seg.id === 'current' ? `current-${i}` : seg.id}
              style={{ flexGrow, backgroundColor: color }}
              className={`h-full transition-all duration-500 ${seg.id === 'current' && isRunning ? 'animate-pulse' : ''}`}
              title={`${seg.type} (${seg.status}): ${formatTime(seg.duration)}`}
            />
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-1">
        <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
            <span className="text-[10px] text-gray-600 uppercase">Focus</span>
        </div>
        <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#006644] rounded-full"></div>
            <span className="text-[10px] text-gray-600 uppercase">Interrupted</span>
        </div>
        <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#4488ff] rounded-full"></div>
            <span className="text-[10px] text-gray-600 uppercase">Break</span>
        </div>
      </div>

    </div>
  );
};
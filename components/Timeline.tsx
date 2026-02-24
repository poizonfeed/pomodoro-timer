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

  // Directional transitions:
  // Entering element: height expands immediately, then opacity fades in with a short delay.
  // Exiting element:  opacity fades out immediately, then height collapses after a short delay.

  // Outer wrapper: grows/collapses when the component appears/disappears for the first time.
  const outerTransition = hasContent
    ? 'grid-template-rows 480ms ease 0ms'
    : 'opacity 220ms ease 0ms, grid-template-rows 380ms ease 200ms';

  // Slider: pre-positioned at 1fr when there's no content yet so the outer reveal is a clean
  // curtain-rise with no double-animation. Opacity also pre-set to 1 for the same reason.
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
      <div
        style={{
          display: 'grid',
          gridTemplateRows: sliderGridRows,
          opacity: sliderOpacity,
          transition: sliderTransition,
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="flex flex-col gap-2 pb-1">
            {/* Label row */}
            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-gray-600">
              <span style={{ color: phaseColor }}>{phaseName}</span>
              <span>{Math.round(fillPercent)}%</span>
            </div>
            {/* Progress bar */}
            <div
              className="relative h-1.5 w-full rounded-full overflow-hidden bg-[#111]"
              style={{ border: '1px solid #1c1c1c' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${fillPercent}%`,
                  backgroundColor: phaseColor,
                  boxShadow: phaseGlow,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── FULL TIMELINE VIEW (paused / stopped) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: !isRunning ? '1fr' : '0fr',
          opacity: !isRunning ? 1 : 0,
          transition: timelineTransition,
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="flex flex-col gap-2 pt-1">

            {/* Stats header */}
            <div className="flex justify-between items-end text-xs uppercase tracking-widest text-gray-500 mb-2">
              <div>
                <span className="text-white font-bold">{stats.focusPercent}%</span> Focus
              </div>
              <div className="flex gap-4">
                <span>Work: <span className="text-white">{formatTime(stats.totalFocus)}</span></span>
                <span>Rest: <span className="text-white">{formatTime(stats.totalBreak)}</span></span>
              </div>
            </div>

            {/* Segmented bar */}
            <div className="flex h-4 w-full bg-[#111] rounded overflow-hidden border border-[#333]">
              {allSegments.map((seg, i) => {
                const segIsFocus = seg.type === Phase.FOCUS;
                const isInterrupted = seg.status === 'interrupted';
                let color = '#333';
                if (segIsFocus) {
                  color = isInterrupted ? '#006644' : '#00ff88';
                } else {
                  color = isInterrupted ? '#224466' : '#4488ff';
                }
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

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#00ff88] rounded-full" />
                <span className="text-[10px] text-gray-600 uppercase">Focus</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#006644] rounded-full" />
                <span className="text-[10px] text-gray-600 uppercase">Interrupted</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#4488ff] rounded-full" />
                <span className="text-[10px] text-gray-600 uppercase">Break</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      </div>
      </div>
    </div>
  );
};

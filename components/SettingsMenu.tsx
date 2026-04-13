import React from 'react';
import { Settings } from '../types';

interface SettingsMenuProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  onPreviewSound: () => void;
  onPreviewTick: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ settings, setSettings, onPreviewSound, onPreviewTick }) => {
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

      <div className="border-t border-[#1c1c1c]" />

      {/* Overflow Tick */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-700">Overflow Tick</p>
          <div className="flex gap-2">
            {(['Off', 'On'] as const).map(label => {
              const active = label === 'On' ? settings.tickingEnabled : !settings.tickingEnabled;
              return (
                <button
                  key={label}
                  onClick={() => setSettings(prev => ({ ...prev, tickingEnabled: label === 'On' }))}
                  className={`px-4 h-7 rounded-full border text-[10px] font-bold tracking-widest transition-all active:scale-95 ${
                    active
                      ? 'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/5'
                      : 'border-[#222] text-gray-500 hover:border-[#333] hover:text-white hover:bg-[#111]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        {settings.tickingEnabled && (
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={settings.tickingVolume}
              onChange={(e) => setSettings(prev => ({ ...prev, tickingVolume: parseInt(e.target.value) }))}
              className="flex-1"
            />
            <span className="font-bold text-[#00ff88] text-sm tabular-nums w-8 text-right">{settings.tickingVolume}</span>
            <button
              onClick={onPreviewTick}
              title="Preview Tick"
              className="w-9 h-9 rounded-full border border-[#222] flex items-center justify-center text-[#00ff88] hover:bg-[#111] hover:border-[#333] active:scale-95 transition-all flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

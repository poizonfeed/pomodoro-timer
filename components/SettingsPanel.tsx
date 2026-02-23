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
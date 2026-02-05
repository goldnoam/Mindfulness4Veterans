
import React, { useState, useEffect } from 'react';
import { ambientService, AmbientSoundMode } from '../services/ambientService';
import { translations, Language } from '../translations';
import { ttsService } from '../services/ttsService';

const AmbientSelector: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AmbientSoundMode>(ambientService.getMode());
  const [volume, setVolume] = useState(0.15);
  const [lang, setLang] = useState<Language>((localStorage.getItem('lang') as Language) || 'he');

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem('lang') as Language;
      if (stored && stored !== lang) setLang(stored);
    }, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  const t = translations[lang] || translations['he'];

  const handleModeChange = (mode: AmbientSoundMode) => {
    ambientService.setMode(mode);
    setCurrentMode(mode);
    const label = mode === 'off' ? t.off : t[mode];
    ttsService.speak(`${t.ambient}: ${label}`);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    ambientService.setVolume(v);
  };

  const options: { mode: AmbientSoundMode; icon: string; label: string }[] = [
    { mode: 'off', icon: '❌', label: t.off },
    { mode: 'rain', icon: '🌧️', label: t.rain },
    { mode: 'waves', icon: '🌊', label: t.waves },
    { mode: 'forest', icon: '🌲', label: t.forest },
    { mode: 'yoga', icon: '🧘', label: t.yoga },
    { mode: 'butterflies', icon: '🦋', label: t.butterflies }
  ];

  return (
    <div className="flex flex-col gap-2 p-1">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {options.map((opt) => (
          <button
            key={opt.mode}
            onClick={() => handleModeChange(opt.mode)}
            className={`flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl text-2xl transition-all border-4 ${
              currentMode === opt.mode 
                ? 'bg-emerald-500 border-emerald-300 text-white shadow-lg scale-105' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={opt.label}
            aria-label={opt.label}
          >
            {opt.icon}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 px-2">
        <span className="text-xl">🔈</span>
        <input
          type="range"
          min="0"
          max="0.5"
          step="0.01"
          value={volume}
          onChange={handleVolume}
          className="flex-1 accent-emerald-500 h-8"
        />
        <span className="text-xl">🔊</span>
      </div>
    </div>
  );
};

export default AmbientSelector;

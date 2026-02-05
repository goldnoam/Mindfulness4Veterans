
import React, { useState, useEffect } from 'react';
import { ambientService, AmbientSoundMode } from '../services/ambientService';
import { translations, Language } from '../translations';
import { ttsService } from '../services/ttsService';

const AmbientSelector: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AmbientSoundMode>(ambientService.getMode());
  const [volume, setVolume] = useState(0.3);
  const [lang, setLang] = useState<Language>((localStorage.getItem('lang') as Language) || 'he');

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem('lang') as Language;
      if (stored && stored !== lang) setLang(stored);
    }, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  const t = translations[lang];

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
    <div className="flex flex-col gap-3 bg-slate-800 border-2 border-slate-700 p-4 rounded-3xl shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm font-bold text-slate-400">{t.ambient}</label>
        <div className="flex gap-2 flex-wrap justify-end">
          {options.map((opt) => (
            <button
              key={opt.mode}
              onClick={() => handleModeChange(opt.mode)}
              className={`w-12 h-12 flex items-center justify-center rounded-full text-2xl transition-all border-2 ${
                currentMode === opt.mode 
                  ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                  : 'bg-slate-700 border-slate-600 text-slate-400 grayscale hover:grayscale-0'
              }`}
              title={opt.label}
              aria-label={opt.label}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xl">🔈</span>
        <input
          type="range"
          min="0"
          max="0.8"
          step="0.01"
          value={volume}
          onChange={handleVolume}
          className="flex-1 accent-blue-500 h-8"
        />
        <span className="text-xl">🔊</span>
      </div>
    </div>
  );
};

export default AmbientSelector;

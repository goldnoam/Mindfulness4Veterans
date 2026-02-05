
import React, { useState, useEffect } from 'react';
import { musicService } from '../services/musicService';
import { translations, Language } from '../translations';
import { ttsService } from '../services/ttsService';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.15);
  const [lang, setLang] = useState<Language>((localStorage.getItem('lang') as Language) || 'he');

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem('lang') as Language;
      if (stored && stored !== lang) setLang(stored);
    }, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  const t = translations[lang];

  const toggleMusic = () => {
    musicService.toggle();
    setIsPlaying(musicService.getIsPlaying());
    ttsService.speak(isPlaying ? 'Stop Music' : 'Start Music');
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    musicService.setVolume(v);
  };

  return (
    <div className="flex items-center gap-4 bg-slate-800 border-2 border-slate-700 p-3 rounded-2xl shadow-inner">
      <button 
        onClick={toggleMusic}
        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${isPlaying ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-700 text-slate-400'}`}
        aria-label={isPlaying ? 'Music On' : 'Music Off'}
      >
        {isPlaying ? '🎵' : '🔇'}
      </button>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400 font-bold px-1">{t.volume}</label>
        <input 
          type="range" 
          min="0" 
          max="0.5" 
          step="0.01" 
          value={volume} 
          onChange={handleVolume}
          className="w-24 accent-emerald-500"
        />
      </div>
    </div>
  );
};

export default MusicPlayer;

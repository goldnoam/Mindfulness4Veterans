
import React, { useState, useEffect } from 'react';
import { musicService } from '../services/musicService';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.15);

  const toggleMusic = () => {
    musicService.toggle();
    setIsPlaying(musicService.getIsPlaying());
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
        aria-label={isPlaying ? 'כבה מוזיקת רקע' : 'הפעל מוזיקת רקע'}
      >
        {isPlaying ? '🎵' : '🔇'}
      </button>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400 font-bold px-1">עוצמה</label>
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

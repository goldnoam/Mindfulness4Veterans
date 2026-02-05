
import React, { useState } from 'react';
import { ttsService } from '../services/ttsService';

const MuteToggle: React.FC = () => {
  const [muted, setMuted] = useState(ttsService.getMuted());

  const toggle = () => {
    const newState = ttsService.toggleMute();
    setMuted(newState);
  };

  return (
    <button 
      onClick={toggle}
      className={`p-4 rounded-2xl border-2 transition-all shadow-md active:scale-90 ${muted ? 'bg-red-900/40 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-emerald-400'}`}
      aria-label={muted ? 'Unmute Voice' : 'Mute Voice'}
    >
      <span className="text-3xl">{muted ? '🔇' : '🔊'}</span>
    </button>
  );
};

export default MuteToggle;

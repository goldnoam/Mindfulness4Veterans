
import React, { useEffect, useState, useMemo } from 'react';
import { Language, translations } from '../translations';

interface Props {
  onComplete: () => void;
}

const CelebrationOverlay: React.FC<Props> = ({ onComplete }) => {
  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang] || translations['he'];
  const [particles, setParticles] = useState<number[]>([]);
  
  const randomMessage = useMemo(() => {
    const msgs = t.congratsMessages || [t.congrats];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }, [t]);

  useEffect(() => {
    // Generate random particles for confetti
    setParticles(Array.from({ length: 50 }, (_, i) => i));
    
    // Auto complete after 5 seconds if they don't click
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-700 px-6 text-center">
      {particles.map(p => (
        <div 
          key={p} 
          className="confetti"
          style={{ 
            left: `${Math.random() * 100}%`, 
            top: `-20px`,
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e'][p % 6],
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${1.5 + Math.random() * 2}s`,
            width: `${8 + Math.random() * 10}px`,
            height: `${8 + Math.random() * 10}px`
          }}
        />
      ))}
      
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-emerald-500 rounded-full celebrate-ping opacity-30"></div>
        <div className="shiny-star">
          <div className="text-[180px] star-animate leading-none drop-shadow-[0_0_50px_rgba(245,158,11,0.7)]">⭐</div>
        </div>
      </div>
      
      <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-500 delay-200">
        <h2 className="text-7xl font-black text-white drop-shadow-lg">{t.congrats}</h2>
        <p className="text-4xl text-emerald-400 font-bold">{randomMessage}</p>
        <p className="text-2xl text-slate-300 font-medium max-w-md mx-auto">{t.earnedStar}</p>
      </div>
      
      <button 
        onClick={onComplete}
        className="mt-16 bg-emerald-600 text-white text-3xl font-black py-8 px-20 rounded-[40px] shadow-[0_20px_50px_rgba(16,185,129,0.4)] active:scale-95 border-b-8 border-emerald-800 transition-all hover:bg-emerald-500"
      >
        {t.done}
      </button>
    </div>
  );
};

export default CelebrationOverlay;

import React, { useEffect, useState, useMemo } from 'react';
import { Language, translations } from '../translations';

interface Props {
  onComplete: () => void;
}

const CelebrationOverlay: React.FC<Props> = ({ onComplete }) => {
  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang] || translations['he'];
  const [particles, setParticles] = useState<number[]>([]);
  const [burstStars, setBurstStars] = useState<{ id: number, x: number, y: number, char: string }[]>([]);
  
  const randomMessage = useMemo(() => {
    const msgs = t.congratsMessages || [t.congrats];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }, [t]);

  useEffect(() => {
    // Generate random particles for confetti
    setParticles(Array.from({ length: 120 }, (_, i) => i));
    
    // Generate star burst
    const emojis = ['⭐', '✨', '🌟', '💫', '🎖️'];
    const newBurst = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400,
      char: emojis[Math.floor(Math.random() * emojis.length)]
    }));
    setBurstStars(newBurst);
    
    // Auto complete after 7 seconds for seniors to fully appreciate
    const timer = setTimeout(onComplete, 7000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-700 px-6 text-center overflow-hidden">
      {/* Background Pulse */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden -z-10">
         <div className="w-[1000px] h-[1000px] bg-emerald-500/10 rounded-full animate-ping opacity-20"></div>
         <div className="absolute w-[800px] h-[800px] bg-blue-500/10 rounded-full animate-pulse opacity-10"></div>
      </div>

      {particles.map(p => (
        <div 
          key={p} 
          className="confetti"
          style={{ 
            left: `${Math.random() * 100}%`, 
            top: `-20px`,
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e', '#ffffff'][p % 7],
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            width: `${12 + Math.random() * 15}px`,
            height: `${12 + Math.random() * 15}px`
          }}
        />
      ))}

      {burstStars.map(s => (
        <div 
          key={s.id}
          className="star-burst text-4xl"
          style={{
            top: '50%',
            left: '50%',
            '--tw-translate-x': `${s.x}px`,
            '--tw-translate-y': `${s.y}px`
          } as React.CSSProperties}
        >
          {s.char}
        </div>
      ))}
      
      <div className="relative mb-12 transform hover:scale-110 transition-transform duration-500 cursor-default">
        <div className="absolute inset-0 bg-emerald-500 rounded-full celebrate-ping opacity-40"></div>
        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="shiny-star relative z-10">
          <div className="text-[240px] star-animate leading-none drop-shadow-[0_0_100px_rgba(245,158,11,0.9)]">⭐</div>
        </div>
      </div>
      
      <div className="space-y-8 animate-in slide-in-from-bottom-12 duration-700 delay-200">
        <h2 className="text-8xl md:text-9xl font-black text-white drop-shadow-2xl animate-bounce tracking-tighter">
          {t.congrats}
        </h2>
        <p className="text-5xl md:text-6xl font-black rainbow-text drop-shadow-lg scale-110">
          {randomMessage}
        </p>
        <div className="flex flex-col items-center gap-4">
           <p className="text-4xl text-slate-100 font-bold max-w-lg mx-auto leading-tight">{t.earnedStar}</p>
           <div className="flex gap-4">
              <span className="text-5xl animate-bounce" style={{ animationDelay: '0s' }}>✨</span>
              <span className="text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🌟</span>
              <span className="text-5xl animate-bounce" style={{ animationDelay: '0.4s' }}>✨</span>
           </div>
        </div>
      </div>
      
      <button 
        onClick={onComplete}
        className="mt-20 bg-emerald-600 text-white text-5xl font-black py-10 px-32 rounded-[60px] shadow-[0_40px_80px_rgba(16,185,129,0.5)] active:scale-95 border-b-[16px] border-emerald-800 transition-all hover:bg-emerald-500 hover:-translate-y-4 group"
      >
        <span className="group-hover:scale-110 inline-block transition-transform">{t.done}</span>
      </button>
    </div>
  );
};

export default CelebrationOverlay;
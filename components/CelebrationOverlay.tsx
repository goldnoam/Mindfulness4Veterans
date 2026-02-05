
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
    // Generate random particles for confetti - doubled the amount
    setParticles(Array.from({ length: 100 }, (_, i) => i));
    
    // Auto complete after 6 seconds
    const timer = setTimeout(onComplete, 6000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-700 px-6 text-center overflow-hidden">
      {/* Background Pulse */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden -z-10">
         <div className="w-[800px] h-[800px] bg-emerald-500/10 rounded-full animate-ping opacity-20"></div>
         <div className="absolute w-[600px] h-[600px] bg-blue-500/10 rounded-full animate-pulse opacity-10"></div>
      </div>

      {particles.map(p => (
        <div 
          key={p} 
          className="confetti"
          style={{ 
            left: `${Math.random() * 100}%`, 
            top: `-20px`,
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e', '#ffffff'][p % 7],
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${1.5 + Math.random() * 2.5}s`,
            width: `${10 + Math.random() * 12}px`,
            height: `${10 + Math.random() * 12}px`
          }}
        />
      ))}
      
      <div className="relative mb-12 transform hover:scale-110 transition-transform duration-500 cursor-default">
        <div className="absolute inset-0 bg-emerald-500 rounded-full celebrate-ping opacity-40"></div>
        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="shiny-star relative z-10">
          <div className="text-[200px] star-animate leading-none drop-shadow-[0_0_80px_rgba(245,158,11,0.8)]">⭐</div>
        </div>
      </div>
      
      <div className="space-y-6 animate-in slide-in-from-bottom-12 duration-700 delay-200">
        <h2 className="text-8xl font-black text-white drop-shadow-2xl animate-bounce">
          {t.congrats}
        </h2>
        <p className="text-5xl text-emerald-400 font-black drop-shadow-lg scale-110">
          {randomMessage}
        </p>
        <div className="flex flex-col items-center gap-2">
           <p className="text-3xl text-slate-100 font-bold max-w-md mx-auto">{t.earnedStar}</p>
           <div className="flex gap-2">
              <span className="text-4xl">✨</span>
              <span className="text-4xl">✨</span>
              <span className="text-4xl">✨</span>
           </div>
        </div>
      </div>
      
      <button 
        onClick={onComplete}
        className="mt-16 bg-emerald-600 text-white text-4xl font-black py-10 px-24 rounded-[50px] shadow-[0_30px_60px_rgba(16,185,129,0.5)] active:scale-95 border-b-[12px] border-emerald-800 transition-all hover:bg-emerald-500 hover:-translate-y-2 group"
      >
        <span className="group-hover:scale-110 inline-block transition-transform">{t.done}</span>
      </button>
    </div>
  );
};

export default CelebrationOverlay;

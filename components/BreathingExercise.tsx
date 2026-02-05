
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import CelebrationOverlay from './CelebrationOverlay';
import MuteToggle from './MuteToggle';
import { Language, translations } from '../translations';
import AdBanner from './AdBanner';

interface Props {
  onComplete: () => void;
}

type Phase = 'ready' | 'inhale' | 'hold' | 'exhale';

const BreathingExercise: React.FC<Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>('ready');
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [cyclesDone, setCyclesDone] = useState(0);
  const [maxCycles, setMaxCycles] = useState(1); // User chosen repeats
  const [timeLeftInPhase, setTimeLeftInPhase] = useState(0);
  
  const timerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const cycleCountRef = useRef(0);
  const phaseStartTimeRef = useRef<number>(0);
  const remainingInPhaseRef = useRef<number>(0);
  const currentPhaseRef = useRef<'inhale' | 'hold' | 'exhale' | null>(null);

  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang] || translations['he'];

  const handleFinish = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    ttsService.stop();
    statsService.addStar();
    statsService.addToHistory(t.breathing.title, '🌬️', 60 * maxCycles);
    setIsFinished(true);
  }, [t.breathing.title, maxCycles]);

  const runPhase = useCallback((currentPhase: 'inhale' | 'hold' | 'exhale', duration?: number) => {
    if (!isActive) return;
    
    setPhase(currentPhase);
    currentPhaseRef.current = currentPhase;
    let text = '';
    let phaseDuration = duration || 0;

    if (!duration) {
      switch (currentPhase) {
        case 'inhale':
          text = lang === 'he' ? 'נשמו פנימה עמוק...' : 'Inhale deeply...';
          phaseDuration = 4000;
          break;
        case 'hold':
          text = lang === 'he' ? 'החזיקו את האוויר...' : 'Hold your breath...';
          phaseDuration = 3000;
          break;
        case 'exhale':
          text = lang === 'he' ? 'נשפו החוצה לאט...' : 'Exhale slowly...';
          phaseDuration = 5000;
          break;
      }
      ttsService.speak(text);
    }

    phaseStartTimeRef.current = Date.now();
    remainingInPhaseRef.current = phaseDuration;
    setTimeLeftInPhase(Math.ceil(phaseDuration / 1000));

    // Cleanup previous countdown
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    countdownRef.current = window.setInterval(() => {
       setTimeLeftInPhase(prev => Math.max(0, prev - 1));
    }, 1000);

    timerRef.current = window.setTimeout(() => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      
      if (currentPhase === 'inhale') {
        runPhase('hold');
      } else if (currentPhase === 'hold') {
        runPhase('exhale');
      } else {
        cycleCountRef.current += 1;
        setCyclesDone(cycleCountRef.current);
        
        if (cycleCountRef.current >= 3 * maxCycles) {
          handleFinish();
        } else {
          runPhase('inhale');
        }
      }
    }, phaseDuration);
  }, [lang, isActive, handleFinish, maxCycles]);

  const startExercise = () => {
    cycleCountRef.current = 0;
    setCyclesDone(0);
    setIsActive(true);
    setIsPaused(false);
    runPhase('inhale');
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      if (currentPhaseRef.current) {
        runPhase(currentPhaseRef.current, remainingInPhaseRef.current);
      }
    } else {
      setIsPaused(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      const elapsed = Date.now() - phaseStartTimeRef.current;
      remainingInPhaseRef.current = Math.max(0, remainingInPhaseRef.current - elapsed);
      ttsService.stop();
    }
  };

  const stopEarly = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setIsActive(false);
    setPhase('ready');
    ttsService.stop();
  };

  const restartExercise = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    ttsService.stop();
    startExercise();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      ttsService.stop();
    };
  }, []);

  const getCircleScale = () => {
    if (isPaused) return phase === 'exhale' ? 'scale-100' : 'scale-[2.8]';
    if (phase === 'inhale') return 'scale-[2.8]';
    if (phase === 'hold') return 'scale-[2.8]';
    if (phase === 'exhale') return 'scale-100';
    return 'scale-100';
  };

  const getPhaseColors = () => {
    if (isPaused) return 'bg-slate-700 shadow-none grayscale';
    switch (phase) {
      case 'inhale': return 'bg-emerald-400 shadow-[0_0_100px_rgba(52,211,153,0.8)]';
      case 'hold': return 'bg-blue-400 shadow-[0_0_100px_rgba(96,165,250,0.8)] animate-pulse';
      case 'exhale': return 'bg-emerald-600 shadow-[0_0_40px_rgba(5,150,105,0.4)]';
      default: return 'bg-emerald-500';
    }
  };

  const getPhaseText = () => {
    if (isPaused) return lang === 'he' ? 'מושהה' : 'Paused';
    switch (phase) {
      case 'inhale': return lang === 'he' ? 'שאיפה' : 'Inhale';
      case 'hold': return lang === 'he' ? 'להחזיק' : 'Hold';
      case 'exhale': return lang === 'he' ? 'נשיפה' : 'Exhale';
      default: return '';
    }
  };

  if (isFinished) return <CelebrationOverlay onComplete={onComplete} />;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg p-6 rounded-[60px]" role="region" aria-label="Breathing Exercise">
      {!isActive ? (
        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-emerald-500/30 w-full text-center">
          <div className="text-7xl mb-6" aria-hidden="true">🌬️</div>
          <h3 className="text-4xl font-bold text-white mb-4">
            {lang === 'he' ? 'תרגיל נשימה' : 'Breathing Exercise'}
          </h3>
          
          <div className="mb-8">
            <p className="text-2xl font-bold text-slate-300 mb-4">{t.cycles}</p>
            <div className="flex gap-4 justify-center">
              {[1, 2, 3].map(c => (
                <button 
                  key={c}
                  onClick={() => { setMaxCycles(c); ttsService.speak(c.toString()); }}
                  className={`w-20 h-20 rounded-2xl border-4 text-3xl font-black transition-all shadow-lg active:scale-95 ${maxCycles === c ? 'bg-emerald-500 border-emerald-300 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <AdBanner slot="exercise-setup-ad" />

          <button 
            onClick={startExercise}
            className="w-full bg-emerald-600 text-white text-4xl font-black py-8 rounded-3xl shadow-xl active:scale-95 border-b-8 border-emerald-800 transition-all mt-4"
          >
            {t.start}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          <div className="flex items-center justify-between w-full px-6 mb-4">
             <div className="bg-slate-800 px-6 py-2 rounded-2xl border-2 border-emerald-500/30 text-3xl font-bold text-emerald-400 tabular-nums shadow-lg">
                {Math.floor(cyclesDone / 3) + 1} / {maxCycles}
             </div>
             <div className="flex gap-4">
               <button 
                  onClick={togglePause}
                  className="p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 text-3xl shadow-md active:scale-90"
                  aria-label={isPaused ? "Play" : "Pause"}
               >
                 {isPaused ? '▶️' : '⏸️'}
               </button>
               <MuteToggle />
             </div>
          </div>

          <div className="relative flex items-center justify-center h-[400px] w-full" aria-hidden="true">
            <div 
              className={`rounded-full flex items-center justify-center transition-all ease-in-out z-10 border-4 border-white/30 ${getCircleScale()} ${getPhaseColors()}`}
              style={{ 
                width: '100px', 
                height: '100px', 
                transitionDuration: isPaused ? '300ms' : phase === 'inhale' ? '4000ms' : phase === 'exhale' ? '5000ms' : '3000ms' 
              }}
            >
              {phase === 'hold' && !isPaused && (
                 <div className="absolute inset-0 rounded-full bg-white/10 animate-ping"></div>
              )}
            </div>
            
            <div className="absolute z-20 text-center pointer-events-none flex flex-col items-center">
               <h3 className="text-5xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] uppercase tracking-wider mb-2">
                 {getPhaseText()}
               </h3>
               {!isPaused && (
                   <span className="text-6xl font-black text-white/80 tabular-nums drop-shadow-lg">
                      {timeLeftInPhase}
                   </span>
               )}
            </div>
          </div>

          <div className="flex flex-col gap-6 mt-8 w-full px-4 items-center">
             <button 
               onClick={restartExercise} 
               className="bg-slate-800 border-4 border-emerald-500/50 text-emerald-400 px-10 py-4 rounded-3xl text-2xl font-bold shadow-xl active:scale-95 transition-all"
             >
               🔄 {t.restart}
             </button>
             <button 
               onClick={stopEarly} 
               className="text-2xl text-slate-500 hover:text-emerald-400 underline font-bold transition-colors active:scale-95"
             >
              {t.back}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreathingExercise;

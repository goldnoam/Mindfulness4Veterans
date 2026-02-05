
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import ShareButton from './ShareButton';
import MuteToggle from './MuteToggle';

interface Props {
  onComplete: () => void;
}

type Phase = 'ready' | 'inhale' | 'hold' | 'exhale';

const BreathingExercise: React.FC<Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>('ready');
  const [isActive, setIsActive] = useState(false);
  const [cyclesDone, setCyclesDone] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes default
  const timerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const runPhase = useCallback((currentPhase: 'inhale' | 'hold' | 'exhale') => {
    setPhase(currentPhase);
    let text = '';
    let duration = 0;

    switch (currentPhase) {
      case 'inhale':
        text = 'נשמו פנימה עמוק...';
        duration = 4000;
        break;
      case 'hold':
        text = 'החזיקו את האוויר...';
        duration = 3000;
        break;
      case 'exhale':
        text = 'נשפו החוצה לאט...';
        duration = 5000;
        break;
    }

    ttsService.speak(text);

    timerRef.current = window.setTimeout(() => {
      if (currentPhase === 'inhale') runPhase('hold');
      else if (currentPhase === 'hold') runPhase('exhale');
      else {
        setCyclesDone(prev => prev + 1);
        runPhase('inhale');
      }
    }, duration);
  }, []);

  const handleFinish = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    ttsService.stop();
    ttsService.speak('כל הכבוד, סיימת תרגיל נשימה מצוין.');
    statsService.addStar();
    statsService.addToHistory('נשימות', '🌬️', 120);
    onComplete();
  }, [onComplete]);

  const startExercise = () => {
    setIsActive(true);
    runPhase('inhale');
    countdownRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopEarly = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setIsActive(false);
    setPhase('ready');
    ttsService.stop();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      ttsService.stop();
    };
  }, []);

  const getCircleScale = () => {
    if (phase === 'inhale' || phase === 'hold') return 'scale-[2.8]';
    return 'scale-100';
  };

  const getPhaseColors = () => {
    switch (phase) {
      case 'inhale': return 'bg-emerald-400 shadow-[0_0_80px_rgba(52,211,153,0.7)]';
      case 'hold': return 'bg-blue-400 shadow-[0_0_80px_rgba(96,165,250,0.7)]';
      case 'exhale': return 'bg-emerald-600 shadow-[0_0_40px_rgba(5,150,105,0.4)]';
      default: return 'bg-emerald-500';
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'שאיפה';
      case 'hold': return 'להחזיק';
      case 'exhale': return 'נשיפה';
      default: return '';
    }
  };

  return (
    <div className={`flex flex-col items-center gap-8 w-full max-w-lg transition-colors duration-1000 p-6 rounded-[60px]`} role="region" aria-label="Breathing Exercise">
      {!isActive ? (
        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-emerald-500/30 w-full text-center">
          <div className="text-7xl mb-6" aria-hidden="true">🌬️</div>
          <p className="text-2xl text-slate-300 mb-8 font-medium">
            תרגיל נשימה עוזר להרגיע את מערכת העצבים ולמצוא שקט פנימי.
          </p>
          <button 
            onClick={startExercise}
            className="bg-emerald-500 text-white text-3xl font-bold py-8 px-16 rounded-full shadow-2xl hover:bg-emerald-600 transition-all active:scale-95 border-b-8 border-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-400"
          >
            התחל נשימה (2 דק')
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          <div className="flex items-center justify-between w-full px-6 mb-4">
             <div className="bg-slate-800 px-6 py-2 rounded-2xl border-2 border-emerald-500/30 text-3xl font-bold text-emerald-400 tabular-nums shadow-lg" aria-label="Time remaining">
                {formatTime(timeLeft)}
             </div>
             <MuteToggle />
          </div>

          <div className="relative flex items-center justify-center h-[350px] w-full" aria-hidden="true">
            <div className={`rounded-full flex items-center justify-center transition-all ease-in-out z-10 border-4 border-white/30 ${getCircleScale()} ${getPhaseColors()}`}
              style={{ width: '100px', height: '100px', transitionDuration: phase === 'inhale' ? '4000ms' : phase === 'exhale' ? '5000ms' : '3000ms' }}>
              <div className="transform scale-[0.4] text-white font-black text-3xl opacity-80 uppercase tracking-widest">{getPhaseText()}</div>
            </div>
          </div>

          <div className="text-center h-20 mt-4">
            <h3 className="text-4xl font-bold text-emerald-400 mb-2 drop-shadow-lg" aria-live="polite">{getPhaseText()}</h3>
          </div>
          
          <div className="flex flex-col gap-6 mt-8 w-full px-4">
             <button onClick={stopEarly} className="text-2xl text-slate-500 hover:text-emerald-400 underline font-bold transition-colors active:scale-95">
              הפסק תרגיל
            </button>
            <div className="text-slate-500 font-bold mt-2 text-center" aria-live="polite">מחזורים שהושלמו: {cyclesDone}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreathingExercise;

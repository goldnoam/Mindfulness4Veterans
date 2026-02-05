
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import ShareButton from './ShareButton';

interface Props {
  onComplete: () => void;
}

type Phase = 'ready' | 'inhale' | 'hold' | 'exhale';

const BreathingExercise: React.FC<Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>('ready');
  const [isActive, setIsActive] = useState(false);
  const [cyclesDone, setCyclesDone] = useState(0);
  const timerRef = useRef<number | null>(null);

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

  const startExercise = () => {
    setIsActive(true);
    runPhase('inhale');
  };

  const handleFinish = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    ttsService.stop();
    ttsService.speak('כל הכבוד, סיימת תרגיל נשימה מצוין.');
    statsService.addStar();
    onComplete();
  };

  const stopEarly = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsActive(false);
    setPhase('ready');
    ttsService.stop();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
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

  const getBgShift = () => {
    switch (phase) {
      case 'inhale': return 'bg-emerald-950/40';
      case 'hold': return 'bg-blue-950/40';
      case 'exhale': return 'bg-slate-950';
      default: return '';
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

  const getInstructionText = () => {
    switch (phase) {
      case 'inhale': return 'נשמו פנימה דרך האף והרחיבו את החזה';
      case 'hold': return 'שימרו על האוויר בפנים בנחת';
      case 'exhale': return 'שחררו את האוויר לאט דרך הפה';
      default: return '';
    }
  };

  return (
    <div className={`flex flex-col items-center gap-8 w-full max-w-lg transition-colors duration-1000 p-6 rounded-[60px] ${getBgShift()}`}>
      {!isActive ? (
        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-emerald-500/30 w-full text-center">
          <div className="text-7xl mb-6">🌬️</div>
          <p className="text-2xl text-slate-300 mb-8 font-medium">
            תרגיל נשימה עוזר להרגיע את מערכת העצבים ולמצוא שקט פנימי.
          </p>
          <button 
            onClick={startExercise}
            className="bg-emerald-500 text-white text-3xl font-bold py-8 px-16 rounded-full shadow-2xl hover:bg-emerald-600 transition-all active:scale-95 border-b-8 border-emerald-700"
          >
            התחל נשימה
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          {/* Enhanced Multi-layered Animation */}
          <div className="relative flex items-center justify-center h-[450px] w-full">
            {/* Pulsing Particles (Simulated via decorative rings) */}
            <div className={`absolute rounded-full border border-emerald-500/5 transition-all duration-[3000ms] ${phase === 'inhale' ? 'scale-[4] opacity-0' : 'scale-0 opacity-20'}`}></div>
            <div className={`absolute rounded-full border border-emerald-500/10 transition-all duration-[4000ms] ${phase === 'inhale' ? 'scale-[3.5] opacity-0' : 'scale-0 opacity-40'}`}></div>

            {/* Outer Soft Ring */}
            <div 
              className={`absolute rounded-full border-4 border-emerald-500/20 transition-all ease-in-out
                ${getCircleScale()} opacity-20
              `}
              style={{ width: '160px', height: '160px', transitionDuration: phase === 'inhale' ? '4000ms' : phase === 'exhale' ? '5000ms' : '3000ms' }}
            ></div>
            
            {/* Middle Glow */}
            <div 
              className={`absolute rounded-full blur-3xl transition-all ease-in-out
                ${getCircleScale()} opacity-20 ${phase === 'hold' ? 'bg-blue-400' : 'bg-emerald-400'}
              `}
              style={{ width: '240px', height: '240px', transitionDuration: phase === 'inhale' ? '4000ms' : phase === 'exhale' ? '5000ms' : '3000ms' }}
            ></div>

            {/* Core Breathing Circle */}
            <div 
              className={`rounded-full flex items-center justify-center transition-all ease-in-out z-10 border-4 border-white/30
                ${getCircleScale()} ${getPhaseColors()}
              `}
              style={{ 
                width: '100px', 
                height: '100px',
                transitionDuration: phase === 'inhale' ? '4000ms' : phase === 'exhale' ? '5000ms' : '3000ms'
              }}
            >
              <div className="transform scale-[0.4] text-white font-black text-3xl opacity-80 uppercase tracking-widest">
                {getPhaseText()}
              </div>
            </div>
          </div>

          <div className="text-center h-28 flex flex-col items-center justify-center px-4 mt-4">
            <h3 className="text-4xl font-bold text-emerald-400 mb-2 drop-shadow-lg">
              {getPhaseText()}
            </h3>
            <p className="text-2xl text-slate-300 font-medium leading-tight">
              {getInstructionText()}
            </p>
          </div>
          
          <div className="flex flex-col gap-6 mt-12 w-full px-4">
             {cyclesDone >= 1 && (
               <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleFinish}
                    className="bg-emerald-500 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 hover:bg-emerald-600 transition-colors border-b-8 border-emerald-700"
                  >
                    סיימתי, תודה!
                  </button>
                  <div className="flex justify-center">
                    <ShareButton 
                      text={`השלמתי ${cyclesDone} מחזורי נשימה מודעת ב'רגע של שלווה'! ⭐ מרגיש/ה רגוע/ה וממוקד/ת יותר.`} 
                    />
                  </div>
               </div>
             )}
             <button 
              onClick={stopEarly}
              className="text-2xl text-slate-500 hover:text-emerald-400 underline font-bold transition-colors"
            >
              הפסק תרגיל
            </button>
            
            <div className="text-slate-500 font-bold mt-2 text-center">
               מחזורים שהושלמו: {cyclesDone}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreathingExercise;

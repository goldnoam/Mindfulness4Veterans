
import React, { useState, useEffect, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import CelebrationOverlay from './CelebrationOverlay';
import MuteToggle from './MuteToggle';
import { Language, translations } from '../translations';

interface Props {
  onComplete: () => void;
}

const MeditationExercise: React.FC<Props> = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const timerRef = useRef<number | null>(null);

  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang] || translations['he'];

  const startMeditation = (seconds: number) => {
    setSelectedDuration(seconds);
    setTimeLeft(seconds);
    setIsActive(true);
    setIsFinished(false);
    
    ttsService.speak(lang === 'he' ? "מצאו תנוחה נוחה. עצמו עיניים בנחת." : "Find a comfortable position. Close your eyes gently.");
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinish(seconds);
          return 0;
        }
        
        if (prev === Math.floor(seconds * 0.75)) {
          ttsService.speak(lang === 'he' ? "שימו לב למגע של הגוף עם הכיסא." : "Notice the contact between your body and the chair.");
        } else if (prev === Math.floor(seconds * 0.5)) {
          ttsService.speak(lang === 'he' ? "הקשיבו לצלילים הרחוקים בחדר." : "Listen to the distant sounds in the room.");
        } else if (prev === Math.floor(seconds * 0.25)) {
          ttsService.speak(lang === 'he' ? "חייכו חיוך קטן לעצמכם." : "Give yourself a small smile.");
        }
        
        return prev - 1;
      });
    }, 1000);
  };

  const handleFinish = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    statsService.addStar();
    statsService.addToHistory(t.meditation.title, '🧘', seconds);
    setIsFinished(true);
  };

  const stopEarly = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setIsFinished(false);
    ttsService.stop();
  };

  const restartExercise = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    ttsService.stop();
    startMeditation(selectedDuration);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      ttsService.stop();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished) return <CelebrationOverlay onComplete={onComplete} />;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg" role="region" aria-label="Meditation Exercise">
      {!isActive ? (
        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-purple-500/30 w-full text-center">
          <div className="text-7xl mb-6" aria-hidden="true">🧘</div>
          <h3 className="text-3xl font-bold text-white mb-8">{t.selectDuration}</h3>
          <div className="flex flex-col gap-4">
            {[60, 180, 300].map(s => (
              <button 
                key={s}
                onClick={() => startMeditation(s)}
                className="bg-purple-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-purple-800 focus-visible:ring-4 focus-visible:ring-purple-400"
              >
                {s / 60} {t.min}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8 w-full">
          <div className="flex items-center justify-between w-full px-6">
             <div className="bg-slate-800 px-6 py-2 rounded-2xl border-2 border-purple-500/30 text-3xl font-bold text-purple-400 tabular-nums shadow-lg" aria-label="Time remaining">
                {formatTime(timeLeft)}
             </div>
             <MuteToggle />
          </div>

          <div className="relative flex items-center justify-center" aria-hidden="true">
             <div className="absolute w-64 h-64 bg-purple-500/20 rounded-full celebrate-ping"></div>
             <div className="absolute w-48 h-48 bg-purple-500/30 rounded-full animate-pulse"></div>
             
             <div className="z-10 bg-slate-900 border-8 border-purple-500 w-48 h-48 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-5xl font-bold text-white tabular-nums">
                  {formatTime(timeLeft)}
                </span>
             </div>
          </div>

          <div className="text-center px-4" aria-live="polite">
            <p className="text-4xl font-bold text-purple-400 mb-4">{lang === 'he' ? 'פשוט להיות...' : 'Just be...'}</p>
          </div>

          <div className="flex flex-col gap-4 items-center">
            <button onClick={restartExercise} className="bg-slate-800 border-4 border-purple-500/50 text-purple-400 px-10 py-4 rounded-3xl text-2xl font-bold shadow-xl active:scale-95 transition-all">
               🔄 {t.restart}
             </button>
            <button 
              onClick={stopEarly}
              className="text-2xl text-purple-400 underline font-medium mt-4 active:scale-95"
            >
              {t.back}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditationExercise;

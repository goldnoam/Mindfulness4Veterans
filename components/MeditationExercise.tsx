
import React, { useState, useEffect, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import ShareButton from './ShareButton';
import MuteToggle from './MuteToggle';

interface Props {
  onComplete: () => void;
}

const MeditationExercise: React.FC<Props> = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const timerRef = useRef<number | null>(null);

  const startMeditation = (seconds: number) => {
    setSelectedDuration(seconds);
    setTimeLeft(seconds);
    setIsActive(true);
    setIsDone(false);
    
    ttsService.speak("מצאו תנוחה נוחה. עצמו עיניים בנחת או הביטו בנקודה אחת.");
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinish(seconds);
          return 0;
        }
        
        if (prev === Math.floor(seconds * 0.75)) {
          ttsService.speak("שימו לב למגע של הגוף עם הכיסא.");
        } else if (prev === Math.floor(seconds * 0.5)) {
          ttsService.speak("הקשיבו לצלילים הרחוקים בחדר.");
        } else if (prev === Math.floor(seconds * 0.25)) {
          ttsService.speak("חייכו חיוך קטן לעצמכם.");
        }
        
        return prev - 1;
      });
    }, 1000);
  };

  const handleFinish = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setIsDone(true);
    ttsService.speak("חזרו לאט לרגע הזה. הרווחתם כוכב שלווה.");
    statsService.addStar();
    statsService.addToHistory('מדיטציה', '🧘', seconds);
  };

  const stopEarly = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setIsDone(false);
    ttsService.stop();
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

  if (isDone) {
    return (
      <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-emerald-500/30 w-full max-w-lg text-center animate-in zoom-in-75 duration-300">
        <div className="text-7xl mb-6" aria-hidden="true">🧘</div>
        <h3 className="text-4xl font-bold text-emerald-400 mb-6">מדיטציה הושלמה</h3>
        <p className="text-2xl text-slate-300 mb-10 leading-relaxed">
          איזה יופי. הקדשת זמן לעצמך ולשלווה הפנימית שלך.
        </p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={onComplete}
            className="bg-emerald-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-emerald-800 focus-visible:ring-4 focus-visible:ring-emerald-400"
          >
            חזרה לתפריט
          </button>
          <div className="flex justify-center">
            <ShareButton text={`הקדשתי זמן למדיטציית שלווה ב'רגע של שלווה'! ⭐ מרגיש/ה רגוע/ה וממוקד/ת.`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg" role="region" aria-label="Meditation Exercise">
      {!isActive ? (
        <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border-4 border-purple-500/30 w-full text-center">
          <h3 className="text-3xl font-bold text-purple-400 mb-8 underline decoration-purple-500/30">כמה זמן נרצה למדוט?</h3>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => startMeditation(30)}
              className="bg-purple-900/40 border-4 border-purple-400 text-purple-100 text-2xl font-bold py-6 rounded-2xl active:scale-95 transition-transform focus-visible:ring-4 focus-visible:ring-purple-400"
            >
              30 שניות של שקט
            </button>
            <button 
              onClick={() => startMeditation(60)}
              className="bg-purple-600 text-white text-2xl font-bold py-6 rounded-2xl shadow-lg active:scale-95 border-b-8 border-purple-800 focus-visible:ring-4 focus-visible:ring-purple-400"
            >
              דקה אחת של שלווה
            </button>
            <button 
              onClick={() => startMeditation(180)}
              className="bg-purple-800 text-white text-2xl font-bold py-6 rounded-2xl shadow-lg active:scale-95 border-b-8 border-purple-900 focus-visible:ring-4 focus-visible:ring-purple-400"
            >
              שלוש דקות של רוגע
            </button>
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
             <div className="absolute w-64 h-64 bg-purple-500/20 rounded-full animate-ping"></div>
             <div className="absolute w-48 h-48 bg-purple-500/30 rounded-full animate-pulse"></div>
             
             <div className="z-10 bg-slate-900 border-8 border-purple-500 w-48 h-48 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-5xl font-bold text-white tabular-nums">
                  {formatTime(timeLeft)}
                </span>
             </div>
          </div>

          <div className="text-center px-4" aria-live="polite">
            <p className="text-3xl font-bold text-purple-400 mb-4">פשוט להיות...</p>
            <p className="text-xl text-slate-400">הקשיבו להנחיות הקוליות</p>
          </div>

          <button 
            onClick={stopEarly}
            className="text-2xl text-purple-400 underline font-medium mt-4 active:scale-95"
          >
            הפסק מדיטציה
          </button>
        </div>
      )}
    </div>
  );
};

export default MeditationExercise;

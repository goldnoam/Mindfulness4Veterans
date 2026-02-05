
import React, { useState, useEffect, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import ShareButton from './ShareButton';
import MuteToggle from './MuteToggle';

interface Props {
  onComplete: () => void;
}

const prompts = [
  "מישהו אחד ששימח אתכם היום",
  "מאכל טעים שאכלתם לאחרונה",
  "משהו נחמד בבית שלכם שאתם אוהבים",
  "זיכרון נעים מהשבוע האחרון",
  "חבר או בן משפחה שאתם מעריכים",
  "יכולת אישית שיש לכם ואתם גאים בה",
  "משהו יפה שראיתם בטבע היום",
  "שיר שעושה לכם תמיד הרגשה טובה"
];

const GratitudeExercise: React.FC<Props> = ({ onComplete }) => {
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const timerRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    const text = prompts[randomIndex];
    setCurrentPrompt(text);
    ttsService.speak(`חישבו על ${text}`);
    startTimer();
  };

  const handleDone = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    ttsService.speak("איזה יופי, תודה על השיתוף.");
    statsService.addStar();
    onComplete();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      ttsService.stop();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="bg-slate-900 p-10 rounded-[50px] shadow-2xl border-4 border-amber-500/30 w-full max-w-lg text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-4 bg-amber-500/20"></div>
        {currentPrompt ? (
          <>
            <div className="flex items-center justify-between mb-6">
               <div className="bg-slate-800 px-4 py-2 rounded-xl text-2xl font-bold text-amber-400 tabular-nums border-2 border-amber-500/20">
                {formatTime(timeLeft)}
               </div>
               <MuteToggle />
            </div>
            <h3 className="text-4xl font-bold text-amber-400 mb-8 underline decoration-amber-500/40">תודה על...</h3>
            <p className="text-3xl font-medium text-slate-100 mb-12 min-h-[100px] leading-snug drop-shadow-md">
              {currentPrompt}
            </p>
            <div className="flex flex-col gap-4">
                <button 
                  onClick={handleDone}
                  className="bg-emerald-600 text-white text-2xl font-bold py-6 px-10 rounded-2xl shadow-lg active:scale-95 border-b-8 border-emerald-800"
                >
                  חשבתי על משהו!
                </button>
                <div className="flex justify-center">
                  <ShareButton text={`מצאתי סיבה להגיד תודה ב'רגע של שלווה': ${currentPrompt}. מומלץ לכולם! 🙏`} />
                </div>
                <button 
                  onClick={getRandomPrompt}
                  className="bg-amber-900/40 border-2 border-amber-500/30 text-amber-200 text-xl font-bold py-4 px-10 rounded-2xl active:scale-95"
                >
                  אחר
                </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-3xl text-slate-300 mb-12 leading-relaxed">לחצו על הכפתור כדי לקבל רעיון לדבר טוב שקרה לכם</p>
            <button 
              onClick={getRandomPrompt}
              className="bg-amber-600 text-white text-3xl font-bold py-8 px-12 rounded-full shadow-lg hover:bg-amber-500 transition-all active:scale-95 border-b-8 border-amber-800"
            >
              גלו רעיון
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GratitudeExercise;

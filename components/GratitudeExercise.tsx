
import React, { useState, useEffect, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import CelebrationOverlay from './CelebrationOverlay';
import MuteToggle from './MuteToggle';
import { Language, translations } from '../translations';

interface Props {
  onComplete: () => void;
}

const hePrompts = [
  "מישהו אחד ששימח אתכם היום",
  "מאכל טעים שאכלתם לאחרונה",
  "משהו נחמד בבית שלכם שאתם אוהבים",
  "זיכרון נעים מהשבוע האחרון",
  "חבר או בן משפחה שאתם מעריכים",
  "יכולת אישית שיש לכם ואתם גאים בה",
  "משהו יפה שראיתם בטבע היום",
  "שיר שעושה לכם תמיד הרגשה טובה"
];

const enPrompts = [
  "Someone who made you happy today",
  "A delicious meal you ate recently",
  "Something nice in your home you like",
  "A pleasant memory from the past week",
  "A friend or family member you appreciate",
  "A personal skill you are proud of",
  "Something beautiful you saw in nature today",
  "A song that always makes you feel good"
];

const GratitudeExercise: React.FC<Props> = ({ onComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedMins, setSelectedMins] = useState(2);
  const [timeLeft, setTimeLeft] = useState(120);
  const timerRef = useRef<number | null>(null);

  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang] || translations['he'];
  const activePrompts = lang === 'he' ? hePrompts : enPrompts;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startExercise = (mins: number) => {
    setSelectedMins(mins);
    setTimeLeft(mins * 60);
    setIsActive(true);
    getRandomPrompt();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * activePrompts.length);
    const text = activePrompts[randomIndex];
    setCurrentPrompt(text);
    ttsService.speak(lang === 'he' ? `חישבו על ${text}` : `Think about ${text}`);
  };

  const handleDone = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    statsService.addStar();
    statsService.addToHistory(t.gratitude.title, '🙏', selectedMins * 60);
    setIsFinished(true);
  };

  const restartExercise = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    ttsService.stop();
    startExercise(selectedMins);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      ttsService.stop();
    };
  }, []);

  if (isFinished) return <CelebrationOverlay onComplete={onComplete} />;

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {!isActive ? (
        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-amber-500/30 w-full max-w-lg text-center">
          <div className="text-7xl mb-6" aria-hidden="true">🙏</div>
          <h3 className="text-3xl font-bold text-white mb-8">{t.selectDuration}</h3>
          <div className="flex flex-col gap-4">
            {[1, 2, 5].map(m => (
              <button 
                key={m}
                onClick={() => startExercise(m)}
                className="bg-amber-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-amber-800"
              >
                {m} {t.min}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 p-10 rounded-[50px] shadow-2xl border-4 border-amber-500/30 w-full max-w-lg text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-4 bg-amber-500/20"></div>
          <div className="flex items-center justify-between mb-6">
             <div className="bg-slate-800 px-4 py-2 rounded-xl text-2xl font-bold text-amber-400 tabular-nums border-2 border-amber-500/20">
              {formatTime(timeLeft)}
             </div>
             <MuteToggle />
          </div>
          <h3 className="text-4xl font-bold text-amber-400 mb-8 underline decoration-amber-500/40">{lang === 'he' ? 'תודה על...' : 'Gratitude for...'}</h3>
          <p className="text-3xl font-medium text-slate-100 mb-12 min-h-[100px] leading-snug drop-shadow-md">
            {currentPrompt}
          </p>
          <div className="flex flex-col gap-4">
              <button 
                onClick={handleDone}
                className="bg-emerald-600 text-white text-3xl font-bold py-6 px-10 rounded-3xl shadow-lg active:scale-95 border-b-8 border-emerald-800"
              >
                {t.done}
              </button>
              <button 
                onClick={getRandomPrompt}
                className="bg-amber-900/40 border-2 border-amber-500/30 text-amber-200 text-xl font-bold py-4 px-10 rounded-2xl active:scale-95"
              >
                {lang === 'he' ? 'נושא אחר' : 'Next prompt'}
              </button>
              <button onClick={restartExercise} className="mt-4 bg-slate-800 border-4 border-amber-500/50 text-amber-400 px-10 py-4 rounded-3xl text-2xl font-bold shadow-xl active:scale-95 transition-all">
                 🔄 {t.restart}
               </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GratitudeExercise;

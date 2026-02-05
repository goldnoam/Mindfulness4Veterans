
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
  "הקשיבו לצלילים הרחוקים ביותר שאתם יכולים לשמוע... מחוץ לחדר.",
  "עכשיו, שימו לב לצלילים הקרובים אליכם... אולי זמזום של מכשיר חשמלי.",
  "נסו לשמוע את הצליל של הנשימה שלכם... רך ושקט.",
  "האם יש קצב לצלילים סביבכם? פשוט הקשיבו לזרימה שלהם.",
  "דמיינו שהצלילים הם גלים שעוברים דרככם מבלי להפריע."
];

const enPrompts = [
  "Listen to the most distant sounds you can hear... outside the room.",
  "Now, notice the sounds closest to you... perhaps a hum of an appliance.",
  "Try to hear the sound of your own breath... soft and quiet.",
  "Is there a rhythm to the sounds around you? Just listen to their flow.",
  "Imagine the sounds are waves passing through you without disturbance."
];

const SoundMeditationExercise: React.FC<Props> = ({ onComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [durationMins, setDurationMins] = useState(3);
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const currentIdxRef = useRef<number>(0);

  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang] || translations['he'];
  const activePrompts = lang === 'he' ? hePrompts : enPrompts;

  const startExercise = (mins: number) => {
    setDurationMins(mins);
    const totalSecs = mins * 60;
    setTimeLeft(totalSecs);
    setIsActive(true);
    currentIdxRef.current = -1; // Reset ref
    setCurrentPromptIdx(-1);

    const initialGreeting = lang === 'he' 
      ? "מדיטציית צליל. עצמו עיניים והתמקדו בשמיעה. בין ההנחיות יהיה זמן שקט להקשבה." 
      : "Sound meditation. Close your eyes and focus on your hearing. Between prompts, there will be silent time for listening.";
    
    setIsSpeaking(true);
    ttsService.speak(initialGreeting, () => setIsSpeaking(false));

    const intervalSecs = Math.floor(totalSecs / activePrompts.length);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }

        const elapsed = (mins * 60) - prev;
        const newIdx = Math.floor(elapsed / intervalSecs);

        // ONLY trigger if the index has changed and is within bounds
        if (newIdx < activePrompts.length && newIdx !== currentIdxRef.current) {
          currentIdxRef.current = newIdx;
          setCurrentPromptIdx(newIdx);
          setIsSpeaking(true);
          ttsService.speak(activePrompts[newIdx], () => {
            setIsSpeaking(false);
          });
        }

        return prev - 1;
      });
    }, 1000);
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    statsService.addStar();
    statsService.addToHistory(t.soundMed.title, '🎧', durationMins * 60);
    setIsFinished(true);
  };

  const restartExercise = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    ttsService.stop();
    startExercise(durationMins);
  };

  const stopEarly = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    ttsService.stop();
    setIsActive(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      ttsService.stop();
    };
  }, []);

  if (isFinished) return <CelebrationOverlay onComplete={onComplete} />;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg">
      {!isActive ? (
        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-violet-500/30 text-center w-full">
          <div className="text-7xl mb-6" aria-hidden="true">🎧</div>
          <h3 className="text-3xl font-bold text-white mb-8">{t.selectDuration}</h3>
          <div className="flex flex-col gap-4">
            {[2, 5, 10].map(m => (
              <button 
                key={m}
                onClick={() => startExercise(m)}
                className="bg-violet-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-violet-800"
              >
                {m} {t.min}
              </button>
            ))}
          </div>
          <p className="text-slate-500 mt-6 font-medium italic">
            {lang === 'he' ? 'מומלץ להפעיל צלילי רקע בהגדרות' : 'Tip: Try turning on ambient sounds in the settings'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 p-8 rounded-[48px] shadow-2xl border-4 border-violet-500/30 w-full text-center">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-slate-800 px-4 py-2 rounded-xl text-2xl font-bold text-violet-400 tabular-nums border-2 border-violet-500/20">
              {formatTime(timeLeft)}
            </div>
            <MuteToggle />
          </div>
          
          <div className="relative flex items-center justify-center h-48 mb-6">
             <div className="absolute w-40 h-40 bg-violet-500/20 rounded-full animate-ping"></div>
             <div className="absolute w-32 h-32 bg-violet-500/40 rounded-full animate-pulse"></div>
             <div className="text-8xl z-10">{isSpeaking ? '🗣️' : '👂'}</div>
          </div>

          <div className="h-32 flex flex-col items-center justify-center">
            {isSpeaking ? (
               <p className="text-3xl leading-relaxed text-slate-100 italic transition-all duration-500">
                "{currentPromptIdx >= 0 ? activePrompts[currentPromptIdx] : ''}"
               </p>
            ) : (
              <p className="text-4xl font-black text-violet-400 animate-pulse uppercase tracking-widest">
                {lang === 'he' ? 'פשוט להקשיב...' : 'Just listen...'}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <button onClick={restartExercise} className="bg-slate-800 border-4 border-violet-500/50 text-violet-400 px-10 py-4 rounded-3xl text-2xl font-bold shadow-xl active:scale-95 transition-all">
               🔄 {t.restart}
            </button>
            <button onClick={stopEarly} className="text-2xl text-violet-400 underline font-bold mt-4">
              {t.back}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundMeditationExercise;

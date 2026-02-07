
import React, { useState, useEffect, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import { ambientService, AmbientSoundMode } from '../services/ambientService';
import CelebrationOverlay from './CelebrationOverlay';
import MuteToggle from './MuteToggle';
import AmbientSelector from './AmbientSelector';
import MusicPlayer from './MusicPlayer';
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
  const [currentPromptIdx, setCurrentPromptIdx] = useState(-1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const currentIdxRef = useRef<number>(-1);

  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang] || translations['he'];
  const activePrompts = lang === 'he' ? hePrompts : enPrompts;

  const startExercise = (mins: number) => {
    setDurationMins(mins);
    const totalSecs = mins * 60;
    setTimeLeft(totalSecs);
    setIsActive(true);
    currentIdxRef.current = -1;
    setCurrentPromptIdx(-1);

    const initialGreeting = lang === 'he' 
      ? "מדיטציית צליל. אתם יכולים לבחור צלילי רקע מרגיעים כאן למטה. עצמו עיניים והתמקדו בשמיעה." 
      : "Sound meditation. You can choose relaxing ambient sounds below. Close your eyes and focus on your hearing.";
    
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
    ambientService.setMode('off');
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
    ambientService.setMode('off');
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
      ambientService.setMode('off');
    };
  }, []);

  if (isFinished) return <CelebrationOverlay onComplete={onComplete} />;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl px-4">
      {!isActive ? (
        <div className="bg-slate-900 p-10 rounded-[56px] shadow-2xl border-4 border-violet-500/30 text-center w-full">
          <div className="text-8xl mb-6" aria-hidden="true">🎧</div>
          <h3 className="text-4xl font-black text-white mb-8">{t.soundMed.title}</h3>
          
          <div className="flex flex-col gap-6 mb-10">
            <p className="text-2xl font-bold text-slate-300">{t.selectDuration}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              {[2, 5, 10].map(m => (
                <button 
                  key={m}
                  onClick={() => { setDurationMins(m); ttsService.speak(`${m} ${t.min}`); }}
                  className={`flex-1 min-w-[120px] text-2xl font-black py-5 rounded-3xl border-4 transition-all active:scale-95 ${durationMins === m ? 'bg-violet-600 border-violet-400 text-white shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  {m} {t.min}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => startExercise(durationMins)}
            className="w-full bg-violet-600 text-white text-4xl font-black py-8 rounded-[36px] shadow-2xl active:scale-95 border-b-[12px] border-violet-800 transition-all focus-visible:ring-violet-400"
          >
            {t.start}
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 p-8 rounded-[56px] shadow-2xl border-4 border-violet-500/30 w-full text-center flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-8">
            <div className="bg-slate-800 px-6 py-3 rounded-2xl text-3xl font-black text-violet-400 tabular-nums border-4 border-violet-500/20 shadow-lg">
              {formatTime(timeLeft)}
            </div>
            <MuteToggle />
          </div>
          
          <div className="relative flex items-center justify-center h-48 mb-10">
             <div className="absolute w-44 h-44 bg-violet-500/20 rounded-full animate-ping"></div>
             <div className="absolute w-36 h-36 bg-violet-500/40 rounded-full animate-pulse"></div>
             <div className="text-9xl z-10 transition-transform duration-500 scale-110" aria-hidden="true">
               {isSpeaking ? '🗣️' : '👂'}
             </div>
          </div>

          <div className="min-h-[140px] flex flex-col items-center justify-center px-4">
            {isSpeaking ? (
               <p className="text-3xl font-bold leading-relaxed text-slate-100 italic animate-in fade-in slide-in-from-bottom-2">
                "{currentPromptIdx >= 0 ? activePrompts[currentPromptIdx] : ''}"
               </p>
            ) : (
              <p className="text-4xl font-black text-violet-400 animate-pulse tracking-widest uppercase">
                {lang === 'he' ? 'פשוט להקשיב...' : 'Just listen...'}
              </p>
            )}
          </div>

          <div className="w-full border-t-4 border-violet-500/10 my-10 pt-10 space-y-8">
             <h4 className="text-2xl font-black text-violet-300 uppercase tracking-widest">{t.ambient}</h4>
             <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                <AmbientSelector />
                <div className="w-1 h-12 bg-slate-800 hidden md:block"></div>
                <MusicPlayer />
             </div>
          </div>

          <div className="flex flex-col gap-4 mt-8 w-full max-w-sm">
            <button 
              onClick={restartExercise} 
              className="bg-slate-800 border-4 border-violet-500/50 text-violet-400 px-10 py-5 rounded-3xl text-2xl font-black shadow-xl active:scale-95 transition-all focus-visible:ring-violet-400"
            >
               🔄 {t.restart}
            </button>
            <button 
              onClick={stopEarly} 
              className="text-2xl text-violet-400 underline font-black mt-4 hover:text-violet-300 transition-colors"
            >
              {t.back}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundMeditationExercise;


import React, { useState, useEffect, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import CelebrationOverlay from './CelebrationOverlay';
import MuteToggle from './MuteToggle';
import { Language, translations } from '../translations';
import AdBanner from './AdBanner';

interface Props {
  onComplete: () => void;
}

const heSteps = [
  { text: 'שימו לב ל-5 דברים שאתם יכולים לראות סביבכם כרגע', title: 'ראייה' },
  { text: 'שימו לב ל-4 דברים שאתם יכולים לגעת בהם', title: 'מגע' },
  { text: 'שימו לב ל-3 דברים שאתם שומעים סביבכם', title: 'שמיעה' },
  { text: 'שימו לב ל-2 ריחות שאתם יכולים להריח', title: 'ריח' },
  { text: 'שימו לב לטעם אחד שאתם מרגישים בפה', title: 'טעם' }
];

const enSteps = [
  { text: 'Notice 5 things you can see around you right now', title: 'Sight' },
  { text: 'Notice 4 things you can touch', title: 'Touch' },
  { text: 'Notice 3 things you can hear', title: 'Sound' },
  { text: 'Notice 2 things you can smell', title: 'Smell' },
  { text: 'Notice 1 taste you can sense in your mouth', title: 'Taste' }
];

const SensesExercise: React.FC<Props> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(-1);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(3);
  const [maxCycles, setMaxCycles] = useState(1);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [timeLeft, setTimeLeft] = useState(180); 
  const timerRef = useRef<number | null>(null);

  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang] || translations['he'];
  const activeSteps = lang === 'he' ? heSteps : enSteps;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextStep = () => {
    const nextIdx = stepIndex + 1;
    if (nextIdx < activeSteps.length) {
      setStepIndex(nextIdx);
      ttsService.speak(activeSteps[nextIdx].text);
    } else {
      if (currentCycle < maxCycles) {
        setCurrentCycle(prev => prev + 1);
        setStepIndex(0);
        ttsService.speak(activeSteps[0].text);
      } else {
        handleFinish();
      }
    }
  };

  const startExercise = (mins: number) => {
    setSelectedDuration(mins);
    setTimeLeft(mins * 60 * maxCycles);
    setStepIndex(0);
    setCurrentCycle(1);
    ttsService.speak(activeSteps[0].text);
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const restartExercise = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    ttsService.stop();
    startExercise(selectedDuration);
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    statsService.addStar();
    statsService.addToHistory(t.senses.title, '👂', selectedDuration * 60 * maxCycles);
    setIsFinished(true);
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
      {stepIndex === -1 ? (
        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-blue-500/30 w-full max-w-lg text-center">
          <div className="text-7xl mb-6" aria-hidden="true">👂</div>
          <h3 className="text-3xl font-bold text-white mb-8">{t.selectDuration}</h3>
          <div className="flex flex-col gap-4 mb-8">
            {[2, 3, 5].map(m => (
              <button 
                key={m}
                onClick={() => setSelectedDuration(m)}
                className={`text-2xl font-bold py-4 rounded-2xl border-4 transition-all ${selectedDuration === m ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
              >
                {m} {t.min}
              </button>
            ))}
          </div>

          <div className="mb-8">
            <p className="text-2xl font-bold text-slate-300 mb-4">{t.cycles}</p>
            <div className="flex gap-4 justify-center">
              {[1, 2, 3].map(c => (
                <button 
                  key={c}
                  onClick={() => { setMaxCycles(c); ttsService.speak(c.toString()); }}
                  className={`w-16 h-16 rounded-2xl border-4 text-2xl font-black transition-all ${maxCycles === c ? 'bg-blue-500 border-blue-300 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <AdBanner slot="exercise-setup-ad" />

          <button 
            onClick={() => startExercise(selectedDuration)}
            className="w-full bg-blue-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-blue-800 mt-4"
          >
            {t.start}
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 p-8 rounded-[48px] shadow-2xl border-4 border-blue-500/30 w-full max-w-lg text-center">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-slate-800 px-4 py-2 rounded-xl text-2xl font-bold text-blue-400 tabular-nums border-2 border-blue-500/20">
              {formatTime(timeLeft)}
            </div>
            <div className="bg-slate-800 px-4 py-2 rounded-xl text-2xl font-bold text-blue-400 border-2 border-blue-500/20">
              {currentCycle} / {maxCycles}
            </div>
            <MuteToggle />
          </div>
          <h3 className="text-4xl font-bold text-blue-400 mb-6 drop-shadow-md">{activeSteps[stepIndex].title}</h3>
          <p className="text-3xl leading-relaxed text-slate-200 mb-10 min-h-[120px]">
            {activeSteps[stepIndex].text}
          </p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={nextStep}
              className="w-full bg-blue-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-lg active:scale-95 border-b-8 border-blue-800"
            >
              {stepIndex < activeSteps.length - 1 ? t.next : currentCycle < maxCycles ? t.next : t.done}
            </button>
            <button 
              onClick={restartExercise}
              className="mt-4 bg-slate-800 border-4 border-blue-500/50 text-blue-400 px-10 py-4 rounded-3xl text-2xl font-bold shadow-xl active:scale-95 transition-all"
            >
              🔄 {t.restart}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensesExercise;


import React, { useState, useEffect, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import CelebrationOverlay from './CelebrationOverlay';
import MuteToggle from './MuteToggle';
import { Language, translations } from '../translations';

interface Props {
  onComplete: () => void;
}

const heBodyParts = [
  { name: 'כפות רגליים', prompt: 'שימו לב למגע של כפות הרגליים עם הרצפה. הרגישו את היציבות.' },
  { name: 'רגליים', prompt: 'העבירו את תשומת הלב לשוקיים ולירכיים. שחררו כל מתח שאתם מוצאים שם.' },
  { name: 'גב ובטן', prompt: 'הרגישו את הגב נתמך על ידי הכיסא, ואת הבטן עולה ויורדת עם הנשימה.' },
  { name: 'ידיים', prompt: 'שימו לב לכפות הידיים שלכם. האם הן חמות? קרות? פשוט שימו לב.' },
  { name: 'כתפיים וצוואר', prompt: 'תנו לכתפיים לצנוח מטה. שחררו את המתח שנאסף שם.' },
  { name: 'פנים וראש', prompt: 'הרפו את המצח, את הלסת ואת העיניים. כל הראש רגוע.' }
];

const enBodyParts = [
  { name: 'Feet', prompt: 'Notice the contact of your feet with the floor. Feel the stability.' },
  { name: 'Legs', prompt: 'Shift your attention to your calves and thighs. Release any tension you find there.' },
  { name: 'Back & Belly', prompt: 'Feel your back supported by the chair, and your belly rising and falling with your breath.' },
  { name: 'Hands', prompt: 'Notice your hands. Are they warm? Cold? Just observe.' },
  { name: 'Shoulders & Neck', prompt: 'Let your shoulders drop down. Release the tension stored there.' },
  { name: 'Face & Head', prompt: 'Relax your forehead, your jaw, and your eyes. Your whole head is calm.' }
];

const BodyScanExercise: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<'setup' | 'active'>('setup');
  const [isFinished, setIsFinished] = useState(false);
  const [durationMins, setDurationMins] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentPartIndex, setCurrentPartIndex] = useState(-1);
  const timerRef = useRef<number | null>(null);

  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang] || translations['he'];
  const activeParts = lang === 'he' ? heBodyParts : enBodyParts;

  const startExercise = (mins: number) => {
    setDurationMins(mins);
    const totalSeconds = mins * 60;
    setTimeLeft(totalSeconds);
    setStep('active');
    setCurrentPartIndex(-1);

    ttsService.speak(lang === 'he' ? "בואו נתחיל בסריקת גוף. שבו בנוח." : "Let's start the body scan. Sit comfortably.");

    const partInterval = Math.floor(totalSeconds / (activeParts.length + 1));

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }

        const elapsed = (mins * 60) - prev;
        const newPartIndex = Math.floor(elapsed / partInterval) - 1;

        if (newPartIndex >= 0 && newPartIndex < activeParts.length && newPartIndex !== currentPartIndex) {
          setCurrentPartIndex(newPartIndex);
          ttsService.speak(activeParts[newPartIndex].prompt);
        }

        return prev - 1;
      });
    }, 1000);
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    statsService.addStar();
    statsService.addToHistory(t.bodyScan.title, '👤', durationMins * 60);
    setIsFinished(true);
  };

  const stopEarly = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    ttsService.stop();
    setStep('setup');
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

  if (step === 'setup') {
    return (
      <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-indigo-500/30 w-full max-w-lg text-center">
        <div className="text-7xl mb-6" aria-hidden="true">👤</div>
        <h3 className="text-3xl font-bold text-white mb-8">{t.selectDuration}</h3>
        <div className="flex flex-col gap-4">
          {[2, 3, 5, 10].map(m => (
            <button 
              key={m}
              onClick={() => startExercise(m)}
              className="bg-indigo-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-indigo-800"
            >
              {m} {t.min}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg text-center">
      <div className="flex items-center justify-between w-full px-6">
          <div className="bg-slate-800 px-6 py-2 rounded-2xl border-2 border-indigo-500/30 text-3xl font-bold text-indigo-400 tabular-nums shadow-lg">
            {formatTime(timeLeft)}
          </div>
          <MuteToggle />
      </div>

      <div className="relative w-64 h-80 flex items-center justify-center">
        <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl blur-xl"></div>
        <div className="text-[200px] leading-none select-none drop-shadow-2xl">👤</div>
        <div 
          className="absolute left-0 right-0 h-4 bg-indigo-400 shadow-[0_0_20px_#818cf8] transition-all duration-1000 ease-in-out z-20"
          style={{ 
            top: `${(currentPartIndex + 1) * (100 / (activeParts.length + 1))}%`,
            display: currentPartIndex === -1 ? 'none' : 'block'
          }}
        ></div>
      </div>
      
      <div>
        <h3 className="text-3xl font-bold text-indigo-400 mb-2">
          {currentPartIndex === -1 ? (lang === 'he' ? 'מתכוננים...' : 'Preparing...') : activeParts[currentPartIndex].name}
        </h3>
      </div>

      <p className="text-2xl text-slate-300 font-medium px-4 h-24 flex items-center justify-center leading-tight">
        {currentPartIndex === -1 ? (lang === 'he' ? 'שימו לב לנשימה' : 'Observe your breath') : activeParts[currentPartIndex].prompt}
      </p>

      <button 
        onClick={stopEarly}
        className="text-2xl text-indigo-400 underline font-bold mt-4"
      >
        {t.back}
      </button>
    </div>
  );
};

export default BodyScanExercise;

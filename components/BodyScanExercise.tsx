
import React, { useState, useEffect, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import ShareButton from './ShareButton';
import MuteToggle from './MuteToggle';

interface Props {
  onComplete: () => void;
}

const bodyParts = [
  { name: 'כפות רגליים', prompt: 'שימו לב למגע של כפות הרגליים עם הרצפה. הרגישו את היציבות.' },
  { name: 'רגליים', prompt: 'העבירו את תשומת הלב לשוקיים ולירכיים. שחררו כל מתח שאתם מוצאים שם.' },
  { name: 'גב ובטן', prompt: 'הרגישו את הגב נתמך על ידי הכיסא, ואת הבטן עולה ויורדת עם הנשימה.' },
  { name: 'ידיים', prompt: 'שימו לב לכפות הידיים שלכם. האם הן חמות? קרות? פשוט שימו לב.' },
  { name: 'כתפיים וצוואר', prompt: 'תנו לכתפיים לצנוח מטה. שחררו את המתח שנאסף שם.' },
  { name: 'פנים וראש', prompt: 'הרפו את המצח, את הלסת ואת העיניים. כל הראש רגוע.' }
];

const BodyScanExercise: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<'setup' | 'active' | 'done'>('setup');
  const [durationMins, setDurationMins] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentPartIndex, setCurrentPartIndex] = useState(-1);
  const timerRef = useRef<number | null>(null);

  const startExercise = () => {
    const totalSeconds = durationMins * 60;
    setTimeLeft(totalSeconds);
    setStep('active');
    setCurrentPartIndex(-1);

    ttsService.speak("בואו נתחיל בסריקת גוף. שבו בנוח ועיצמו עיניים.");

    const partInterval = Math.floor(totalSeconds / (bodyParts.length + 1));

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }

        const totalSeconds = durationMins * 60;
        const elapsed = totalSeconds - prev;
        const newPartIndex = Math.floor(elapsed / partInterval) - 1;

        if (newPartIndex >= 0 && newPartIndex < bodyParts.length && newPartIndex !== currentPartIndex) {
          setCurrentPartIndex(newPartIndex);
          ttsService.speak(bodyParts[newPartIndex].prompt);
        }

        return prev - 1;
      });
    }, 1000);
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    ttsService.speak("סריקת הגוף הסתיימה. הרגישו את השלווה בכל הגוף.");
    statsService.addStar();
    setStep('done');
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

  if (step === 'done') {
    return (
      <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-indigo-500/30 w-full max-w-lg text-center">
        <div className="text-7xl mb-6">👤</div>
        <h3 className="text-4xl font-bold text-indigo-400 mb-6">הגוף רגוע ושלו</h3>
        <p className="text-2xl text-slate-300 mb-10 leading-relaxed">
          סיימת סריקת גוף מלאה. הגוף והנפש שלך מודים לך.
        </p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={onComplete}
            className="bg-indigo-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-indigo-800"
          >
            חזרה לתפריט
          </button>
          <div className="flex justify-center">
            <ShareButton text={`עברתי סריקת גוף משחררת ב'רגע של שלווה'! ⭐ מרגיש/ה הרבה פחות מתח.`} />
          </div>
        </div>
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border-4 border-indigo-500/30 w-full max-w-lg text-center">
        <div className="text-6xl mb-6">🧘‍♂️</div>
        <h3 className="text-3xl font-bold text-indigo-400 mb-6 underline decoration-indigo-500/20">סריקת גוף מרגיעה</h3>
        
        <p className="text-xl text-slate-300 mb-8 leading-relaxed">
          בתרגיל זה נעבור איבר איבר בגוף ונלמד לשחרר מתחים. 
        </p>

        <div className="mb-10">
          <p className="text-xl font-bold text-slate-200 mb-4">בחר משך זמן: {durationMins} דקות</p>
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={() => setDurationMins(Math.max(2, durationMins - 1))}
              className="bg-slate-800 border-2 border-slate-700 text-slate-100 w-16 h-16 rounded-full text-4xl font-bold flex items-center justify-center active:scale-90"
            >
              -
            </button>
            <div className="text-5xl font-bold text-indigo-400 px-4 w-16">{durationMins}</div>
            <button 
              onClick={() => setDurationMins(Math.min(10, durationMins + 1))}
              className="bg-slate-800 border-2 border-slate-700 text-slate-100 w-16 h-16 rounded-full text-4xl font-bold flex items-center justify-center active:scale-90"
            >
              +
            </button>
          </div>
        </div>

        <button 
          onClick={startExercise}
          className="w-full bg-indigo-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 transition-all border-b-8 border-indigo-800"
        >
          התחל סריקה
        </button>
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
            top: `${(currentPartIndex + 1) * (100 / (bodyParts.length + 1))}%`,
            display: currentPartIndex === -1 ? 'none' : 'block'
          }}
        ></div>
      </div>
      
      <div>
        <h3 className="text-3xl font-bold text-indigo-400 mb-2">
          {currentPartIndex === -1 ? 'מתכוננים...' : bodyParts[currentPartIndex].name}
        </h3>
      </div>

      <p className="text-2xl text-slate-300 font-medium px-4 h-24 flex items-center justify-center leading-tight">
        {currentPartIndex === -1 ? 'שימו לב לנשימה שלכם' : bodyParts[currentPartIndex].prompt}
      </p>

      <button 
        onClick={stopEarly}
        className="text-2xl text-indigo-400 underline font-bold mt-4"
      >
        הפסק תרגיל
      </button>
    </div>
  );
};

export default BodyScanExercise;

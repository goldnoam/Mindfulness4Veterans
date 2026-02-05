
import React, { useState, useEffect, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import ShareButton from './ShareButton';
import MuteToggle from './MuteToggle';

interface Props {
  onComplete: () => void;
}

const steps = [
  { text: 'שימו לב ל-5 דברים שאתם יכולים לראות סביבכם כרגע', title: 'ראייה' },
  { text: 'שימו לב ל-4 דברים שאתם יכולים לגעת בהם', title: 'מגע' },
  { text: 'שימו לב ל-3 דברים שאתם שומעים סביבכם', title: 'שמיעה' },
  { text: 'שימו לב ל-2 ריחות שאתם יכולים להריח', title: 'ריח' },
  { text: 'שימו לב לטעם אחד שאתם מרגישים בפה', title: 'טעם' },
  { text: 'כל הכבוד. אתם מחוברים לרגע הזה. הרווחתם כוכב!', title: 'סיום' }
];

const SensesExercise: React.FC<Props> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes total
  const timerRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextStep = () => {
    const nextIdx = stepIndex + 1;
    if (nextIdx < steps.length) {
      setStepIndex(nextIdx);
      ttsService.speak(steps[nextIdx].text);
      if (nextIdx === 0) {
        timerRef.current = window.setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      if (nextIdx === steps.length - 1) {
        if (timerRef.current) clearInterval(timerRef.current);
        statsService.addStar();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      ttsService.stop();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {stepIndex === -1 ? (
        <button 
          onClick={nextStep}
          className="bg-blue-600 text-white text-3xl font-bold py-8 px-12 rounded-[40px] shadow-xl hover:bg-blue-500 transition-colors active:scale-95 border-b-8 border-blue-800"
        >
          בואו נתחיל להתחבר לחושים
        </button>
      ) : (
        <div className="bg-slate-900 p-8 rounded-[48px] shadow-2xl border-4 border-blue-500/30 w-full max-w-lg text-center">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-slate-800 px-4 py-2 rounded-xl text-2xl font-bold text-blue-400 tabular-nums border-2 border-blue-500/20">
              {formatTime(timeLeft)}
            </div>
            <MuteToggle />
          </div>
          <h3 className="text-4xl font-bold text-blue-400 mb-6 drop-shadow-md">{steps[stepIndex].title}</h3>
          <p className="text-3xl leading-relaxed text-slate-200 mb-10 min-h-[120px]">
            {steps[stepIndex].text}
          </p>
          {stepIndex < steps.length - 1 ? (
            <button 
              onClick={nextStep}
              className="w-full bg-blue-600 text-white text-2xl font-bold py-6 rounded-2xl shadow-lg active:scale-95 border-b-8 border-blue-800"
            >
              המשך לשלב הבא
            </button>
          ) : (
            <div className="flex flex-col gap-4">
              <button 
                onClick={onComplete}
                className="w-full bg-emerald-600 text-white text-2xl font-bold py-6 rounded-2xl shadow-lg active:scale-95 border-b-8 border-emerald-800"
              >
                חזרה לתפריט
              </button>
              <div className="flex justify-center">
                <ShareButton text="התחברתי לכאן ולעכשיו דרך חמשת החושים באפליקציית 'רגע של שלווה'! ⭐" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SensesExercise;

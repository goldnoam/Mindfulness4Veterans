
import React, { useState, useEffect, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import CelebrationOverlay from './CelebrationOverlay';
import MuteToggle from './MuteToggle';
import { Language, translations } from '../translations';

interface Props {
  onComplete: () => void;
}

const heSteps = [
  { title: 'הכנה', text: 'קחו פיסת אוכל קטנה (צימוק, אגוז או פרי) והחזיקו אותה בכף היד.', icon: '🍇' },
  { title: 'הסתכלות', text: 'התבוננו באוכל כאילו זו הפעם הראשונה שאתם רואים אותו. שימו לב לצבע, לצורה ולמרקם.', icon: '👀' },
  { title: 'מגע', text: 'הרגישו את המרקם בין האצבעות. האם הוא חלק? מחוספס? רך?', icon: '🖐️' },
  { title: 'ריח', text: 'קרבו את האוכל לאף ונשמו את הניחוח שלו עמוק.', icon: '👃' },
  { title: 'מגע בלשון', text: 'הניחו את האוכל על הלשון מבלי ללעוס. הרגישו את התחושה בפה.', icon: '👅' },
  { title: 'לעיסה', text: 'התחילו ללעוס לאט מאוד. שימו לב לטעם המשתנה ולמרקם המתפרק.', icon: '🦷' },
  { title: 'בליעה', text: 'שימו לב לתחושת הבליעה ולטעם שנשאר בפה.', icon: '✨' }
];

const enSteps = [
  { title: 'Prepare', text: 'Take a small piece of food (a raisin, nut, or fruit) and hold it in your hand.', icon: '🍇' },
  { title: 'Observation', text: 'Look at the food as if for the first time. Notice its color, shape, and texture.', icon: '👀' },
  { title: 'Touch', text: 'Feel the texture between your fingers. Is it smooth? Rough? Soft?', icon: '🖐️' },
  { title: 'Smell', text: 'Bring the food to your nose and breathe in its aroma deeply.', icon: '👃' },
  { title: 'Taste', text: 'Place the food on your tongue without chewing. Feel it in your mouth.', icon: '👅' },
  { title: 'Chew', text: 'Start chewing very slowly. Notice the changing taste and texture.', icon: '🦷' },
  { title: 'Swallow', text: 'Observe the sensation of swallowing and the remaining aftertaste.', icon: '✨' }
];

const MindfulEatingExercise: React.FC<Props> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(-1);
  const [isFinished, setIsFinished] = useState(false);
  const [durationMins, setDurationMins] = useState(5);
  const [timeLeft, setTimeLeft] = useState(300);
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
      handleFinish();
    }
  };

  const startExercise = (mins: number) => {
    setDurationMins(mins);
    setTimeLeft(mins * 60);
    setStepIndex(0);
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
    startExercise(durationMins);
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    statsService.addStar();
    statsService.addToHistory(t.eating.title, '🍎', durationMins * 60);
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
    <div className="flex flex-col items-center gap-8 w-full max-w-lg">
      {stepIndex === -1 ? (
        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-orange-500/30 text-center">
          <div className="text-7xl mb-6" aria-hidden="true">🍎</div>
          <h3 className="text-3xl font-bold text-white mb-8">{t.selectDuration}</h3>
          <div className="flex flex-col gap-4">
            {[3, 5, 10].map(m => (
              <button 
                key={m}
                onClick={() => startExercise(m)}
                className="bg-orange-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-orange-800"
              >
                {m} {t.min}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 p-8 rounded-[48px] shadow-2xl border-4 border-orange-500/30 w-full text-center relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-slate-800 px-4 py-2 rounded-xl text-2xl font-bold text-orange-400 tabular-nums border-2 border-orange-500/20">
              {formatTime(timeLeft)}
            </div>
            <MuteToggle />
          </div>
          <div className="absolute top-0 left-0 w-full h-2 bg-orange-500/20">
            <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${((stepIndex + 1) / activeSteps.length) * 100}%` }}></div>
          </div>
          <div className="text-[120px] mb-6 mt-4">{activeSteps[stepIndex].icon}</div>
          <h3 className="text-4xl font-bold text-orange-400 mb-6">{activeSteps[stepIndex].title}</h3>
          <p className="text-3xl leading-relaxed text-slate-100 mb-10 min-h-[140px] flex items-center justify-center">
            {activeSteps[stepIndex].text}
          </p>
          <div className="flex flex-col gap-4">
            <button onClick={nextStep} className="w-full bg-orange-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-lg active:scale-95 border-b-8 border-orange-800">
              {stepIndex === activeSteps.length - 1 ? t.done : t.next}
            </button>
            <button 
              onClick={restartExercise}
              className="mt-4 bg-slate-800 border-4 border-orange-500/50 text-orange-400 px-10 py-4 rounded-3xl text-2xl font-bold shadow-xl active:scale-95 transition-all"
            >
              🔄 {t.restart}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindfulEatingExercise;

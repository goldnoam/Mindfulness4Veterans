
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
  { title: 'גלגול כתפיים', text: 'גלגלו את הכתפיים לאט לאחור. נשמו פנימה כשהן עולות, והחוצה כשהן יורדות.', icon: '🔄' },
  { title: 'מתיחת צוואר', text: 'הטו את הראש בעדינות מצד לצד. הרגישו את השחרור בצוואר.', icon: '💆' },
  { title: 'פתיחת ידיים', text: 'פרסו את הידיים לצדדים כמו כנפיים. נשמו עמוק והרגישו את בית החזה נפתח.', icon: '👐' },
  { title: 'מתיחה מעלה', text: 'הרימו את הידיים לאט לכיוון התקרה. דמיינו שאתם קוטפים עננים.', icon: '☁️' },
  { title: 'חיבוק עצמי', text: 'חבקו את עצמכם חזק. נשפו החוצה ושחררו את כל הגוף.', icon: '🫂' }
];

const enSteps = [
  { title: 'Shoulder Rolls', text: 'Roll your shoulders slowly back. Inhale as they go up, exhale as they drop.', icon: '🔄' },
  { title: 'Neck Stretch', text: 'Gently tilt your head from side to side. Feel the release in your neck.', icon: '💆' },
  { title: 'Arm Openers', text: 'Spread your arms wide like wings. Breathe deeply and feel your chest open.', icon: '👐' },
  { title: 'Reach Up', text: 'Slowly lift your hands toward the ceiling. Imagine you are reaching for the clouds.', icon: '☁️' },
  { title: 'Self Hug', text: 'Give yourself a warm hug. Exhale and relax your entire body.', icon: '🫂' }
];

const MindfulMovementExercise: React.FC<Props> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(-1);
  const [isFinished, setIsFinished] = useState(false);
  const [durationMins, setDurationMins] = useState(3);
  const [timeLeft, setTimeLeft] = useState(180);
  const timerRef = useRef<number | null>(null);

  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang] || translations['he'];
  const activeSteps = lang === 'he' ? heSteps : enSteps;

  const startExercise = (mins: number) => {
    setDurationMins(mins);
    setTimeLeft(mins * 60);
    setStepIndex(0);
    ttsService.speak(activeSteps[0].text);
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    statsService.addStar();
    statsService.addToHistory(t.movement.title, '🙆‍♂️', durationMins * 60);
    setIsFinished(true);
  };

  const restartExercise = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    ttsService.stop();
    startExercise(durationMins);
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
      {stepIndex === -1 ? (
        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-teal-500/30 text-center w-full">
          <div className="text-7xl mb-6" aria-hidden="true">🙆‍♂️</div>
          <h3 className="text-3xl font-bold text-white mb-8">{t.selectDuration}</h3>
          <div className="flex flex-col gap-4">
            {[2, 3, 5].map(m => (
              <button 
                key={m}
                onClick={() => startExercise(m)}
                className="bg-teal-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-teal-800"
              >
                {m} {t.min}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 p-8 rounded-[48px] shadow-2xl border-4 border-teal-500/30 w-full text-center">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-slate-800 px-4 py-2 rounded-xl text-2xl font-bold text-teal-400 tabular-nums border-2 border-teal-500/20">
              {formatTime(timeLeft)}
            </div>
            <MuteToggle />
          </div>
          <div className="text-[120px] mb-6 animate-pulse">{activeSteps[stepIndex].icon}</div>
          <h3 className="text-4xl font-bold text-teal-400 mb-6">{activeSteps[stepIndex].title}</h3>
          <p className="text-3xl leading-relaxed text-slate-100 mb-10 min-h-[140px] flex items-center justify-center">
            {activeSteps[stepIndex].text}
          </p>
          <div className="flex flex-col gap-4">
            <button onClick={nextStep} className="w-full bg-teal-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-lg active:scale-95 border-b-8 border-teal-800">
              {stepIndex === activeSteps.length - 1 ? t.done : t.next}
            </button>
            <button onClick={restartExercise} className="mt-4 bg-slate-800 border-4 border-teal-500/50 text-teal-400 px-10 py-4 rounded-3xl text-2xl font-bold shadow-xl active:scale-95 transition-all">
               🔄 {t.restart}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindfulMovementExercise;

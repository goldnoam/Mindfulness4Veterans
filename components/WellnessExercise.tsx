
import React, { useState, useEffect, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import CelebrationOverlay from './CelebrationOverlay';
import MuteToggle from './MuteToggle';
import { Language, translations } from '../translations';

interface Props {
  onComplete: () => void;
}

const heWellnessSteps = [
  { title: 'בדיקת מים', text: 'האם שתיתם מספיק מים היום? קחו לגימה קטנה אם אתם צריכים.', icon: '💧' },
  { title: 'יציבה', text: 'שימו לב לגב שלכם. הזדקפו מעט, הרפו את הכתפיים וחייכו.', icon: '🪑' },
  { title: 'מחשבה טובה', text: 'חשבו על דבר אחד טוב שקרה לכם היום, אפילו משהו קטן מאוד.', icon: '🌟' },
  { title: 'תנועה קלה', text: 'הניעו את אצבעות הידיים והרגליים. הרגישו את החיות בגוף.', icon: '🦶' },
  { title: 'כוונה', text: 'מהו הדבר הקטן שתרצו לעשות למען עצמכם בשעה הקרובה?', icon: '🌱' }
];

const enWellnessSteps = [
  { title: 'Hydration Check', text: 'Have you had enough water today? Take a small sip if you need to.', icon: '💧' },
  { title: 'Posture', text: 'Notice your back. Sit up a bit straighter, relax your shoulders, and smile.', icon: '🪑' },
  { title: 'Positive Thought', text: 'Think of one good thing that happened today, even something very small.', icon: '🌟' },
  { title: 'Gentle Movement', text: 'Wiggle your fingers and toes. Feel the life in your body.', icon: '🦶' },
  { title: 'Intention', text: 'What is one small thing you would like to do for yourself in the next hour?', icon: '🌱' }
];

const WellnessExercise: React.FC<Props> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(-1);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<number | null>(null);

  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang] || translations['he'];
  const activeSteps = lang === 'he' ? heWellnessSteps : enWellnessSteps;

  const startExercise = () => {
    setStepIndex(0);
    ttsService.speak(activeSteps[0].text);
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
    statsService.addStar();
    statsService.addToHistory(t.wellness.title, '🌿', 60);
    setIsFinished(true);
  };

  const stopEarly = () => {
    ttsService.stop();
    setStepIndex(-1);
  };

  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  if (isFinished) return <CelebrationOverlay onComplete={onComplete} />;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg">
      {stepIndex === -1 ? (
        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-emerald-500/30 text-center w-full">
          <div className="text-7xl mb-6" aria-hidden="true">🌿</div>
          <h3 className="text-4xl font-bold text-white mb-6">{t.wellness.title}</h3>
          <p className="text-2xl text-slate-300 mb-10 leading-relaxed">
            {lang === 'he' ? 'בואו נעשה בדיקה קלה של שלומכם ושל תחושת הרווחה שלכם.' : 'Let’s do a quick check of your well-being and comfort.'}
          </p>
          <button 
            onClick={startExercise}
            className="w-full bg-emerald-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-emerald-800 transition-all"
          >
            {t.start}
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 p-8 rounded-[48px] shadow-2xl border-4 border-emerald-500/30 w-full text-center">
          <div className="flex justify-end mb-4">
            <MuteToggle />
          </div>
          
          <div className="text-[100px] mb-6 animate-pulse">{activeSteps[stepIndex].icon}</div>
          <h3 className="text-4xl font-bold text-emerald-400 mb-6">{activeSteps[stepIndex].title}</h3>
          <p className="text-3xl leading-relaxed text-slate-100 mb-12 min-h-[140px] flex items-center justify-center">
            {activeSteps[stepIndex].text}
          </p>
          
          <div className="flex flex-col gap-4">
            <button onClick={nextStep} className="w-full bg-emerald-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-lg active:scale-95 border-b-8 border-emerald-800">
              {stepIndex === activeSteps.length - 1 ? t.done : t.next}
            </button>
            <button 
              onClick={stopEarly}
              className="text-2xl text-emerald-400 underline font-bold mt-4"
            >
              {t.back}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessExercise;


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
  { title: 'עמידה יציבה', text: 'עימדו במקום נוח עם מרחב הליכה קטן לפניכם. הרגישו את כפות הרגליים יציבות על הקרקע.', icon: '🧍' },
  { title: 'נשימה מודעת', text: 'קחו נשימה עמוקה. שימו לב איך הגוף מרגיש כשהוא נינוח ויציב.', icon: '🌬️' },
  { title: 'צעד ראשון', text: 'התחילו ללכת לאט מאוד. שימו לב איך העקב נוגע ברצפה קודם, ואז כף הרגל כולה.', icon: '👣' },
  { title: 'תנועת הגוף', text: 'שימו לב לממשקל שעובר מרגל לרגל. הרגישו את התנועה של הברכיים והירכיים.', icon: '🚶' },
  { title: 'קצב איטי', text: 'המשיכו ללכת בקצב שמאפשר לכם להרגיש כל תנועה קטנה. הכל בשלווה.', icon: '🐌' },
  { title: 'חיבור לנשימה', text: 'נסו לסנכרן את הצעדים עם הנשימה. צעד אחד בשאיפה, צעד אחד בנשיפה.', icon: '🧘' }
];

const enSteps = [
  { title: 'Stable Stance', text: 'Stand in a comfortable place with a small space in front of you. Feel your feet firm on the ground.', icon: '🧍' },
  { title: 'Mindful Breath', text: 'Take a deep breath. Notice how your body feels when it is relaxed and stable.', icon: '🌬️' },
  { title: 'First Step', text: 'Start walking very slowly. Notice how the heel touches the floor first, then the whole foot.', icon: '👣' },
  { title: 'Body Movement', text: 'Observe the weight shifting from leg to leg. Feel the movement of knees and thighs.', icon: '🚶' },
  { title: 'Slow Pace', text: 'Continue walking at a pace that allows you to feel every small movement.', icon: '🐌' },
  { title: 'Breath Connection', text: 'Try to sync your steps with your breath. One step for inhale, one for exhale.', icon: '🧘' }
];

const WalkingMeditationExercise: React.FC<Props> = ({ onComplete }) => {
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
    statsService.addToHistory(t.walking.title, '🚶', durationMins * 60);
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
        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-lime-500/30 text-center">
          <div className="text-7xl mb-6" aria-hidden="true">🚶‍♂️</div>
          <h3 className="text-3xl font-bold text-white mb-8">{t.selectDuration}</h3>
          <div className="flex flex-col gap-4">
            {[3, 5, 10].map(m => (
              <button 
                key={m}
                onClick={() => startExercise(m)}
                className="bg-lime-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-lime-800"
              >
                {m} {t.min}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 p-8 rounded-[48px] shadow-2xl border-4 border-lime-500/30 w-full text-center relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-slate-800 px-4 py-2 rounded-xl text-2xl font-bold text-lime-400 tabular-nums border-2 border-lime-500/20">
              {formatTime(timeLeft)}
            </div>
            <MuteToggle />
          </div>
          <div className="absolute top-0 left-0 w-full h-2 bg-lime-500/20">
            <div className="h-full bg-lime-500 transition-all duration-500" style={{ width: `${((stepIndex + 1) / activeSteps.length) * 100}%` }}></div>
          </div>
          
          <div className="text-[120px] mb-6 mt-4 animate-bounce">{activeSteps[stepIndex].icon}</div>
          <h3 className="text-4xl font-bold text-lime-400 mb-6">{activeSteps[stepIndex].title}</h3>
          <p className="text-3xl leading-relaxed text-white mb-10 min-h-[140px] flex items-center justify-center">
            {activeSteps[stepIndex].text}
          </p>
          
          <div className="flex flex-col gap-4">
            <button onClick={nextStep} className="w-full bg-lime-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-lg active:scale-95 border-b-8 border-lime-800">
              {stepIndex === activeSteps.length - 1 ? t.done : t.next}
            </button>
            <button 
              onClick={restartExercise}
              className="mt-4 bg-slate-800 border-4 border-lime-500/50 text-lime-400 px-10 py-4 rounded-3xl text-2xl font-bold shadow-xl active:scale-95 transition-all"
            >
              🔄 {t.restart}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalkingMeditationExercise;

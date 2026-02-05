
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
  { title: 'בחירת אובייקט', text: 'בחרו חפץ פשוט שנמצא לידכם כרגע. זה יכול להיות כוס, פרח או אפילו היד שלכם.', icon: '🔍' },
  { title: 'מבט ראשון', text: 'התבוננו בצבעים של החפץ. שימו לב לגוונים השונים, הבהירים והכהים.', icon: '🎨' },
  { title: 'מרקם', text: 'הסתכלו על המרקם. האם הוא נראה חלק? מחוספס? מבריק?', icon: '🧱' },
  { title: 'אור וצל', text: 'שימו לב איך האור פוגע בחפץ. איפה נמצאים הצללים שלו?', icon: '💡' },
  { title: 'פרטים קטנים', text: 'חפשו פרט אחד קטן שבדרך כלל לא הייתם שמים לב אליו.', icon: '🔎' },
  { title: 'הערכה', text: 'העריכו את היופי שנמצא בחפץ הפשוט הזה כפי שהוא.', icon: '✨' }
];

const enSteps = [
  { title: 'Choose Object', text: 'Choose a simple object near you right now. It could be a cup, a flower, or even your hand.', icon: '🔍' },
  { title: 'Colors', text: 'Observe the colors of the object. Notice the different shades, light and dark.', icon: '🎨' },
  { title: 'Texture', text: 'Look at the texture. Does it look smooth? Rough? Shiny?', icon: '🧱' },
  { title: 'Light & Shadow', text: 'Notice how the light hits the object. Where are its shadows?', icon: '💡' },
  { title: 'Small Details', text: "Look for one tiny detail you wouldn't usually notice.", icon: '🔎' },
  { title: 'Appreciation', text: 'Appreciate the beauty in this simple object just as it is.', icon: '✨' }
];

const MindfulPhotosExercise: React.FC<Props> = ({ onComplete }) => {
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
    statsService.addToHistory(t.photos.title, '📸', durationMins * 60);
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
        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-slate-500/30 text-center w-full">
          <div className="text-7xl mb-6" aria-hidden="true">📸</div>
          <h3 className="text-3xl font-bold text-white mb-8">{t.selectDuration}</h3>
          <div className="flex flex-col gap-4">
            {[2, 3, 5].map(m => (
              <button 
                key={m}
                onClick={() => startExercise(m)}
                className="bg-slate-700 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-slate-800"
              >
                {m} {t.min}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 p-8 rounded-[48px] shadow-2xl border-4 border-slate-500/30 w-full text-center">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-slate-800 px-4 py-2 rounded-xl text-2xl font-bold text-slate-400 tabular-nums border-2 border-slate-500/20">
              {formatTime(timeLeft)}
            </div>
            <MuteToggle />
          </div>

          <div className="relative h-64 w-full flex items-center justify-center mb-6">
             {/* Viewfinder Corners */}
             <div className="absolute inset-0 p-4 border-4 border-transparent pointer-events-none">
                <div className="viewfinder-corner top-0 left-0 border-t-8 border-l-8 rounded-tl-lg"></div>
                <div className="viewfinder-corner top-0 right-0 border-t-8 border-r-8 rounded-tr-lg"></div>
                <div className="viewfinder-corner bottom-0 left-0 border-b-8 border-l-8 rounded-bl-lg"></div>
                <div className="viewfinder-corner bottom-0 right-0 border-b-8 border-r-8 rounded-br-lg"></div>
             </div>
             
             {/* Animated Icon */}
             <div key={stepIndex} className="text-[120px] animate-shutter">
               {activeSteps[stepIndex].icon}
             </div>
          </div>

          <h3 className="text-4xl font-bold text-slate-300 mb-6">{activeSteps[stepIndex].title}</h3>
          <p className="text-3xl leading-relaxed text-slate-100 mb-10 min-h-[140px] flex items-center justify-center">
            {activeSteps[stepIndex].text}
          </p>
          <div className="flex flex-col gap-4">
            <button onClick={nextStep} className="w-full bg-slate-700 text-white text-3xl font-bold py-6 rounded-3xl shadow-lg active:scale-95 border-b-8 border-slate-800">
              {stepIndex === activeSteps.length - 1 ? t.done : t.next}
            </button>
            <button onClick={restartExercise} className="mt-4 bg-slate-800 border-4 border-slate-500/50 text-slate-400 px-10 py-4 rounded-3xl text-2xl font-bold shadow-xl active:scale-95 transition-all">
               🔄 {t.restart}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindfulPhotosExercise;

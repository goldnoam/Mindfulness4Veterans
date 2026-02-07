
import React, { useState, useEffect } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import CelebrationOverlay from './CelebrationOverlay';
import MuteToggle from './MuteToggle';
import { Language, translations } from '../translations';

interface Props {
  onComplete: () => void;
}

const heIntents = [
  { title: "נשימת בוקר", text: "קחו נשימה עמוקה פנימה, ודמיינו שאתם ממלאים את הגוף באנרגיה חדשה.", icon: "☀️" },
  { title: "מתיחה קלה", text: "מתחו את הידיים לצדדים ולמעלה. הרגישו את הגוף מתעורר בנחת.", icon: "🙆‍♂️" },
  { title: "כוונה יומית", text: "חשבו על מילה אחת שתלווה אתכם היום: שלווה, שמחה, סבלנות או ריכוז.", icon: "🎯" },
  { title: "הכרת תודה", text: "מהו הדבר הראשון שאתם מודים עליו הבוקר?", icon: "🙏" },
  { title: "חיוך לעצמי", text: "חייכו לעצמכם במראה או בדמיון. אתם מוכנים ליום נפלא.", icon: "😊" }
];

const enIntents = [
  { title: "Morning Breath", text: "Take a deep breath in, and imagine filling your body with fresh energy.", icon: "☀️" },
  { title: "Gentle Stretch", text: "Stretch your arms out and up. Feel your body waking up gently.", icon: "🙆‍♂️" },
  { title: "Daily Focus", text: "Think of one word to guide you today: Peace, Joy, Patience, or Focus.", icon: "🎯" },
  { title: "Gratitude", text: "What is the first thing you are grateful for this morning?", icon: "🙏" },
  { title: "Self-Smile", text: "Smile at yourself in the mirror or in your mind. You are ready for a wonderful day.", icon: "😊" }
];

const MorningExercise: React.FC<Props> = ({ onComplete }) => {
  const [stepIdx, setStepIdx] = useState(-1);
  const [isFinished, setIsFinished] = useState(false);
  
  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang] || translations['he'];
  const activeSteps = lang === 'he' ? heIntents : enIntents;

  const startExercise = () => {
    setStepIdx(0);
    ttsService.speak(activeSteps[0].text);
  };

  const nextStep = () => {
    if (stepIdx < activeSteps.length - 1) {
      setStepIdx(prev => prev + 1);
      ttsService.speak(activeSteps[stepIdx + 1].text);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    statsService.addStar();
    statsService.addToHistory(t.morning.title, '☀️', 90);
    setIsFinished(true);
  };

  if (isFinished) return <CelebrationOverlay onComplete={onComplete} />;

  if (stepIdx === -1) {
    return (
      <div className="bg-slate-900 p-10 rounded-[56px] shadow-2xl border-4 border-amber-400/30 w-full max-w-lg text-center">
        <div className="text-8xl mb-6" aria-hidden="true">☀️</div>
        <h3 className="text-4xl font-black text-white mb-6">{t.morning.title}</h3>
        <p className="text-2xl text-slate-300 mb-10 leading-relaxed">
          {lang === 'he' ? 'פתיחת היום בשלווה ובמיקוד. כוונה אחת קטנה יכולה לשנות יום שלם.' : 'Starting the day with peace and focus. One small intention can change a whole day.'}
        </p>
        <button onClick={startExercise} className="w-full bg-amber-500 text-slate-900 text-4xl font-black py-8 rounded-[36px] shadow-xl border-b-[12px] border-amber-700 active:scale-95 transition-all focus-visible:ring-amber-400">
          {t.start}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg text-center px-4">
      <div className="flex justify-end w-full">
         <MuteToggle />
      </div>

      <div className="bg-slate-900 p-8 rounded-[56px] shadow-2xl border-4 border-amber-400/30 w-full flex flex-col items-center">
        <div className="text-[120px] mb-8 animate-pulse drop-shadow-lg" aria-hidden="true">
          {activeSteps[stepIdx].icon}
        </div>
        
        <h3 className="text-4xl font-black text-amber-400 mb-6">{activeSteps[stepIdx].title}</h3>
        
        <div className="min-h-[160px] flex items-center justify-center">
           <p className="text-3xl font-bold text-slate-100 leading-snug">
             {activeSteps[stepIdx].text}
           </p>
        </div>

        <button 
          onClick={nextStep}
          className="w-full mt-10 bg-amber-500 text-slate-900 text-4xl font-black py-8 rounded-[40px] shadow-xl border-b-[12px] border-amber-700 active:scale-95 transition-all focus-visible:ring-amber-400"
        >
          {stepIdx === activeSteps.length - 1 ? t.done : t.next}
        </button>
      </div>

      <button 
        onClick={() => setStepIdx(-1)}
        className="text-2xl text-amber-400 underline font-black hover:text-amber-300 transition-colors"
      >
        {t.back}
      </button>
    </div>
  );
};

export default MorningExercise;

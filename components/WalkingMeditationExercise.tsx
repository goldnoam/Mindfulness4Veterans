
import React, { useState, useEffect } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import ShareButton from './ShareButton';

interface Props {
  onComplete: () => void;
}

const steps = [
  { 
    title: 'עמידה יציבה', 
    text: 'עימדו במקום נוח עם מרחב הליכה קטן לפניכם. הרגישו את כפות הרגליים יציבות על הקרקע.', 
    icon: '🧍' 
  },
  { 
    title: 'נשימה מודעת', 
    text: 'קחו נשימה עמוקה. שימו לב איך הגוף מרגיש כשהוא נינוח ויציב.', 
    icon: '🌬️' 
  },
  { 
    title: 'צעד ראשון', 
    text: 'התחילו ללכת לאט מאוד. שימו לב איך העקב נוגע ברצפה קודם, ואז כף הרגל כולה.', 
    icon: '👣' 
  },
  { 
    title: 'תנועת הגוף', 
    text: 'שימו לב למשקל שעובר מרגל לרגל. הרגישו את התנועה של הברכיים והירכיים.', 
    icon: '🚶' 
  },
  { 
    title: 'קצב איטי', 
    text: 'המשיכו ללכת בקצב שמאפשר לכם להרגיש כל תנועה קטנה. הכל בשלווה.', 
    icon: '🐌' 
  },
  { 
    title: 'חיבור לנשימה', 
    text: 'נסו לסנכרן את הצעדים עם הנשימה. צעד אחד בשאיפה, צעד אחד בנשיפה.', 
    icon: '🧘' 
  }
];

const WalkingMeditationExercise: React.FC<Props> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(-1);
  const [isDone, setIsDone] = useState(false);

  const startExercise = () => {
    setStepIndex(0);
    ttsService.speak(steps[0].text);
  };

  const nextStep = () => {
    const nextIdx = stepIndex + 1;
    if (nextIdx < steps.length) {
      setStepIndex(nextIdx);
      ttsService.speak(steps[nextIdx].text);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    ttsService.speak("סיימנו את הליכת המדיטציה. הרווחתם כוכב.");
    statsService.addStar();
    setIsDone(true);
  };

  useEffect(() => {
    return () => ttsService.stop();
  }, []);

  if (isDone) {
    return (
      <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-lime-500/30 w-full max-w-lg text-center">
        <div className="text-7xl mb-6">🚶</div>
        <h3 className="text-4xl font-bold text-lime-400 mb-6">הליכה מודעת הושלמה</h3>
        <p className="text-2xl text-slate-300 mb-10 leading-relaxed">
          מצאת שלווה בתוך התנועה. זוהי יכולת נפלאה לחיים רגועים יותר.
        </p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={onComplete}
            className="bg-lime-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-lime-800"
          >
            חזרה לתפריט
          </button>
          <div className="flex justify-center">
            <ShareButton text={`השלמתי מדיטציה בהליכה ב'רגע של שלווה'! ⭐ כל צעד היה מלא בשלווה.`} />
          </div>
        </div>
      </div>
    );
  }

  if (stepIndex === -1) {
    return (
      <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border-4 border-lime-500/30 text-center max-w-lg">
        <div className="text-7xl mb-6">🚶‍♂️</div>
        <h3 className="text-3xl font-bold text-lime-400 mb-6 underline decoration-lime-500/20">מדיטציה בהליכה</h3>
        <p className="text-xl text-slate-300 mb-8 leading-relaxed">
          תרגיל זה עוזר לנו להתחבר לתנועת הגוף ולמצוא שלווה גם בזמן פעולה. מצאו מרחב קטן שבו תוכלו ללכת כמה צעדים.
        </p>
        <button 
          onClick={startExercise}
          className="w-full bg-lime-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-lime-800"
        >
          אני מוכן
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border-4 border-lime-500/30 w-full max-w-lg text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-lime-500/20">
        <div 
          className="h-full bg-lime-500 transition-all duration-500" 
          style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
      
      <div className="text-7xl mb-6 mt-4 animate-bounce">{steps[stepIndex].icon}</div>
      <h3 className="text-4xl font-bold text-lime-400 mb-6">{steps[stepIndex].title}</h3>
      <p className="text-3xl leading-relaxed text-white mb-10 min-h-[140px] flex items-center justify-center">
        {steps[stepIndex].text}
      </p>
      
      <button 
        onClick={nextStep}
        className="w-full bg-lime-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-lg active:scale-95 border-b-8 border-lime-800"
      >
        {stepIndex === steps.length - 1 ? 'סיום' : 'המשך'}
      </button>
    </div>
  );
};

export default WalkingMeditationExercise;

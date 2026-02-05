
import React, { useState, useEffect, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import ShareButton from './ShareButton';
import MuteToggle from './MuteToggle';

interface Props {
  onComplete: () => void;
}

const steps = [
  { id: 'prepare', title: 'הכנה', text: 'קחו פיסת אוכל קטנה (צימוק, אגוז או פרי) והחזיקו אותה בכף היד.', icon: '🍇' },
  { id: 'look', title: 'הסתכלות', text: 'התבוננו באוכל כאילו זו הפעם הראשונה שאתם רואים אותו. שימו לב לצבע, לצורה ולמרקם.', icon: '👀' },
  { id: 'touch', title: 'מגע', text: 'הרגישו את המרקם בין האצבעות. האם הוא חלק? מחוספס? רך?', icon: '🖐️' },
  { id: 'smell', title: 'ריח', text: 'קרבו את האוכל לאף ונשמו את הניחוח שלו עמוק.', icon: '👃' },
  { id: 'tongue', title: 'מגע בלשון', text: 'הניחו את האוכל על הלשון מבלי ללעוס. הרגישו את התחושה בפה.', icon: '👅' },
  { id: 'chew', title: 'לעיסה', text: 'התחילו ללעוס לאט מאוד. שימו לב לטעם המשתנה ולמרקם המתפרק.', icon: '🦷' },
  { id: 'swallow', title: 'בליעה', text: 'שימו לב לתחושת הבליעה ולטעם שנשאר בפה.', icon: '✨' }
];

const MindfulEatingExercise: React.FC<Props> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(-1);
  const [isDone, setIsDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes recommended
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
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    ttsService.speak("כל הכבוד על האכילה המודעת.");
    statsService.addStar();
    setIsDone(true);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      ttsService.stop();
    };
  }, []);

  if (isDone) {
    return (
      <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-orange-500/30 w-full max-w-lg text-center">
        <div className="text-7xl mb-6">🍎</div>
        <h3 className="text-4xl font-bold text-orange-400 mb-6">סיימת לאכול במודעות</h3>
        <p className="text-2xl text-slate-300 mb-10 leading-relaxed">
          זהו צעד חשוב לחיבור בין גוף לנפש וליהנות באמת ממה שאנחנו אוכלים.
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={onComplete} className="bg-orange-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-orange-800">
            חזרה לתפריט
          </button>
          <div className="flex justify-center">
            <ShareButton text={`השלמתי תרגיל אכילה מודעת ב'רגע של שלווה'! ⭐ מרגיש/ה הרבה יותר הערכה למזון שאני אוכל/ת.`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg">
      {stepIndex === -1 ? (
        <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border-4 border-orange-500/30 text-center">
          <div className="text-7xl mb-6">🍎</div>
          <h3 className="text-3xl font-bold text-orange-400 mb-6 underline decoration-orange-500/20">אכילה מודעת</h3>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            בתרגיל זה נלמד להעריך את המזון שלנו דרך כל החושים. הכינו פיסת אוכל קטנה.
          </p>
          <button onClick={nextStep} className="w-full bg-orange-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-orange-800">
            אני מוכן
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border-4 border-orange-500/30 w-full text-center relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-slate-800 px-4 py-2 rounded-xl text-2xl font-bold text-orange-400 tabular-nums border-2 border-orange-500/20">
              {formatTime(timeLeft)}
            </div>
            <MuteToggle />
          </div>
          <div className="absolute top-0 left-0 w-full h-2 bg-orange-500/20">
            <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}></div>
          </div>
          <div className="text-7xl mb-6 mt-4">{steps[stepIndex].icon}</div>
          <h3 className="text-4xl font-bold text-orange-400 mb-6">{steps[stepIndex].title}</h3>
          <p className="text-3xl leading-relaxed text-slate-100 mb-10 min-h-[140px] flex items-center justify-center">
            {steps[stepIndex].text}
          </p>
          <button onClick={nextStep} className="w-full bg-orange-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-lg active:scale-95 border-b-8 border-orange-800">
            {stepIndex === steps.length - 1 ? 'סיום' : 'המשך'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MindfulEatingExercise;

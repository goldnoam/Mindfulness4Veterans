
import React, { useState, useEffect, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import ShareButton from './ShareButton';

interface Props {
  onComplete: () => void;
}

type Scene = 'beach' | 'forest' | 'meadow';

const scenes = {
  beach: {
    title: 'חוף הים',
    icon: '🏖️',
    color: 'bg-cyan-500',
    borderColor: 'border-cyan-200',
    description: 'דמיינו את הגלים השקטים ואת החול החם תחת הרגליים.',
    prompts: [
      'דמיינו את הגלים הכחולים נשטפים לאט אל החוף.',
      'הרגישו את קרני השמש המלטפות והחמימות על עורכם.',
      'הקשיבו לקול המרגיע של המים החוזרים אל הים.'
    ]
  },
  forest: {
    title: 'יער ירוק',
    icon: '🌲',
    color: 'bg-emerald-600',
    borderColor: 'border-emerald-200',
    description: 'נשמו את אוויר האורנים הצלול וראו את קרני השמש בין העצים.',
    prompts: [
      'ראו את העצים הגבוהים סביבכם, שומרים עליכם בשלווה.',
      'הקשיבו לציוץ הציפורים ולרחש העלים ברוח הקלה.',
      'הרגישו את ריח האדמה והאורנים ממלא את הריאות שלכם.'
    ]
  },
  meadow: {
    title: 'מרחב פתוח',
    icon: '🌻',
    color: 'bg-lime-500',
    borderColor: 'border-lime-200',
    description: 'שדות של פרחים צבעוניים וריח של פריחה באוויר.',
    prompts: [
      'דמיינו מרחב עצום של פרחים בשלל צבעי הקשת.',
      'ראו את הפרפרים מרקדים בין הפרחים בשקט מוחלט.',
      'הרגישו את הרוח הנעימה מלטפת את הפנים שלכם.'
    ]
  }
};

const VisualizationExercise: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<'setup' | 'active' | 'done'>('setup');
  const [selectedScene, setSelectedScene] = useState<Scene>('beach');
  const [durationMins, setDurationMins] = useState(2);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<number | null>(null);

  const startExercise = () => {
    const totalSeconds = durationMins * 60;
    setTimeLeft(totalSeconds);
    setStep('active');

    const sceneData = scenes[selectedScene];
    ttsService.speak(`בואו נצא למסע דמיוני אל ${sceneData.title}. עיצמו עיניים בנחת ונשמו עמוק.`);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }

        const totalSeconds = durationMins * 60;
        const progress = (totalSeconds - prev) / totalSeconds;
        if (prev === totalSeconds - 10) {
          ttsService.speak(sceneData.description);
        } else if (Math.abs(progress - 0.4) < 0.01) {
          ttsService.speak(sceneData.prompts[0]);
        } else if (Math.abs(progress - 0.7) < 0.01) {
          ttsService.speak(sceneData.prompts[1]);
        } else if (prev === 20) {
          ttsService.speak("לאט לאט, התחילו להרגיש את הגוף שלכם שוב על הכיסא.");
        }

        return prev - 1;
      });
    }, 1000);
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    ttsService.speak("חזרנו מהמסע. מקווה שאתם מרגישים רגועים יותר.");
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
      <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-cyan-500/30 w-full max-w-lg text-center">
        <div className="text-7xl mb-6">{scenes[selectedScene].icon}</div>
        <h3 className="text-4xl font-bold text-cyan-400 mb-6">המסע הסתיים</h3>
        <p className="text-2xl text-slate-300 mb-10 leading-relaxed">
          טיילת ב-{scenes[selectedScene].title} והרווחת כוכב שלווה.
        </p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={onComplete}
            className="bg-cyan-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-cyan-800"
          >
            חזרה לתפריט
          </button>
          <div className="flex justify-center">
            <ShareButton text={`יצאתי למסע דמיוני ב${scenes[selectedScene].title} באפליקציית 'רגע של שלווה'! ⭐ מרגיש/ה מלא/ת אנרגיה ורוגע.`} />
          </div>
        </div>
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border-4 border-cyan-500/30 w-full max-w-lg text-center">
        <h3 className="text-3xl font-bold text-cyan-400 mb-6 underline decoration-cyan-500/20">לאן נרצה לטייל היום?</h3>
        
        <div className="grid grid-cols-3 gap-3 mb-8">
          {(Object.keys(scenes) as Scene[]).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedScene(key)}
              className={`flex flex-col items-center p-4 rounded-2xl border-4 transition-all ${
                selectedScene === key ? 'border-cyan-500 bg-cyan-900/40 scale-105' : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              <span className="text-4xl mb-2">{scenes[key].icon}</span>
              <span className="text-lg font-bold text-slate-200">{scenes[key].title}</span>
            </button>
          ))}
        </div>

        <div className="mb-8">
          <p className="text-xl font-bold text-slate-300 mb-4">משך הזמן: {durationMins} דקות</p>
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={() => setDurationMins(Math.max(1, durationMins - 1))}
              className="bg-slate-800 border-2 border-slate-700 text-slate-200 w-16 h-16 rounded-full text-4xl font-bold flex items-center justify-center active:scale-90"
            >
              -
            </button>
            <div className="text-5xl font-bold text-cyan-400 px-4 w-16">{durationMins}</div>
            <button 
              onClick={() => setDurationMins(Math.min(5, durationMins + 1))}
              className="bg-slate-800 border-2 border-slate-700 text-slate-200 w-16 h-16 rounded-full text-4xl font-bold flex items-center justify-center active:scale-90"
            >
              +
            </button>
          </div>
        </div>

        <button 
          onClick={startExercise}
          className="w-full bg-cyan-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 transition-all border-b-8 border-cyan-800"
        >
          בואו נצא לדרך!
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-12 w-full max-w-lg text-center">
      <div className={`w-64 h-64 rounded-full flex items-center justify-center border-8 border-slate-800 shadow-[0_0_50px_rgba(6,182,212,0.3)] ${scenes[selectedScene].color} animate-pulse transition-all duration-1000`}>
        <span className="text-8xl">{scenes[selectedScene].icon}</span>
      </div>
      
      <div>
        <h3 className="text-4xl font-bold text-cyan-400 mb-2">{scenes[selectedScene].title}</h3>
        <p className="text-5xl font-bold text-white tabular-nums">{formatTime(timeLeft)}</p>
      </div>

      <p className="text-2xl text-slate-300 font-medium px-4 leading-snug">
        הקשיבו לקול והרגישו את השלווה...
      </p>

      <button 
        onClick={stopEarly}
        className="text-2xl text-cyan-400 underline font-bold mt-4"
      >
        הפסק טיול
      </button>
    </div>
  );
};

export default VisualizationExercise;

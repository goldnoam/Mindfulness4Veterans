
import React, { useState, useEffect, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import CelebrationOverlay from './CelebrationOverlay';
import MuteToggle from './MuteToggle';
import { Language, translations } from '../translations';

interface Props {
  onComplete: () => void;
}

type Scene = 'beach' | 'forest' | 'meadow';

const scenes = {
  beach: {
    titleHe: 'חוף הים',
    titleEn: 'The Beach',
    icon: '🏖️',
    color: 'bg-cyan-500',
    descriptionHe: 'דמיינו את הגלים השקטים ואת החול החם תחת הרגליים.',
    descriptionEn: 'Imagine the quiet waves and the warm sand under your feet.',
    promptsHe: [
      'דמיינו את הגלים הכחולים נשטפים לאט אל החוף.',
      'הרגישו את קרני השמש המלטפות והחמימות על עורכם.',
      'הקשיבו לקול המרגיע של המים החוזרים אל הים.'
    ],
    promptsEn: [
      'Imagine the blue waves slowly washing onto the shore.',
      'Feel the warm, caressing sunrays on your skin.',
      'Listen to the soothing sound of the water returning to the sea.'
    ]
  },
  forest: {
    titleHe: 'יער ירוק',
    titleEn: 'Green Forest',
    icon: '🌲',
    color: 'bg-emerald-600',
    descriptionHe: 'נשמו את אוויר האורנים הצלול וראו את קרני השמש בין העצים.',
    descriptionEn: 'Breathe the clear pine air and see the sunbeams between the trees.',
    promptsHe: [
      'ראו את העצים הגבוהים סביבכם, שומרים עליכם בשלווה.',
      'הקשיבו לציוץ הציפורים ולרחש העלים ברוח הקלה.',
      'הרגישו את ריח האדמה והאורנים ממלא את הריאות שלכם.'
    ],
    promptsEn: [
      'See the tall trees around you, keeping you in peace.',
      'Listen to the birds chirping and the leaves rustling in the breeze.',
      'Feel the scent of earth and pines filling your lungs.'
    ]
  },
  meadow: {
    titleHe: 'מרחב פתוח',
    titleEn: 'Open Meadow',
    icon: '🌻',
    color: 'bg-lime-500',
    descriptionHe: 'שדות של פרחים צבעוניים וריח של פריחה באוויר.',
    descriptionEn: 'Fields of colorful flowers and the scent of blossoms in the air.',
    promptsHe: [
      'דמיינו מרחב עצום של פרחים בשלל צבעי הקשת.',
      'ראו את הפרפרים מרקדים בין הפרחים בשקט מוחלט.',
      'הרגישו את הרוח הנעימה מלטפת את הפנים שלכם.'
    ],
    promptsEn: [
      'Imagine a vast expanse of flowers in all colors of the rainbow.',
      'Watch the butterflies dancing among the flowers in absolute silence.',
      'Feel the pleasant wind caressing your face.'
    ]
  }
};

const VisualizationExercise: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<'setup' | 'active'>('setup');
  const [isFinished, setIsFinished] = useState(false);
  const [selectedScene, setSelectedScene] = useState<Scene>('beach');
  const [durationMins, setDurationMins] = useState(2);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<number | null>(null);

  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang] || translations['he'];

  const startExercise = () => {
    const totalSeconds = durationMins * 60;
    setTimeLeft(totalSeconds);
    setStep('active');

    const sceneData = scenes[selectedScene];
    const title = lang === 'he' ? sceneData.titleHe : sceneData.titleEn;
    ttsService.speak(lang === 'he' ? `בואו נצא למסע דמיוני אל ${title}. עיצמו עיניים בנחת.` : `Let's go on an imaginary journey to ${title}. Close your eyes gently.`);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }

        const totalSeconds = durationMins * 60;
        const progress = (totalSeconds - prev) / totalSeconds;
        const prompts = lang === 'he' ? sceneData.promptsHe : sceneData.promptsEn;
        
        if (prev === totalSeconds - 10) {
          ttsService.speak(lang === 'he' ? sceneData.descriptionHe : sceneData.descriptionEn);
        } else if (Math.abs(progress - 0.4) < 0.01) {
          ttsService.speak(prompts[0]);
        } else if (Math.abs(progress - 0.7) < 0.01) {
          ttsService.speak(prompts[1]);
        }

        return prev - 1;
      });
    }, 1000);
  };

  const restartExercise = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    ttsService.stop();
    startExercise();
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    statsService.addStar();
    statsService.addToHistory(t.visualization.title, '🌅', durationMins * 60);
    setIsFinished(true);
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

  if (isFinished) return <CelebrationOverlay onComplete={onComplete} />;

  if (step === 'setup') {
    return (
      <div className="bg-slate-900 p-8 rounded-[48px] shadow-2xl border-4 border-cyan-500/30 w-full max-w-lg text-center">
        <h3 className="text-3xl font-bold text-cyan-400 mb-6 underline decoration-cyan-500/20">{lang === 'he' ? 'לאן נטייל היום?' : 'Where shall we travel?'}</h3>
        
        <div className="grid grid-cols-3 gap-3 mb-8">
          {(Object.keys(scenes) as Scene[]).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedScene(key)}
              className={`flex flex-col items-center p-4 rounded-3xl border-4 transition-all ${
                selectedScene === key ? 'border-cyan-500 bg-cyan-900/40 scale-105 shadow-xl' : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              <span className="text-5xl mb-2">{scenes[key].icon}</span>
              <span className="text-lg font-bold text-slate-200">{lang === 'he' ? scenes[key].titleHe : scenes[key].titleEn}</span>
            </button>
          ))}
        </div>

        <div className="mb-8">
          <p className="text-2xl font-bold text-slate-300 mb-4">{t.duration}: {durationMins} {t.min}</p>
          <div className="flex flex-col gap-4">
            {[1, 2, 5].map(m => (
              <button 
                key={m}
                onClick={() => setDurationMins(m)}
                className={`text-2xl font-bold py-4 rounded-2xl border-4 transition-all ${durationMins === m ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
              >
                {m} {t.min}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={startExercise}
          className="w-full bg-cyan-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 transition-all border-b-8 border-cyan-800"
        >
          {t.start}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg text-center">
      <div className="flex items-center justify-between w-full px-6">
          <div className="bg-slate-800 px-6 py-2 rounded-2xl border-2 border-cyan-500/30 text-3xl font-bold text-cyan-400 tabular-nums shadow-lg">
            {formatTime(timeLeft)}
          </div>
          <MuteToggle />
      </div>

      <div className={`w-64 h-64 rounded-full flex items-center justify-center border-8 border-slate-800 shadow-[0_0_50px_rgba(6,182,212,0.3)] ${scenes[selectedScene].color} animate-pulse transition-all duration-1000`}>
        <span className="text-[120px]">{scenes[selectedScene].icon}</span>
      </div>
      
      <div>
        <h3 className="text-4xl font-bold text-cyan-400 mb-2">{lang === 'he' ? scenes[selectedScene].titleHe : scenes[selectedScene].titleEn}</h3>
      </div>

      <div className="flex flex-col gap-4 items-center">
        <button 
          onClick={restartExercise}
          className="bg-slate-800 border-4 border-cyan-500/50 text-cyan-400 px-10 py-4 rounded-3xl text-2xl font-bold shadow-xl active:scale-95 transition-all"
        >
          🔄 {t.restart}
        </button>
        <button 
          onClick={stopEarly}
          className="text-2xl text-cyan-400 underline font-bold mt-4"
        >
          {t.back}
        </button>
      </div>
    </div>
  );
};

export default VisualizationExercise;

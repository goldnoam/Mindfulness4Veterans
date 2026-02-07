
import React, { useState, useEffect, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import { ambientService, AmbientSoundMode } from '../services/ambientService';
import CelebrationOverlay from './CelebrationOverlay';
import MuteToggle from './MuteToggle';
import { Language, translations } from '../translations';

interface Props {
  onComplete: () => void;
}

type Scene = 'beach' | 'forest' | 'meadow';

const scenes: Record<Scene, any> = {
  beach: {
    key: 'beach',
    titleHe: 'חוף הים',
    titleEn: 'The Beach',
    icon: '🏖️',
    color: 'bg-cyan-500',
    ambientMode: 'waves' as AmbientSoundMode,
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
    key: 'forest',
    titleHe: 'יער ירוק',
    titleEn: 'Green Forest',
    icon: '🌲',
    color: 'bg-emerald-600',
    ambientMode: 'forest' as AmbientSoundMode,
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
    key: 'meadow',
    titleHe: 'מרחב פתוח',
    titleEn: 'Open Meadow',
    icon: '🌻',
    color: 'bg-lime-500',
    ambientMode: 'butterflies' as AmbientSoundMode,
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
  const [step, setStep] = useState<'setup' | 'transitioning' | 'active'>('setup');
  const [isFinished, setIsFinished] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [durationMins, setDurationMins] = useState(2);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<number | null>(null);

  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang] || translations['he'];
  const sceneKeys = Object.keys(scenes) as Scene[];
  const selectedScene = scenes[sceneKeys[carouselIndex]];

  const startExercise = () => {
    setStep('transitioning');
    
    // Smooth transition effect
    setTimeout(() => {
      const totalSeconds = durationMins * 60;
      setTimeLeft(totalSeconds);
      setStep('active');

      const title = lang === 'he' ? selectedScene.titleHe : selectedScene.titleEn;
      ambientService.setMode(selectedScene.ambientMode);
      
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
          const prompts = lang === 'he' ? selectedScene.promptsHe : selectedScene.promptsEn;
          
          if (prev === totalSeconds - 10) {
            ttsService.speak(lang === 'he' ? selectedScene.descriptionHe : selectedScene.descriptionEn);
          } else if (Math.abs(progress - 0.4) < 0.01) {
            ttsService.speak(prompts[0]);
          } else if (Math.abs(progress - 0.7) < 0.01) {
            ttsService.speak(prompts[1]);
          }

          return prev - 1;
        });
      }, 1000);
    }, 600);
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    ambientService.setMode('off');
    statsService.addStar();
    statsService.addToHistory(t.visualization.title, '🌅', durationMins * 60);
    setIsFinished(true);
  };

  const stopEarly = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    ttsService.stop();
    ambientService.setMode('off');
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
      ambientService.setMode('off');
    };
  }, []);

  if (isFinished) return <CelebrationOverlay onComplete={onComplete} />;

  if (step === 'setup' || step === 'transitioning') {
    return (
      <div className={`transition-all duration-700 transform ${step === 'transitioning' ? 'opacity-0 scale-90 blur-sm' : 'opacity-100 scale-100'}`}>
        <div className="bg-slate-900 p-8 rounded-[48px] shadow-2xl border-4 border-cyan-500/30 w-full max-w-lg text-center">
          <h3 className="text-3xl font-black text-cyan-400 mb-8 uppercase tracking-wide">
            {lang === 'he' ? 'לאן נטייל היום?' : 'Where shall we travel?'}
          </h3>
          
          <div className="relative flex items-center justify-center mb-10 group">
            <button 
              onClick={() => setCarouselIndex((carouselIndex - 1 + sceneKeys.length) % sceneKeys.length)}
              className="absolute -left-6 md:-left-10 z-10 bg-slate-800 border-4 border-cyan-500/50 w-20 h-20 rounded-full flex flex-col items-center justify-center text-4xl shadow-2xl active:scale-90 focus-visible:ring-cyan-400 transition-all hover:bg-slate-700"
              aria-label="Previous Scene"
            >
              <span>{lang === 'he' ? '➡️' : '⬅️'}</span>
              <span className="text-[10px] font-black uppercase text-cyan-500/70">{lang === 'he' ? 'עוד' : 'More'}</span>
            </button>

            <div className={`p-10 rounded-full transition-all duration-500 ${selectedScene.color} shadow-[0_0_60px_rgba(6,182,212,0.4)] transform hover:scale-105`}>
               <span className="text-[100px] leading-none drop-shadow-xl select-none" role="img" aria-label="Scene Icon">{selectedScene.icon}</span>
            </div>

            <button 
              onClick={() => setCarouselIndex((carouselIndex + 1) % sceneKeys.length)}
              className="absolute -right-6 md:-right-10 z-10 bg-slate-800 border-4 border-cyan-500/50 w-20 h-20 rounded-full flex flex-col items-center justify-center text-4xl shadow-2xl active:scale-90 focus-visible:ring-cyan-400 transition-all hover:bg-slate-700"
              aria-label="Next Scene"
            >
              <span>{lang === 'he' ? '⬅️' : '➡️'}</span>
              <span className="text-[10px] font-black uppercase text-cyan-500/70">{lang === 'he' ? 'עוד' : 'More'}</span>
            </button>

            {/* Tooltip for seniors */}
            <div className="absolute -bottom-10 bg-cyan-900/80 text-cyan-100 px-4 py-1 rounded-full text-sm font-black animate-bounce">
              {lang === 'he' ? 'לחצו על החיצים כדי להחליף מקום' : 'Click arrows to change location'}
            </div>
          </div>

          <h4 className="text-4xl font-black text-white mb-8">
            {lang === 'he' ? selectedScene.titleHe : selectedScene.titleEn}
          </h4>

          <div className="mb-10">
            <p className="text-2xl font-bold text-slate-400 mb-4 tracking-widest uppercase">{t.duration}</p>
            <div className="flex gap-4 justify-center">
              {[1, 2, 5].map(m => (
                <button 
                  key={m}
                  onClick={() => { setDurationMins(m); ttsService.speak(`${m} ${t.min}`); }}
                  className={`flex-1 text-2xl font-black py-5 rounded-3xl border-4 transition-all active:scale-95 ${durationMins === m ? 'bg-cyan-600 border-cyan-400 text-white shadow-xl scale-105' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                >
                  {m} {t.min}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={startExercise}
            className="w-full bg-cyan-600 text-white text-4xl font-black py-8 rounded-[36px] shadow-2xl active:scale-95 transition-all border-b-[12px] border-cyan-800 hover:bg-cyan-500"
          >
            {t.start}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-lg text-center animate-in fade-in zoom-in duration-700 px-4">
      <div className="flex items-center justify-between w-full">
          <div className="bg-slate-800 px-8 py-3 rounded-2xl border-4 border-cyan-500/30 text-3xl font-black text-cyan-400 tabular-nums shadow-2xl">
            {formatTime(timeLeft)}
          </div>
          <MuteToggle />
      </div>

      <div className="relative group">
        <div className={`absolute inset-0 rounded-full blur-[80px] opacity-30 animate-pulse ${selectedScene.color}`}></div>
        <div className={`w-72 h-72 rounded-full flex items-center justify-center border-8 border-white/20 shadow-2xl transition-all duration-1000 transform hover:scale-105 ${selectedScene.color}`}>
          <span className="text-[140px] leading-none drop-shadow-2xl animate-bounce" style={{ animationDuration: '4s' }}>{selectedScene.icon}</span>
        </div>
      </div>
      
      <div>
        <h3 className="text-5xl font-black text-white drop-shadow-sm mb-2">
          {lang === 'he' ? selectedScene.titleHe : selectedScene.titleEn}
        </h3>
        <p className="text-2xl font-bold text-cyan-400 animate-pulse tracking-widest uppercase">
          {lang === 'he' ? 'דמיינו את השלווה...' : 'Imagine the peace...'}
        </p>
      </div>

      <div className="flex flex-col gap-4 items-center w-full max-w-xs">
        <button 
          onClick={() => { ttsService.stop(); startExercise(); }}
          className="w-full bg-slate-800 border-4 border-cyan-500/50 text-cyan-400 px-10 py-5 rounded-3xl text-2xl font-black shadow-xl active:scale-95 transition-all hover:bg-slate-700"
        >
          🔄 {t.restart}
        </button>
        <button 
          onClick={stopEarly}
          className="text-2xl text-cyan-400 underline font-black mt-4 hover:text-cyan-300 transition-colors"
        >
          {t.back}
        </button>
      </div>
    </div>
  );
};

export default VisualizationExercise;

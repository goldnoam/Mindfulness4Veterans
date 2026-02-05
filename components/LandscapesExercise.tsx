
import React, { useState, useEffect, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import { ambientService } from '../services/ambientService';
import CelebrationOverlay from './CelebrationOverlay';
import { Language, translations } from '../translations';

const landscapeImages = [
  { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', labelHe: 'אגם פסטורלי בהרים', labelEn: 'Pastoral Mountain Lake' },
  { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80', labelHe: 'יער ירוק ומוצף שמש', labelEn: 'Sun-drenched Green Forest' },
  { url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80', labelHe: 'שקיעה כתומה בשדות', labelEn: 'Orange Sunset in Fields' },
  { url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1200&q=80', labelHe: 'מפל מים שקט בטבע', labelEn: 'Quiet Waterfall in Nature' },
  { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', labelHe: 'עמק ירוק ומרהיב', labelEn: 'Breathtaking Green Valley' },
  { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80', labelHe: 'נוף ימי בשעת שקיעה', labelEn: 'Seaside at Sunset' }
];

interface Props {
  onComplete: () => void;
}

const LandscapesExercise: React.FC<Props> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isAuto, setIsAuto] = useState(true);
  const [step, setStep] = useState<'setup' | 'active'>('setup');
  const timerRef = useRef<number | null>(null);

  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang] || translations['he'];

  const startExercise = () => {
    setStep('active');
    ambientService.setMode('forest');
    ttsService.speak(lang === 'he' ? 'בואו נתבונן ביופי של הטבע. נשמו עמוק ותיהנו מהמראות.' : 'Let’s look at the beauty of nature. Breathe deeply and enjoy the views.');
  };

  useEffect(() => {
    if (step === 'active' && isAuto) {
      timerRef.current = window.setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % landscapeImages.length);
      }, 8000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, isAuto]);

  const handleNext = () => setCurrentIndex(prev => (prev + 1) % landscapeImages.length);
  const handlePrev = () => setCurrentIndex(prev => (prev - 1 + landscapeImages.length) % landscapeImages.length);

  const handleFinish = () => {
    ambientService.setMode('off');
    statsService.addStar();
    statsService.addToHistory(t.landscapes.title, '🖼️', 120);
    setIsFinished(true);
  };

  if (isFinished) return <CelebrationOverlay onComplete={onComplete} />;

  if (step === 'setup') {
    return (
      <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-4 border-emerald-500/30 w-full max-w-lg text-center">
        <div className="text-8xl mb-6">🖼️</div>
        <h3 className="text-4xl font-black text-white mb-6">{t.landscapes.title}</h3>
        <p className="text-2xl text-slate-300 mb-10 leading-relaxed">
          {lang === 'he' ? 'צפייה בתמונות טבע מרהיבות להורדת רמת המתח והעלאת מצב הרוח.' : 'View beautiful nature images to lower stress and lift your mood.'}
        </p>
        <button onClick={startExercise} className="w-full bg-emerald-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl border-b-8 border-emerald-800">
          {t.start}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-2">
      <div className="relative w-full h-full max-w-6xl rounded-[40px] overflow-hidden shadow-2xl group">
        <img 
          src={landscapeImages[currentIndex].url} 
          alt="Landscape" 
          className="w-full h-full object-cover transition-opacity duration-1000"
        />
        
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center pointer-events-none">
          <button 
            onClick={() => setStep('setup')}
            className="pointer-events-auto bg-black/50 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-bold border-2 border-white/20 active:scale-90"
          >
            {t.back}
          </button>
          <div className="pointer-events-auto flex items-center gap-4 bg-black/50 backdrop-blur-md p-2 rounded-2xl border-2 border-white/20">
             <span className="text-white font-bold px-4">{isAuto ? (lang === 'he' ? 'מצב אוטומטי' : 'Auto Mode') : (lang === 'he' ? 'מצב ידני' : 'Manual')}</span>
             <button onClick={() => setIsAuto(!isAuto)} className={`w-14 h-14 flex items-center justify-center rounded-xl text-2xl transition-all ${isAuto ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                {isAuto ? '⏸️' : '▶️'}
             </button>
          </div>
        </div>

        <button 
          onClick={handlePrev} 
          className="absolute left-4 top-1/2 -translate-y-1/2 w-20 h-20 bg-black/30 hover:bg-black/60 rounded-full flex items-center justify-center text-4xl text-white transition-all opacity-0 group-hover:opacity-100"
        >
          {lang === 'he' ? '➡️' : '⬅️'}
        </button>
        <button 
          onClick={handleNext} 
          className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 bg-black/30 hover:bg-black/60 rounded-full flex items-center justify-center text-4xl text-white transition-all opacity-0 group-hover:opacity-100"
        >
          {lang === 'he' ? '⬅️' : '➡️'}
        </button>

        <div className="absolute bottom-10 left-10 right-10 flex flex-col items-center gap-6">
          <div className="bg-black/60 backdrop-blur-lg px-10 py-5 rounded-[32px] border-2 border-white/30">
            <p className="text-2xl md:text-3xl font-black text-white text-center">
              {lang === 'he' ? landscapeImages[currentIndex].labelHe : landscapeImages[currentIndex].labelEn}
            </p>
          </div>
          <button onClick={handleFinish} className="bg-emerald-600 text-white text-3xl font-black py-6 px-16 rounded-[40px] shadow-2xl border-b-8 border-emerald-800 active:scale-95">
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandscapesExercise;


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
      <div className="bg-slate-900 p-8 md:p-10 rounded-[48px] shadow-2xl border-4 border-emerald-500/30 w-full max-w-lg text-center mx-4">
        <div className="text-6xl md:text-8xl mb-6">🖼️</div>
        <h3 className="text-3xl md:text-4xl font-black text-white mb-6">{t.landscapes.title}</h3>
        <p className="text-xl md:text-2xl text-slate-300 mb-10 leading-relaxed">
          {lang === 'he' ? 'צפייה בתמונות טבע מרהיבות להורדת רמת המתח והעלאת מצב הרוח.' : 'View beautiful nature images to lower stress and lift your mood.'}
        </p>
        <button onClick={startExercise} className="w-full bg-emerald-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl border-b-8 border-emerald-800 active:scale-95 transition-all">
          {t.start}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="relative w-full h-full flex flex-col group">
        <img 
          src={landscapeImages[currentIndex].url} 
          alt="Landscape" 
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        />
        
        {/* Top Controls Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent z-10">
          <button 
            onClick={() => setStep('setup')}
            className="flex-shrink-0 bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold border-2 border-white/20 active:scale-90 text-xl"
          >
            {t.back}
          </button>
          
          <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md p-2 rounded-2xl border-2 border-white/20">
             <span className="hidden sm:inline text-white font-bold px-2">{isAuto ? (lang === 'he' ? 'אוטומטי' : 'Auto') : (lang === 'he' ? 'ידני' : 'Manual')}</span>
             <button onClick={() => setIsAuto(!isAuto)} className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl transition-all ${isAuto ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}>
                {isAuto ? '⏸️' : '▶️'}
             </button>
          </div>
        </div>

        {/* Navigation Arrows - Accessible on tablet/mobile via touch */}
        <button 
          onClick={handlePrev} 
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-3xl md:text-4xl text-white transition-all z-20 active:scale-90"
          aria-label="Previous Landscape"
        >
          {lang === 'he' ? '➡️' : '⬅️'}
        </button>
        <button 
          onClick={handleNext} 
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-3xl md:text-4xl text-white transition-all z-20 active:scale-90"
          aria-label="Next Landscape"
        >
          {lang === 'he' ? '⬅️' : '➡️'}
        </button>

        {/* Bottom Label and Finish Button Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center gap-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10">
          <div className="bg-black/60 backdrop-blur-lg px-6 py-3 md:px-10 md:py-5 rounded-[24px] md:rounded-[32px] border-2 border-white/30 max-w-[90%]">
            <p className="text-xl md:text-3xl font-black text-white text-center leading-tight">
              {lang === 'he' ? landscapeImages[currentIndex].labelHe : landscapeImages[currentIndex].labelEn}
            </p>
          </div>
          <button 
            onClick={handleFinish} 
            className="w-full sm:w-auto min-w-[200px] bg-emerald-600 text-white text-2xl md:text-3xl font-black py-4 md:py-6 px-12 rounded-[32px] md:rounded-[40px] shadow-2xl border-b-8 border-emerald-800 active:scale-95 transition-all"
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandscapesExercise;

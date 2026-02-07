
import React, { useState, useEffect, useRef } from 'react';
import { ttsService } from '../services/ttsService';
import { statsService } from '../services/statsService';
import CelebrationOverlay from './CelebrationOverlay';
import MuteToggle from './MuteToggle';
import { Language, translations } from '../translations';

interface Props {
  onComplete: () => void;
}

const hePhrases = [
  "שאהיה מאושר ושליו.",
  "שאהיה בריא וחזק.",
  "שאהיה בטוח ומוגן.",
  "שכל יקיריי יהיו מאושרים ושלווים.",
  "שכל בני האדם יהיו חופשיים מסבל.",
  "שאהיה מלא בחמלה ובטוב לב."
];

const enPhrases = [
  "May I be happy and peaceful.",
  "May I be healthy and strong.",
  "May I be safe and protected.",
  "May all my loved ones be happy and peaceful.",
  "May all beings be free from suffering.",
  "May I be filled with compassion and kindness."
];

const KindnessExercise: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<'setup' | 'active'>('setup');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang] || translations['he'];
  const activePhrases = lang === 'he' ? hePhrases : enPhrases;

  const startExercise = () => {
    setStep('active');
    setCurrentIdx(0);
    ttsService.speak(activePhrases[0]);
  };

  const nextPhrase = () => {
    if (currentIdx < activePhrases.length - 1) {
      setCurrentIdx(prev => prev + 1);
      ttsService.speak(activePhrases[currentIdx + 1]);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    statsService.addStar();
    statsService.addToHistory(t.kindness.title, '❤️', 120);
    setIsFinished(true);
  };

  if (isFinished) return <CelebrationOverlay onComplete={onComplete} />;

  if (step === 'setup') {
    return (
      <div className="bg-slate-900 p-10 rounded-[56px] shadow-2xl border-4 border-rose-500/30 w-full max-w-lg text-center">
        <div className="text-8xl mb-6" aria-hidden="true">❤️</div>
        <h3 className="text-4xl font-black text-white mb-6">{t.kindness.title}</h3>
        <p className="text-2xl text-slate-300 mb-10 leading-relaxed">
          {lang === 'he' ? 'תרגיל לשליחת איחולים טובים לעצמכם ולאחרים. פותח את הלב ומביא שלווה.' : 'An exercise to send good wishes to yourself and others. Opens the heart and brings peace.'}
        </p>
        <button onClick={startExercise} className="w-full bg-rose-600 text-white text-4xl font-black py-8 rounded-[36px] shadow-xl border-b-[12px] border-rose-800 active:scale-95 transition-all focus-visible:ring-rose-400">
          {t.start}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-lg text-center px-4">
      <div className="flex justify-end w-full">
         <MuteToggle />
      </div>

      <div className="relative flex items-center justify-center h-64 w-full">
         <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping opacity-30"></div>
         <div className="absolute inset-0 bg-rose-500/10 rounded-full blur-[60px] animate-pulse"></div>
         <div className="text-[160px] z-10 transition-transform duration-1000 scale-110 drop-shadow-2xl">❤️</div>
      </div>

      <div className="min-h-[160px] flex items-center justify-center bg-slate-900/40 p-8 rounded-[40px] border-4 border-rose-500/10">
         <p className="text-4xl font-black text-rose-300 leading-tight">
           {activePhrases[currentIdx]}
         </p>
      </div>

      <button 
        onClick={nextPhrase}
        className="w-full bg-rose-600 text-white text-4xl font-black py-8 rounded-[40px] shadow-2xl border-b-[12px] border-rose-800 active:scale-95 transition-all focus-visible:ring-rose-400"
      >
        {currentIdx === activePhrases.length - 1 ? t.done : t.next}
      </button>

      <button 
        onClick={() => setStep('setup')}
        className="text-2xl text-rose-400 underline font-black hover:text-rose-300 transition-colors"
      >
        {t.back}
      </button>
    </div>
  );
};

export default KindnessExercise;

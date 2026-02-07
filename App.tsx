
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import BreathingExercise from './components/BreathingExercise';
import SensesExercise from './components/SensesExercise';
import GratitudeExercise from './components/GratitudeExercise';
import MeditationExercise from './components/MeditationExercise';
import VisualizationExercise from './components/VisualizationExercise';
import BodyScanExercise from './components/BodyScanExercise';
import MindfulEatingExercise from './components/MindfulEatingExercise';
import WalkingMeditationExercise from './components/WalkingMeditationExercise';
import MindfulMovementExercise from './components/MindfulMovementExercise';
import SoundMeditationExercise from './components/SoundMeditationExercise';
import MindfulPhotosExercise from './components/MindfulPhotosExercise';
import WellnessExercise from './components/WellnessExercise';
import LandscapesExercise from './components/LandscapesExercise';
import KindnessExercise from './components/KindnessExercise';
import MorningExercise from './components/MorningExercise';
import HistoryView from './components/HistoryView';
import NewsCard from './components/NewsCard';
import { ExerciseType } from './types';
import { statsService } from './services/statsService';
import { audioService } from './services/audioService';
import { translations, Language } from './translations';
import { ttsService } from './services/ttsService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ExerciseType>(ExerciseType.HOME);
  const [stars, setStars] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lang, setLang] = useState<Language>('he');
  const [showStarCelebration, setShowStarCelebration] = useState(false);
  const prevStarsRef = useRef(0);

  useEffect(() => {
    const initialStars = statsService.getStars();
    setStars(initialStars);
    prevStarsRef.current = initialStars;
    
    const interval = setInterval(() => {
      const storedLang = localStorage.getItem('lang') as Language;
      if (storedLang && storedLang !== lang) setLang(storedLang);
    }, 500);

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        audioService.playClickSound();
      }
    };
    window.addEventListener('mousedown', handleGlobalClick);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousedown', handleGlobalClick);
    };
  }, [lang]);

  useEffect(() => {
    if (currentView === ExerciseType.HOME) {
      const currentStars = statsService.getStars();
      if (currentStars > prevStarsRef.current) {
        setShowStarCelebration(true);
        setTimeout(() => setShowStarCelebration(false), 2000);
      }
      setStars(currentStars);
      prevStarsRef.current = currentStars;
    }
  }, [currentView]);

  const t = translations[lang] || translations['he'];

  const exercises = [
    { id: ExerciseType.BREATHING, ...t.breathing, color: 'border-emerald-500', bg: 'bg-emerald-500/10' },
    { id: ExerciseType.SOUND_MEDITATION, ...t.soundMed, color: 'border-violet-500', bg: 'bg-violet-500/10' },
    { id: ExerciseType.LANDSCAPES, ...t.landscapes, color: 'border-emerald-300', bg: 'bg-emerald-300/10' },
    { id: ExerciseType.VISUALIZATION, ...t.visualization, color: 'border-cyan-500', bg: 'bg-cyan-500/10' },
    { id: 'KINDNESS', ...t.kindness, color: 'border-rose-500', bg: 'bg-rose-500/10' },
    { id: 'MORNING', ...t.morning, color: 'border-amber-400', bg: 'bg-amber-400/10' },
    { id: ExerciseType.WELLNESS, ...t.wellness, color: 'border-emerald-400', bg: 'bg-emerald-400/10' },
    { id: ExerciseType.SENSES, ...t.senses, color: 'border-blue-500', bg: 'bg-blue-500/10' },
    { id: ExerciseType.GRATITUDE, ...t.gratitude, color: 'border-amber-500', bg: 'bg-amber-500/10' },
    { id: ExerciseType.MEDITATION, ...t.meditation, color: 'border-purple-500', bg: 'bg-purple-500/10' },
    { id: ExerciseType.BODY_SCAN, ...t.bodyScan, color: 'border-indigo-500', bg: 'bg-indigo-500/10' },
    { id: ExerciseType.MINDFUL_EATING, ...t.eating, color: 'border-orange-500', bg: 'bg-orange-500/10' },
    { id: ExerciseType.WALKING_MEDITATION, ...t.walking, color: 'border-lime-500', bg: 'bg-lime-500/10' },
    { id: ExerciseType.MINDFUL_MOVEMENT, ...t.movement, color: 'border-teal-500', bg: 'bg-teal-500/10' },
    { id: ExerciseType.MINDFUL_PHOTOS, ...t.photos, color: 'border-slate-500', bg: 'bg-slate-500/10' },
  ];

  const onExerciseComplete = () => setCurrentView(ExerciseType.HOME);
  const isExerciseActive = currentView !== ExerciseType.HOME && currentView !== ExerciseType.HISTORY;

  const renderContent = () => {
    switch (currentView) {
      case ExerciseType.HISTORY:
        return (
          <Layout title={t.history} onBack={() => setCurrentView(ExerciseType.HOME)}>
            <HistoryView onBack={() => setCurrentView(ExerciseType.HOME)} />
          </Layout>
        );
      case ExerciseType.LANDSCAPES:
        return <LandscapesExercise onComplete={onExerciseComplete} />;
      case ExerciseType.BREATHING:
        return (
          <Layout title={t.breathing.title} onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <BreathingExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case 'KINDNESS' as any:
        return (
          <Layout title={t.kindness.title} onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <KindnessExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case 'MORNING' as any:
        return (
          <Layout title={t.morning.title} onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <MorningExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.WELLNESS:
        return (
          <Layout title={t.wellness.title} onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <WellnessExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.SENSES:
        return (
          <Layout title={t.senses.title} onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <SensesExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.GRATITUDE:
        return (
          <Layout title={t.gratitude.title} onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <GratitudeExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.MEDITATION:
        return (
          <Layout title={t.meditation.title} onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <MeditationExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.VISUALIZATION:
        return (
          <Layout title={t.visualization.title} onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <VisualizationExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.BODY_SCAN:
        return (
          <Layout title={t.bodyScan.title} onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <BodyScanExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.MINDFUL_EATING:
        return (
          <Layout title={t.eating.title} onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <MindfulEatingExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.WALKING_MEDITATION:
        return (
          <Layout title={t.walking.title} onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <WalkingMeditationExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.MINDFUL_MOVEMENT:
        return (
          <Layout title={t.movement.title} onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <MindfulMovementExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.SOUND_MEDITATION:
        return (
          <Layout title={t.soundMed.title} onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <SoundMeditationExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.MINDFUL_PHOTOS:
        return (
          <Layout title={t.photos.title} onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <MindfulPhotosExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.HOME:
      default:
        const currentExercise = exercises[carouselIndex];
        return (
          <Layout title={t.title} isExerciseActive={false}>
            <div className="flex flex-col gap-8 w-full px-4 max-w-lg pb-10">
              <div className="flex items-center gap-4">
                <div className={`flex-1 bg-slate-900 border-4 ${showStarCelebration ? 'border-amber-500 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-slate-800'} rounded-[40px] p-6 shadow-xl flex flex-col items-center transition-all duration-500`}>
                   <div className="flex items-center gap-4">
                      <span className="text-6xl" role="img" aria-label="star" key={stars}>⭐</span>
                      <span className={`text-5xl font-black ${showStarCelebration ? 'text-amber-400' : 'text-emerald-400'}`}>{stars}</span>
                   </div>
                   <p className="text-xl text-slate-400 font-bold mt-2 text-center">{t.stars}</p>
                </div>
                <button 
                  onClick={() => { ttsService.speak(t.history); setCurrentView(ExerciseType.HISTORY); }}
                  className="bg-slate-800 border-4 border-slate-700 p-6 rounded-[40px] text-4xl shadow-xl active:scale-95 focus-visible:ring-emerald-400"
                  aria-label={t.history}
                >
                  📜
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                 <button 
                  onClick={() => setCarouselIndex((carouselIndex - 1 + exercises.length) % exercises.length)} 
                  className="absolute -left-6 md:-left-12 z-20 bg-slate-800 border-4 border-emerald-500/40 w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center text-4xl shadow-2xl active:scale-90 focus-visible:ring-emerald-400 transition-all hover:bg-slate-700"
                  aria-label="Previous Exercise"
                 >
                   <span>{lang === 'he' ? '➡️' : '⬅️'}</span>
                   <span className="text-[10px] font-black uppercase text-emerald-500/70">{lang === 'he' ? 'עוד' : 'More'}</span>
                 </button>

                 <div className="w-full">
                    <button 
                      onClick={() => setCurrentView(currentExercise.id as any)}
                      className={`w-full bg-slate-900 border-4 ${currentExercise.color} p-8 rounded-[48px] shadow-2xl active:scale-95 flex flex-col items-center text-center transition-all focus-visible:ring-emerald-400 group relative overflow-hidden`}
                    >
                      <div className={`p-8 rounded-full text-7xl mb-6 ${currentExercise.bg} group-hover:scale-110 transition-transform relative z-10`}>
                        {currentExercise.icon}
                      </div>
                      <h2 className="text-4xl font-black mb-3 text-white relative z-10">{currentExercise.title}</h2>
                      <p className="text-2xl text-slate-400 font-bold relative z-10">{currentExercise.desc}</p>
                      <div className="mt-8 bg-emerald-600 text-white text-3xl font-black py-5 px-12 rounded-[28px] shadow-xl border-b-8 border-emerald-800 transition-all relative z-10">
                        {t.start}
                      </div>
                    </button>
                 </div>

                 <button 
                  onClick={() => setCarouselIndex((carouselIndex + 1) % exercises.length)} 
                  className="absolute -right-6 md:-right-12 z-20 bg-slate-800 border-4 border-emerald-500/40 w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center text-4xl shadow-2xl active:scale-90 focus-visible:ring-emerald-400 transition-all hover:bg-slate-700"
                  aria-label="Next Exercise"
                 >
                   <span>{lang === 'he' ? '⬅️' : '➡️'}</span>
                   <span className="text-[10px] font-black uppercase text-emerald-500/70">{lang === 'he' ? 'עוד' : 'More'}</span>
                 </button>
              </div>

              <div className="flex justify-center gap-3">
                 {exercises.map((_, i) => (
                   <div key={i} className={`h-3 rounded-full transition-all duration-300 ${i === carouselIndex ? 'w-10 bg-emerald-500' : 'w-3 bg-slate-800'}`}></div>
                 ))}
              </div>

              <NewsCard />
            </div>
          </Layout>
        );
    }
  };

  return <>{renderContent()}</>;
};

export default App;

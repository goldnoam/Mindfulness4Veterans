
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import BreathingExercise from './components/BreathingExercise';
import SensesExercise from './components/SensesExercise';
import GratitudeExercise from './components/GratitudeExercise';
import MeditationExercise from './components/MeditationExercise';
import VisualizationExercise from './components/VisualizationExercise';
import BodyScanExercise from './components/BodyScanExercise';
import MindfulEatingExercise from './components/MindfulEatingExercise';
import WalkingMeditationExercise from './components/WalkingMeditationExercise';
import HistoryView from './components/HistoryView';
import NewsCard from './components/NewsCard';
import { ExerciseType } from './types';
import { statsService } from './services/statsService';
import { translations, Language } from './translations';
import { ttsService } from './services/ttsService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ExerciseType>(ExerciseType.HOME);
  const [stars, setStars] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lang, setLang] = useState<Language>('he');

  useEffect(() => {
    setStars(statsService.getStars());
    // Listen for language changes from Layout (synced via localStorage in Layout)
    const interval = setInterval(() => {
      const storedLang = localStorage.getItem('lang') as Language;
      if (storedLang && storedLang !== lang) setLang(storedLang);
    }, 500);
    return () => clearInterval(interval);
  }, [lang]);

  // Refresh stars whenever we return to the Home screen
  useEffect(() => {
    if (currentView === ExerciseType.HOME) {
      setStars(statsService.getStars());
    }
  }, [currentView]);

  const t = translations[lang] || translations['he'];

  const exercises = [
    { id: ExerciseType.BREATHING, ...t.breathing, color: 'border-emerald-500', bg: 'bg-emerald-500/10' },
    { id: ExerciseType.SENSES, ...t.senses, color: 'border-blue-500', bg: 'bg-blue-500/10' },
    { id: ExerciseType.GRATITUDE, ...t.gratitude, color: 'border-amber-500', bg: 'bg-amber-500/10' },
    { id: ExerciseType.MEDITATION, ...t.meditation, color: 'border-purple-500', bg: 'bg-purple-500/10' },
    { id: ExerciseType.VISUALIZATION, ...t.visualization, color: 'border-cyan-500', bg: 'bg-cyan-500/10' },
    { id: ExerciseType.BODY_SCAN, ...t.bodyScan, color: 'border-indigo-500', bg: 'bg-indigo-500/10' },
    { id: ExerciseType.MINDFUL_EATING, ...t.eating, color: 'border-orange-500', bg: 'bg-orange-500/10' },
    { id: ExerciseType.WALKING_MEDITATION, ...t.walking, color: 'border-lime-500', bg: 'bg-lime-500/10' },
  ];

  const onExerciseComplete = () => {
    setCurrentView(ExerciseType.HOME);
  };

  const nextCarousel = () => {
    const nextIdx = (carouselIndex + 1) % exercises.length;
    setCarouselIndex(nextIdx);
    ttsService.speak(exercises[nextIdx].title);
  };

  const prevCarousel = () => {
    const prevIdx = (carouselIndex - 1 + exercises.length) % exercises.length;
    setCarouselIndex(prevIdx);
    ttsService.speak(exercises[prevIdx].title);
  };

  const isExerciseActive = currentView !== ExerciseType.HOME && currentView !== ExerciseType.HISTORY;

  const renderContent = () => {
    switch (currentView) {
      case ExerciseType.HISTORY:
        return (
          <Layout title={t.history} onBack={() => setCurrentView(ExerciseType.HOME)}>
            <HistoryView onBack={() => setCurrentView(ExerciseType.HOME)} />
          </Layout>
        );
      case ExerciseType.BREATHING:
        return (
          <Layout title={t.breathing.title} onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <BreathingExercise onComplete={onExerciseComplete} />
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
      case ExerciseType.HOME:
      default:
        const currentExercise = exercises[carouselIndex];
        return (
          <Layout title={t.title} isExerciseActive={false}>
            <div className="flex flex-col gap-8 w-full px-4 max-w-lg pb-10">
              
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-slate-900 border-2 border-slate-800 rounded-[40px] p-6 shadow-xl flex flex-col items-center">
                   <div className="flex items-center gap-4">
                      <span className="text-6xl star-animate" role="img" aria-label="star" key={stars}>⭐</span>
                      <span className="text-5xl font-bold text-emerald-400">{stars}</span>
                   </div>
                   <p className="text-xl text-slate-400 font-bold mt-2 text-center">{t.stars}</p>
                </div>
                <button 
                  onClick={() => setCurrentView(ExerciseType.HISTORY)}
                  className="bg-slate-800 border-4 border-slate-700 p-6 rounded-[40px] text-4xl shadow-xl active:scale-95 hover:border-emerald-500 transition-all flex items-center justify-center h-full"
                  aria-label={t.history}
                >
                  📜
                </button>
              </div>

              <div className="relative flex items-center justify-center group" role="region" aria-label="Exercise Carousel">
                 <button 
                  onClick={prevCarousel}
                  className="absolute -left-4 md:-left-16 z-20 bg-slate-800 border-2 border-slate-700 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-2xl active:scale-90 hover:border-emerald-500 transition-all focus-visible:ring-4 focus-visible:ring-emerald-400"
                  aria-label="Previous Exercise"
                 >
                   {lang === 'he' ? '➡️' : '⬅️'}
                 </button>

                 <div className="w-full transform transition-all duration-300">
                    <button 
                      onClick={() => { ttsService.speak(currentExercise.title); setCurrentView(currentExercise.id); }}
                      className={`w-full bg-slate-900 border-4 ${currentExercise.color} p-8 rounded-[48px] shadow-2xl active:scale-95 flex flex-col items-center text-center transition-all hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] focus-visible:ring-4 focus-visible:ring-emerald-400`}
                    >
                      <div className={`p-8 rounded-full text-7xl mb-6 ${currentExercise.bg}`} aria-hidden="true">
                        {currentExercise.icon}
                      </div>
                      <h2 className="text-4xl font-bold mb-3 text-white">{currentExercise.title}</h2>
                      <p className="text-2xl text-slate-400 font-medium">{currentExercise.desc}</p>
                      
                      <div className="mt-8 bg-emerald-600 text-white text-2xl font-bold py-4 px-10 rounded-2xl shadow-lg">
                        {t.start}
                      </div>
                    </button>
                 </div>

                 <button 
                  onClick={nextCarousel}
                  className="absolute -right-4 md:-right-16 z-20 bg-slate-800 border-2 border-slate-700 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-2xl active:scale-90 hover:border-emerald-500 transition-all focus-visible:ring-4 focus-visible:ring-emerald-400"
                  aria-label="Next Exercise"
                 >
                   {lang === 'he' ? '⬅️' : '➡️'}
                 </button>
              </div>

              <div className="flex justify-center gap-2" aria-hidden="true">
                {exercises.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-3 rounded-full transition-all duration-300 ${idx === carouselIndex ? 'w-10 bg-emerald-500' : 'w-3 bg-slate-800'}`}
                  ></div>
                ))}
              </div>

              <p className="text-2xl text-center text-slate-400 font-bold">
                {t.selectEx}
              </p>

              <NewsCard />
            </div>
          </Layout>
        );
    }
  };

  return <>{renderContent()}</>;
};

export default App;

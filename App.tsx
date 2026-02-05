
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
import { ExerciseType } from './types';
import { statsService } from './services/statsService';

const exercises = [
  { id: ExerciseType.BREATHING, title: 'נשימות', desc: 'להירגע ולהתמקד', icon: '🌬️', color: 'border-emerald-500', bg: 'bg-emerald-500/10' },
  { id: ExerciseType.SENSES, title: 'חושים', desc: 'להתחבר לכאן ועכשיו', icon: '👂', color: 'border-blue-500', bg: 'bg-blue-500/10' },
  { id: ExerciseType.GRATITUDE, title: 'תודה', desc: 'לחייך ולשמוח', icon: '🙏', color: 'border-amber-500', bg: 'bg-amber-500/10' },
  { id: ExerciseType.MEDITATION, title: 'מדיטציה', desc: 'שקט וריכוז פנימי', icon: '🧘', color: 'border-purple-500', bg: 'bg-purple-500/10' },
  { id: ExerciseType.VISUALIZATION, title: 'טיול בדמיון', desc: 'מסע למקום מרגיע', icon: '🌅', color: 'border-cyan-500', bg: 'bg-cyan-500/10' },
  { id: ExerciseType.BODY_SCAN, title: 'סריקת גוף', desc: 'שחרור מתחים מהראש לרגל', icon: '👤', color: 'border-indigo-500', bg: 'bg-indigo-500/10' },
  { id: ExerciseType.MINDFUL_EATING, title: 'אכילה מודעת', desc: 'להעריך את הטעם', icon: '🍎', color: 'border-orange-500', bg: 'bg-orange-500/10' },
  { id: ExerciseType.WALKING_MEDITATION, title: 'הליכה מודעת', desc: 'שלווה בכל צעד', icon: '🚶', color: 'border-lime-500', bg: 'bg-lime-500/10' },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ExerciseType>(ExerciseType.HOME);
  const [stars, setStars] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    setStars(statsService.getStars());
  }, [currentView]);

  const onExerciseComplete = () => {
    setCurrentView(ExerciseType.HOME);
  };

  const nextCarousel = () => {
    setCarouselIndex((prev) => (prev + 1) % exercises.length);
  };

  const prevCarousel = () => {
    setCarouselIndex((prev) => (prev - 1 + exercises.length) % exercises.length);
  };

  const isExerciseActive = currentView !== ExerciseType.HOME;

  const renderContent = () => {
    switch (currentView) {
      case ExerciseType.BREATHING:
        return (
          <Layout title="נשימות עמוקות" onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <BreathingExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.SENSES:
        return (
          <Layout title="חמשת החושים" onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <SensesExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.GRATITUDE:
        return (
          <Layout title="כרטיסי תודה" onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <GratitudeExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.MEDITATION:
        return (
          <Layout title="מדיטציה מודרכת" onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <MeditationExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.VISUALIZATION:
        return (
          <Layout title="טיול בדמיון" onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <VisualizationExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.BODY_SCAN:
        return (
          <Layout title="סריקת גוף" onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <BodyScanExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.MINDFUL_EATING:
        return (
          <Layout title="אכילה מודעת" onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <MindfulEatingExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.WALKING_MEDITATION:
        return (
          <Layout title="הליכה מודעת" onBack={() => setCurrentView(ExerciseType.HOME)} isExerciseActive={isExerciseActive}>
            <WalkingMeditationExercise onComplete={onExerciseComplete} />
          </Layout>
        );
      case ExerciseType.HOME:
      default:
        const currentExercise = exercises[carouselIndex];
        return (
          <Layout title="רגע של שלווה" isExerciseActive={false}>
            <div className="flex flex-col gap-10 w-full px-4 max-w-lg pb-10">
              
              <div className="bg-slate-900 border-2 border-slate-800 rounded-[40px] p-6 shadow-xl flex flex-col items-center">
                 <div className="flex items-center gap-4">
                    <span className="text-6xl star-animate">⭐</span>
                    <span className="text-5xl font-bold text-emerald-400">{stars}</span>
                 </div>
                 <p className="text-xl text-slate-400 font-bold mt-2">כוכבי שלווה שצברת</p>
              </div>

              <div className="relative flex items-center justify-center group">
                 <button 
                  onClick={prevCarousel}
                  className="absolute left-[-20px] md:left-[-60px] z-20 bg-slate-800 border-2 border-slate-700 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-2xl active:scale-90 hover:border-emerald-500 transition-all"
                  aria-label="הקודם"
                 >
                   ➡️
                 </button>

                 <div className="w-full transform transition-all duration-300">
                    <button 
                      onClick={() => setCurrentView(currentExercise.id)}
                      className={`w-full bg-slate-900 border-4 ${currentExercise.color} p-8 rounded-[48px] shadow-2xl active:scale-95 flex flex-col items-center text-center transition-all hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]`}
                    >
                      <div className={`p-8 rounded-full text-7xl mb-6 ${currentExercise.bg}`}>
                        {currentExercise.icon}
                      </div>
                      <h2 className="text-4xl font-bold mb-3 text-white">{currentExercise.title}</h2>
                      <p className="text-2xl text-slate-400 font-medium">{currentExercise.desc}</p>
                      
                      <div className="mt-8 bg-emerald-600 text-white text-2xl font-bold py-4 px-10 rounded-2xl shadow-lg">
                        התחל עכשיו
                      </div>
                    </button>
                 </div>

                 <button 
                  onClick={nextCarousel}
                  className="absolute right-[-20px] md:right-[-60px] z-20 bg-slate-800 border-2 border-slate-700 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-2xl active:scale-90 hover:border-emerald-500 transition-all"
                  aria-label="הבא"
                 >
                   ⬅️
                 </button>
              </div>

              <div className="flex justify-center gap-2">
                {exercises.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-3 rounded-full transition-all duration-300 ${idx === carouselIndex ? 'w-10 bg-emerald-500' : 'w-3 bg-slate-800'}`}
                  ></div>
                ))}
              </div>

              <p className="text-2xl text-center text-slate-400 font-bold">
                בחרו תרגיל כדי להתחיל
              </p>
            </div>
          </Layout>
        );
    }
  };

  return <>{renderContent()}</>;
};

export default App;


import React, { useState } from 'react';
import MusicPlayer from './MusicPlayer';

interface LayoutProps {
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
  isExerciseActive?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ title, onBack, children, isExerciseActive }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-950 text-slate-100 p-4 md:p-8 transition-all ${isExerciseActive ? 'overflow-hidden' : ''}`}>
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {onBack ? (
            <button 
              onClick={onBack}
              className="bg-slate-800 border-2 border-emerald-500 text-emerald-400 px-6 py-3 rounded-2xl text-2xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              חזרה
            </button>
          ) : (
            <div className="hidden md:block w-24"></div>
          )}
          <h1 className="text-3xl md:text-5xl font-bold text-emerald-400 text-center flex-1">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleFullscreen}
            className="bg-slate-800 border-2 border-slate-700 p-3 rounded-2xl text-xl hover:border-emerald-500 transition-all"
            title="מסך מלא"
          >
            {isFullscreen ? '📺' : '🖥️'}
          </button>
          <MusicPlayer />
        </div>
      </header>
      
      <main className={`flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full transition-all ${isExerciseActive ? 'py-0' : 'py-4'}`}>
        {children}
      </main>
      
      {!isExerciseActive && (
        <footer className="mt-12 py-8 border-t border-slate-800 text-center flex flex-col gap-2">
          <p className="text-slate-500 text-lg">
            (C) Noam Gold AI 2026
          </p>
          <div className="flex items-center justify-center gap-4 text-slate-400 font-bold">
            <span>שלחו משוב:</span>
            <a href="mailto:goldnoamai@gmail.com" className="text-emerald-500 hover:underline decoration-emerald-500/30">
              goldnoamai@gmail.com
            </a>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;

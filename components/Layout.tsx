
import React, { useState, useEffect } from 'react';
import MusicPlayer from './MusicPlayer';
import { translations, Language } from '../translations';
import { ttsService } from '../services/ttsService';

interface LayoutProps {
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
  isExerciseActive?: boolean;
}

type FontSize = 'text-base' | 'text-xl' | 'text-3xl';

const Layout: React.FC<LayoutProps> = ({ title, onBack, children, isExerciseActive }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lang, setLang] = useState<Language>((localStorage.getItem('lang') as Language) || 'he');
  const [fontSize, setFontSize] = useState<FontSize>((localStorage.getItem('fontSize') as FontSize) || 'text-xl');
  const [showSettings, setShowSettings] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    ttsService.setLanguage(lang);
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const speakButton = (text: string) => {
    ttsService.speak(text);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-950 text-slate-100 p-4 md:p-8 transition-all ${isExerciseActive ? 'overflow-hidden' : ''} ${fontSize}`}>
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {onBack ? (
            <button 
              onClick={() => { speakButton(t.back); onBack(); }}
              aria-label={t.back}
              className="bg-slate-800 border-2 border-emerald-500 text-emerald-400 px-6 py-3 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              {t.back}
            </button>
          ) : (
            <button 
              onClick={() => { speakButton(t.settings); setShowSettings(!showSettings); }}
              className="bg-slate-800 border-2 border-slate-700 p-3 rounded-2xl text-2xl hover:border-emerald-500 transition-all"
              aria-label={t.settings}
            >
              ⚙️
            </button>
          )}
          <h1 className="text-3xl md:text-5xl font-bold text-emerald-400 text-center flex-1">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleFullscreen}
            className="bg-slate-800 border-2 border-slate-700 p-3 rounded-2xl text-xl hover:border-emerald-500 transition-all"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? '📺' : '🖥️'}
          </button>
          <MusicPlayer />
        </div>
      </header>

      {showSettings && !onBack && (
        <div className="bg-slate-900 border-2 border-slate-800 p-6 rounded-[40px] mb-8 shadow-2xl flex flex-col gap-6" role="region" aria-label={t.settings}>
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-bold text-emerald-400">{t.fontSize}</h3>
            <div className="flex gap-4 flex-wrap">
              {(['text-base', 'text-xl', 'text-3xl'] as FontSize[]).map((size, idx) => {
                const labels = [t.small, t.medium, t.large];
                return (
                  <button 
                    key={size}
                    onClick={() => { setFontSize(size); speakButton(labels[idx]); }}
                    className={`px-6 py-2 rounded-xl border-2 transition-all ${fontSize === size ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700'}`}
                  >
                    {labels[idx]}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-bold text-emerald-400">Language</h3>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(translations) as Language[]).map((l) => (
                <button 
                  key={l}
                  onClick={() => { setLang(l); speakButton(translations[l].langName); }}
                  className={`px-4 py-2 rounded-xl border-2 transition-all ${lang === l ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700'}`}
                >
                  {translations[l].langName}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <main className={`flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full transition-all ${isExerciseActive ? 'py-0' : 'py-4'}`}>
        {children}
      </main>
      
      {!isExerciseActive && (
        <footer className="mt-12 py-8 border-t border-slate-800 text-center flex flex-col gap-2">
          <p className="text-slate-500 text-lg">
            (C) Noam Gold AI 2026
          </p>
          <div className="flex items-center justify-center gap-4 text-slate-400 font-bold">
            <span>{t.feedback}:</span>
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

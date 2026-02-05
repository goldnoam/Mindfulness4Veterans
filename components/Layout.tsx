
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

type FontSizeClass = 'text-lg' | 'text-2xl' | 'text-4xl';

const Layout: React.FC<LayoutProps> = ({ title, onBack, children, isExerciseActive }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lang, setLang] = useState<Language>((localStorage.getItem('lang') as Language) || 'he');
  const [fontSize, setFontSize] = useState<FontSizeClass>((localStorage.getItem('fontSize') as FontSizeClass) || 'text-2xl');
  const [showSettings, setShowSettings] = useState(false);

  const t = translations[lang] || translations['he'];

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
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const speakText = (text: string) => {
    ttsService.speak(text);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-950 text-slate-100 p-4 md:p-8 transition-all selection:bg-emerald-500/30 ${isExerciseActive ? 'overflow-hidden' : ''} ${fontSize}`}>
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-6 w-full md:w-auto">
          {onBack ? (
            <button 
              onClick={() => { speakText(t.back); onBack(); }}
              aria-label={t.back}
              className="bg-slate-800 border-4 border-emerald-500 text-emerald-400 px-8 py-4 rounded-3xl font-bold shadow-2xl active:scale-95 transition-all hover:bg-slate-700"
            >
              {t.back}
            </button>
          ) : (
            <button 
              onClick={() => { speakText(t.settings); setShowSettings(!showSettings); }}
              className={`bg-slate-800 border-4 ${showSettings ? 'border-emerald-500' : 'border-slate-700'} p-5 rounded-3xl text-4xl transition-all shadow-2xl active:scale-95 hover:bg-slate-700`}
              aria-label={t.settings}
            >
              ⚙️
            </button>
          )}
          <h1 className="text-4xl md:text-6xl font-extrabold text-emerald-400 text-center flex-1 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleFullscreen}
            className="bg-slate-800 border-4 border-slate-700 p-5 rounded-3xl text-3xl hover:border-emerald-500 transition-all shadow-xl active:scale-95"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? '📺' : '🖥️'}
          </button>
          <MusicPlayer />
        </div>
      </header>

      {showSettings && !onBack && (
        <div className="bg-slate-900 border-4 border-slate-800 p-10 rounded-[56px] mb-10 shadow-2xl flex flex-col gap-10 animate-in fade-in slide-in-from-top-6 duration-300" role="region" aria-label={t.settings}>
          <div className="flex flex-col gap-5">
            <h3 className="text-3xl md:text-4xl font-bold text-emerald-400 border-b-2 border-emerald-500/20 pb-2">{t.fontSize}</h3>
            <div className="flex gap-6 flex-wrap">
              {(['text-lg', 'text-2xl', 'text-4xl'] as FontSizeClass[]).map((size, idx) => {
                const labels = [t.small, t.medium, t.large];
                return (
                  <button 
                    key={size}
                    onClick={() => { setFontSize(size); speakText(labels[idx]); }}
                    className={`px-10 py-5 rounded-2xl border-4 transition-all text-2xl font-black ${fontSize === size ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20 shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    {labels[idx]}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <h3 className="text-3xl md:text-4xl font-bold text-emerald-400 border-b-2 border-emerald-500/20 pb-2">Language</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(Object.keys(translations) as Language[]).map((l) => (
                <button 
                  key={l}
                  onClick={() => { setLang(l); speakText(translations[l].langName); }}
                  className={`px-6 py-5 rounded-2xl border-4 transition-all text-xl font-black ${lang === l ? 'bg-emerald-500 border-emerald-400 text-white shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  {translations[l].langName}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <main className={`flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full transition-all ${isExerciseActive ? 'py-0' : 'py-6'}`}>
        {children}
      </main>
      
      {!isExerciseActive && (
        <footer className="mt-16 py-12 border-t-4 border-slate-800 text-center flex flex-col gap-6">
          <p className="text-slate-500 text-2xl font-bold tracking-wide">
            (C) Noam Gold AI 2026
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-slate-400 text-xl font-bold">
            <span>{t.feedback}:</span>
            <a href="mailto:goldnoamai@gmail.com" className="bg-slate-800 px-10 py-4 rounded-2xl text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all border-4 border-emerald-500/30 shadow-lg">
              goldnoamai@gmail.com
            </a>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;

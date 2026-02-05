
import React, { useState, useEffect } from 'react';
import MusicPlayer from './MusicPlayer';
import AmbientSelector from './AmbientSelector';
import AdBanner from './AdBanner';
import { translations, Language } from '../translations';
import { ttsService } from '../services/ttsService';

interface LayoutProps {
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
  isExerciseActive?: boolean;
}

type FontSizeClass = 'font-scale-small' | 'font-scale-medium' | 'font-scale-large';
type ThemeType = 'dark' | 'light';

const Layout: React.FC<LayoutProps> = ({ title, onBack, children, isExerciseActive }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lang, setLang] = useState<Language>((localStorage.getItem('lang') as Language) || 'he');
  const [fontSize, setFontSize] = useState<FontSizeClass>((localStorage.getItem('fontSize') as FontSizeClass) || 'font-scale-medium');
  const [theme, setTheme] = useState<ThemeType>((localStorage.getItem('theme') as ThemeType) || 'dark');
  const [showSettings, setShowSettings] = useState(false);

  const t = translations[lang] || translations['he'];

  const langFlags: Record<Language, string> = {
    he: '🇮🇱',
    en: '🇺🇸',
    zh: '🇨🇳',
    hi: '🇮🇳',
    de: '🇩🇪',
    es: '🇪🇸',
    fr: '🇫🇷'
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    ttsService.setLanguage(lang);
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    // Apply font size scale globally
    root.classList.remove('font-scale-small', 'font-scale-medium', 'font-scale-large');
    root.classList.add(fontSize);
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.documentElement.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    ttsService.speak(nextTheme === 'dark' ? t.dark : t.light);
  };

  return (
    <div className={`min-h-screen flex flex-col p-4 md:p-8 transition-all selection:bg-emerald-500/30 ${isExerciseActive ? 'overflow-hidden' : ''} ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-6 w-full md:w-auto">
          {onBack ? (
            <button 
              onClick={() => { ttsService.speak(t.back); onBack(); }}
              aria-label={t.back}
              className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border-4 border-emerald-500 text-emerald-600 px-8 py-4 rounded-3xl font-bold shadow-2xl active:scale-95 transition-all hover:opacity-80`}
            >
              {t.back}
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => { ttsService.speak(t.settings); setShowSettings(!showSettings); }}
                className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border-4 ${showSettings ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'border-slate-300'} p-5 rounded-3xl text-4xl transition-all shadow-2xl active:scale-95 hover:opacity-80`}
                aria-label={t.settings}
              >
                ⚙️
              </button>
              <button 
                onClick={toggleTheme}
                className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border-4 border-slate-300 p-5 rounded-3xl text-3xl hover:border-emerald-500 transition-all shadow-xl active:scale-95`}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </button>
            </div>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-emerald-500 text-center flex-1 drop-shadow-sm px-2">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <AmbientSelector />
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleFullscreen}
              className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border-4 border-slate-300 p-5 rounded-3xl text-3xl hover:border-emerald-500 transition-all shadow-xl active:scale-95`}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? '📺' : '🖥️'}
            </button>
            <MusicPlayer />
          </div>
        </div>
      </header>

      {showSettings && (
        <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-4 p-8 rounded-[56px] mb-10 shadow-2xl flex flex-col gap-10 animate-in fade-in slide-in-from-top-6 duration-300`} role="region" aria-label={t.settings}>
          <div className="flex flex-col gap-5">
            <h3 className="text-3xl md:text-4xl font-bold text-emerald-500 border-b-2 border-emerald-500/20 pb-2">{t.fontSize}</h3>
            <div className="flex gap-6 flex-wrap">
              {(['font-scale-small', 'font-scale-medium', 'font-scale-large'] as FontSizeClass[]).map((size, idx) => {
                const labels = [t.small, t.medium, t.large];
                return (
                  <button 
                    key={size}
                    onClick={() => { setFontSize(size); ttsService.speak(labels[idx]); }}
                    className={`px-10 py-5 rounded-2xl border-4 transition-all text-2xl font-black flex-1 min-w-[150px] ${fontSize === size ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20 shadow-xl scale-105' : theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                  >
                    {labels[idx]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h3 className="text-3xl md:text-4xl font-bold text-emerald-500 border-b-2 border-emerald-500/20 pb-2">Language</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {(Object.keys(translations) as Language[]).map((l) => (
                <button 
                  key={l}
                  onClick={() => { setLang(l); ttsService.speak(translations[l].langName); }}
                  className={`flex flex-col items-center gap-2 px-6 py-5 rounded-2xl border-4 transition-all text-xl font-black ${lang === l ? 'bg-emerald-500 border-emerald-400 text-white shadow-xl scale-105' : theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                >
                  <span className="text-4xl" aria-hidden="true">{langFlags[l]}</span>
                  <span className="text-base">{translations[l].langName}</span>
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => setShowSettings(false)}
            className="mt-4 bg-emerald-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-emerald-800"
          >
            {t.done}
          </button>
        </div>
      )}
      
      <main className={`flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full transition-all ${isExerciseActive ? 'py-0' : 'py-6'}`}>
        {children}
      </main>
      
      {!isExerciseActive && (
        <footer className={`mt-16 py-12 border-t-4 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} text-center flex flex-col gap-6`}>
          <AdBanner slot="footer-ad" />
          <p className="text-slate-500 text-2xl font-bold tracking-wide">
            (C) Noam Gold AI 2026
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-slate-400 text-xl font-bold">
            <span>{t.feedback}:</span>
            <a href="mailto:goldnoamai@gmail.com" className={`px-10 py-4 rounded-2xl text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all border-4 border-emerald-500/30 shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
              goldnoamai@gmail.com
            </a>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;

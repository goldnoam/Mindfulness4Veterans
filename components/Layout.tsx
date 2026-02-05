
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
    he: '🇮🇱', en: '🇺🇸', zh: '🇨🇳', hi: '🇮🇳', de: '🇩🇪', es: '🇪🇸', fr: '🇫🇷'
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    ttsService.setLanguage(lang);
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
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
    <div className={`min-h-screen flex flex-col p-2 md:p-6 transition-all selection:bg-emerald-500/30 ${isExerciseActive ? 'overflow-hidden' : ''} ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className="sticky top-0 z-40 w-full mb-6">
        <div className={`flex items-center gap-3 overflow-x-auto no-scrollbar py-3 px-2 rounded-[32px] ${theme === 'dark' ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-md border-b-4 border-emerald-500/20 shadow-xl`}>
          {onBack ? (
            <button 
              onClick={() => { ttsService.speak(t.back); onBack(); }}
              className="flex-shrink-0 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-xl shadow-lg active:scale-90"
            >
              {t.back}
            </button>
          ) : (
            <>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-slate-800 border-4 border-slate-700 rounded-2xl text-3xl shadow-lg active:scale-90"
                aria-label={t.settings}
              >
                ⚙️
              </button>
              <button 
                onClick={toggleTheme}
                className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-slate-800 border-4 border-slate-700 rounded-2xl text-3xl shadow-lg active:scale-90"
                aria-label="Theme"
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </button>
            </>
          )}

          <div className="flex-1 min-w-[120px] text-center overflow-hidden">
            <h1 className="text-2xl md:text-3xl font-black text-emerald-500 truncate px-2">
              {title}
            </h1>
          </div>

          <AmbientSelector />

          <button 
            onClick={toggleFullscreen}
            className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-slate-800 border-4 border-slate-700 rounded-2xl text-3xl shadow-lg active:scale-90"
          >
            {isFullscreen ? '📺' : '🖥️'}
          </button>
          
          <MusicPlayer />
        </div>
      </header>

      {showSettings && (
        <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-4 p-8 rounded-[48px] mb-6 shadow-2xl flex flex-col gap-8 animate-in slide-in-from-top-4 duration-300`}>
          <div className="flex flex-col gap-4">
            <h3 className="text-3xl font-bold text-emerald-500">{t.fontSize}</h3>
            <div className="flex gap-4">
              {(['font-scale-small', 'font-scale-medium', 'font-scale-large'] as FontSizeClass[]).map((size, idx) => {
                const labels = [t.small, t.medium, t.large];
                return (
                  <button key={size} onClick={() => setFontSize(size)} className={`flex-1 py-5 rounded-2xl border-4 text-xl font-bold ${fontSize === size ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                    {labels[idx]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-3xl font-bold text-emerald-500">Language</h3>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {(Object.keys(translations) as Language[]).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`flex-shrink-0 flex flex-col items-center p-4 rounded-2xl border-4 ${lang === l ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                  <span className="text-3xl">{langFlags[l]}</span>
                  <span className="text-sm font-bold">{translations[l].langName}</span>
                </button>
              ))}
            </div>
          </div>
          
          <button onClick={() => setShowSettings(false)} className="bg-emerald-600 text-white text-3xl font-bold py-6 rounded-3xl shadow-xl border-b-8 border-emerald-800">
            {t.done}
          </button>
        </div>
      )}
      
      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
        {children}
      </main>
      
      {!isExerciseActive && (
        <footer className="mt-12 py-8 border-t-4 border-emerald-500/10 text-center flex flex-col gap-4 opacity-60">
          <p className="text-xl font-bold tracking-wide">© Noam Gold AI 2026</p>
        </footer>
      )}
    </div>
  );
};

export default Layout;

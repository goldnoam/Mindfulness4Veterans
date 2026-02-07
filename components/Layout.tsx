
import React, { useState, useEffect } from 'react';
import AdBanner from './AdBanner';
import { translations, Language } from '../translations';
import { ttsService } from '../services/ttsService';
import { mindfulMomentsService, MomentsInterval } from '../services/mindfulMomentsService';
import MindfulMomentsPrompt from './MindfulMomentsPrompt';

interface LayoutProps {
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
  isExerciseActive?: boolean;
}

type ThemeType = 'dark' | 'light';

const Layout: React.FC<LayoutProps> = ({ title, onBack, children, isExerciseActive }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lang, setLang] = useState<Language>((localStorage.getItem('lang') as Language) || 'he');
  const [theme, setTheme] = useState<ThemeType>((localStorage.getItem('theme') as ThemeType) || 'dark');
  const [showSettings, setShowSettings] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [momentsInterval, setMomentsInterval] = useState<MomentsInterval>(mindfulMomentsService.getInterval());

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
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.documentElement.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  useEffect(() => {
    // Initialize Mindful Moments Service
    mindfulMomentsService.init((prompt) => {
      setActivePrompt(prompt);
    });
  }, []);

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

  const updateMomentsInterval = (val: MomentsInterval) => {
    setMomentsInterval(val);
    mindfulMomentsService.setInterval(val);
    
    let label = t.mindfulMoments.off;
    if (val === '1h') label = t.mindfulMoments.every1h;
    if (val === '2h') label = t.mindfulMoments.every2h;
    if (val === '4h') label = t.mindfulMoments.every4h;
    
    ttsService.speak(`${t.mindfulMoments.title}: ${label}`);
  };

  return (
    <div className={`min-h-screen flex flex-col p-2 md:p-6 transition-all selection:bg-emerald-500/30 ${isExerciseActive ? 'overflow-hidden' : ''} ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className="sticky top-0 z-40 w-full mb-6" role="banner">
        <div className={`flex items-center gap-3 py-3 px-4 rounded-[32px] ${theme === 'dark' ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-md border-b-4 border-emerald-500/20 shadow-xl`}>
          {onBack ? (
            <button 
              onClick={() => { ttsService.speak(t.back); onBack(); }}
              className="flex-shrink-0 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-xl shadow-lg active:scale-90 focus-visible:ring-emerald-400"
              aria-label={t.back}
            >
              {t.back}
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => { ttsService.speak(t.settings); setShowSettings(!showSettings); }}
                className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'} border-4 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-2xl text-3xl shadow-lg active:scale-90 focus-visible:ring-emerald-400`}
                aria-label={t.settings}
                aria-expanded={showSettings}
              >
                ⚙️
              </button>
              <button 
                onClick={toggleTheme}
                className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'} border-4 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-2xl text-3xl shadow-lg active:scale-90 focus-visible:ring-emerald-400`}
                aria-label={theme === 'dark' ? t.light : t.dark}
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </button>
            </div>
          )}

          <div className="flex-1 text-center overflow-hidden">
            <h1 className="text-xl md:text-3xl font-black text-emerald-500 truncate px-2 drop-shadow-sm">
              {title}
            </h1>
          </div>

          <button 
            onClick={toggleFullscreen}
            className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'} border-4 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-2xl text-3xl shadow-lg active:scale-90 focus-visible:ring-emerald-400`}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? '📺' : '🖥️'}
          </button>
        </div>
      </header>

      {showSettings && (
        <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]' : 'bg-white border-slate-200 shadow-xl'} border-4 p-8 rounded-[48px] mb-6 animate-in slide-in-from-top-4 duration-300 z-50 relative`} role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <h2 id="settings-title" className="text-3xl font-black text-emerald-500 mb-6">{t.settings}</h2>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-bold text-slate-400 uppercase tracking-widest">{t.mindfulMoments.title}</h3>
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {(['off', '1h', '2h', '4h'] as MomentsInterval[]).map((val) => {
                  const labels = [t.mindfulMoments.off, t.mindfulMoments.every1h, t.mindfulMoments.every2h, t.mindfulMoments.every4h];
                  const idx = ['off', '1h', '2h', '4h'].indexOf(val);
                  return (
                    <button 
                      key={val} 
                      onClick={() => updateMomentsInterval(val)} 
                      className={`flex-shrink-0 px-6 py-4 rounded-[28px] border-4 transition-all font-black text-xl ${momentsInterval === val ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' : theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                      aria-pressed={momentsInterval === val}
                    >
                      {labels[idx]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-bold text-slate-400 uppercase tracking-widest">Language / שפה</h3>
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {(Object.keys(translations) as Language[]).map((l) => (
                  <button 
                    key={l} 
                    onClick={() => setLang(l)} 
                    className={`flex-shrink-0 flex flex-col items-center gap-2 p-5 rounded-[28px] border-4 transition-all ${lang === l ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg scale-105' : theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                    aria-pressed={lang === l}
                  >
                    <span className="text-4xl" aria-hidden="true">{langFlags[l]}</span>
                    <span className="text-sm font-black">{translations[l].langName}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setShowSettings(false)} 
              className="bg-emerald-600 text-white text-3xl font-black py-6 rounded-3xl shadow-xl border-b-8 border-emerald-800 active:scale-95 transition-all"
            >
              {t.done}
            </button>
          </div>
        </div>
      )}
      
      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full px-4" role="main">
        {children}
      </main>

      {activePrompt && (
        <MindfulMomentsPrompt 
          prompt={activePrompt} 
          onClose={() => setActivePrompt(null)} 
        />
      )}
      
      {!isExerciseActive && (
        <footer className="mt-12 py-10 border-t-4 border-emerald-500/10 text-center flex flex-col gap-4" role="contentinfo">
          <p className="text-xl font-bold tracking-widest opacity-40">© Noam Gold AI 2026</p>
        </footer>
      )}
    </div>
  );
};

export default Layout;

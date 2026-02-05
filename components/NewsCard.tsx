
import React from 'react';
import ShareButton from './ShareButton';
import { translations, Language } from '../translations';

const NewsCard: React.FC = () => {
  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const theme = localStorage.getItem('theme') || 'dark';
  const t = translations[lang] || translations['he'];

  return (
    <div className={`w-full max-w-lg mx-auto mt-6 p-8 rounded-[48px] border-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-2xl transition-all`}>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-5xl" role="img" aria-label="News Icon">📰</span>
        <h3 className="text-3xl font-black text-emerald-500">{t.dailyInspiration}</h3>
      </div>
      
      <p className={`text-2xl font-medium leading-relaxed mb-8 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
        {t.newsTip}
      </p>

      <div className="flex justify-center">
        <ShareButton text={`${t.dailyInspiration}: ${t.newsTip}`} className="w-full justify-center" />
      </div>
    </div>
  );
};

export default NewsCard;


import React from 'react';
import { translations, Language } from '../translations';

interface Props {
  text: string;
  className?: string;
}

const ShareButton: React.FC<Props> = ({ text, className }) => {
  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang];

  const handleShare = async () => {
    const shareData = {
      title: t.title,
      text: text,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      const mailtoLink = `mailto:?subject=${encodeURIComponent(t.title)}&body=${encodeURIComponent(text + '\n\n' + window.location.href)}`;
      window.location.href = mailtoLink;
    }
  };

  return (
    <button 
      onClick={handleShare}
      className={`flex items-center gap-4 bg-slate-800 border-4 border-emerald-500/50 text-emerald-400 px-10 py-5 rounded-3xl text-2xl font-bold shadow-2xl active:scale-95 hover:bg-slate-700 transition-all ${className}`}
    >
      <span>{t.share}</span>
      <span className="text-3xl">📤</span>
    </button>
  );
};

export default ShareButton;

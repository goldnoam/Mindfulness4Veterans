
import React from 'react';
import { translations, Language } from '../translations';
import { ttsService } from '../services/ttsService';

interface Props {
  prompt: string;
  onClose: () => void;
}

const MindfulMomentsPrompt: React.FC<Props> = ({ prompt, onClose }) => {
  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang] || translations['he'];

  React.useEffect(() => {
    ttsService.speak(`${t.mindfulMoments.promptTitle}. ${prompt}`);
  }, [prompt, t.mindfulMoments.promptTitle]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" role="alertdialog" aria-labelledby="moment-title">
      <div className="bg-slate-900 border-4 border-emerald-500 p-8 md:p-12 rounded-[56px] shadow-2xl max-w-lg w-full text-center animate-in zoom-in-95 duration-300">
        <div className="text-7xl mb-6" aria-hidden="true">✨</div>
        <h2 id="moment-title" className="text-3xl md:text-4xl font-black text-emerald-400 mb-6">
          {t.mindfulMoments.promptTitle}
        </h2>
        <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed mb-10">
          {prompt}
        </p>
        <button 
          onClick={onClose}
          className="w-full bg-emerald-600 text-white text-3xl font-black py-6 rounded-3xl shadow-xl border-b-8 border-emerald-800 active:scale-95 transition-all focus-visible:ring-emerald-400"
        >
          {t.mindfulMoments.close}
        </button>
      </div>
    </div>
  );
};

export default MindfulMomentsPrompt;

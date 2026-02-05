
import React, { useState } from 'react';
import { statsService, HistoryEntry } from '../services/statsService';
import { translations, Language } from '../translations';
import { ttsService } from '../services/ttsService';

interface Props {
  onBack: () => void;
}

const HistoryView: React.FC<Props> = ({ onBack }) => {
  const [history, setHistory] = useState<HistoryEntry[]>(statsService.getHistory());
  const lang = (localStorage.getItem('lang') as Language) || 'he';
  const t = translations[lang];

  const handleClear = () => {
    if (confirm(t.clearHistory + '?')) {
      statsService.clearHistory();
      setHistory([]);
      ttsService.speak(t.clearHistory);
    }
  };

  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} ${t.sec}`;
    const mins = Math.floor(seconds / 60);
    return `${mins} ${t.min}`;
  };

  return (
    <div className="w-full max-w-2xl px-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-4xl font-bold text-emerald-400">{t.history}</h2>
        {history.length > 0 && (
          <button 
            onClick={handleClear}
            className="text-xl text-red-400 underline font-bold active:scale-95"
          >
            {t.clearHistory}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-slate-900/50 border-4 border-dashed border-slate-800 p-16 rounded-[48px] text-center">
          <p className="text-2xl text-slate-500 font-bold">{t.historyEmpty}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {history.map((entry) => (
            <div 
              key={entry.id}
              className="bg-slate-900 border-2 border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-lg"
              role="listitem"
            >
              <div className="flex items-center gap-6">
                <span className="text-5xl" aria-hidden="true">{entry.icon}</span>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">{entry.type}</span>
                  <span className="text-lg text-slate-400 font-medium">{formatDate(entry.date)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xl font-bold text-emerald-400 tabular-nums">
                  {formatDuration(entry.durationSeconds)}
                </span>
                <span className="text-sm text-slate-600 font-bold uppercase tracking-wider">{t.duration}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={onBack}
        className="mt-4 bg-emerald-600 text-white text-2xl font-bold py-6 rounded-3xl shadow-xl active:scale-95 border-b-8 border-emerald-800"
      >
        {t.back}
      </button>
    </div>
  );
};

export default HistoryView;

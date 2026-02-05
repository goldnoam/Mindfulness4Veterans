
import React from 'react';

interface Props {
  text: string;
  className?: string;
}

const ShareButton: React.FC<Props> = ({ text, className }) => {
  const handleShare = async () => {
    const shareData = {
      title: 'רגע של שלווה',
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
      // Fallback to mail
      const mailtoLink = `mailto:?subject=${encodeURIComponent('הישג חדש ב-רגע של שלווה')}&body=${encodeURIComponent(text + '\n\nבדקו את האפליקציה כאן: ' + window.location.href)}`;
      window.location.href = mailtoLink;
    }
  };

  return (
    <button 
      onClick={handleShare}
      className={`flex items-center gap-3 bg-slate-800 border-2 border-emerald-500/50 text-emerald-400 px-8 py-4 rounded-2xl text-xl font-bold shadow-lg active:scale-95 hover:bg-slate-700 transition-all ${className}`}
    >
      <span>שתפו חברים</span>
      <span className="text-2xl">📤</span>
    </button>
  );
};

export default ShareButton;

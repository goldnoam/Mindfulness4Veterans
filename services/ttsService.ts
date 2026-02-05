
import { Language } from '../translations';

class TTSService {
  private synth: SpeechSynthesis;
  private currentLang: Language = 'he';
  private isMuted: boolean = false;

  private langMap: Record<Language, string> = {
    he: 'he-IL',
    en: 'en-US',
    zh: 'zh-CN',
    hi: 'hi-IN',
    de: 'de-DE',
    es: 'es-ES',
    fr: 'fr-FR'
  };

  constructor() {
    this.synth = window.speechSynthesis;
  }

  setLanguage(lang: Language) {
    this.currentLang = lang;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.synth.cancel();
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  speak(text: string, onEnd?: () => void) {
    if (this.isMuted) {
      if (onEnd) onEnd();
      return;
    }
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.langMap[this.currentLang];
    utterance.rate = 0.85; 

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synth.speak(utterance);
  }

  stop() {
    this.synth.cancel();
  }
}

export const ttsService = new TTSService();


import { audioService } from './audioService';

const MOMENTS_INTERVAL_KEY = 'mindful_moments_interval';
const LAST_MOMENT_TIME_KEY = 'last_mindful_moment_time';

export type MomentsInterval = 'off' | '1h' | '2h' | '4h';

class MindfulMomentsService {
  private timer: number | null = null;
  private onTriggerCallback: ((prompt: string) => void) | null = null;

  init(callback: (prompt: string) => void) {
    this.onTriggerCallback = callback;
    this.startTimer();
  }

  setInterval(val: MomentsInterval) {
    localStorage.setItem(MOMENTS_INTERVAL_KEY, val);
    this.startTimer();
  }

  getInterval(): MomentsInterval {
    return (localStorage.getItem(MOMENTS_INTERVAL_KEY) as MomentsInterval) || 'off';
  }

  private startTimer() {
    if (this.timer) window.clearInterval(this.timer);
    
    const interval = this.getInterval();
    if (interval === 'off') return;

    // Check every minute if it's time
    this.timer = window.setInterval(() => {
      this.checkTime();
    }, 60000);
  }

  private checkTime() {
    const interval = this.getInterval();
    if (interval === 'off') return;

    const intervalMs = parseInt(interval) * 60 * 60 * 1000;
    const lastTime = parseInt(localStorage.getItem(LAST_MOMENT_TIME_KEY) || '0');
    const now = Date.now();

    if (now - lastTime >= intervalMs) {
      this.triggerMoment();
    }
  }

  private triggerMoment() {
    localStorage.setItem(LAST_MOMENT_TIME_KEY, Date.now().toString());
    audioService.playClickSound(); // Gentle notification sound
    
    // Get language and translations (simplified access for service)
    const lang = localStorage.getItem('lang') || 'he';
    // We import translations here to avoid circular dependencies if needed, 
    // but assuming simple structure for now.
    import('../translations').then(({ translations }) => {
      const t = translations[lang as any] || translations['he'];
      const prompts = t.mindfulMoments.prompts;
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      
      if (this.onTriggerCallback) {
        this.onTriggerCallback(randomPrompt);
      }
    });
  }
}

export const mindfulMomentsService = new MindfulMomentsService();

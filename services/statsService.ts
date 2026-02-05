
import { audioService } from './audioService';

const STARS_KEY = 'mindfulness_stars_count';
const HISTORY_KEY = 'mindfulness_history';

export interface HistoryEntry {
  id: string;
  type: string;
  date: string;
  durationSeconds: number;
  icon: string;
}

class StatsService {
  getStars(): number {
    const stored = localStorage.getItem(STARS_KEY);
    return stored ? parseInt(stored, 10) : 0;
  }

  addStar(): number {
    const current = this.getStars();
    const next = current + 1;
    localStorage.setItem(STARS_KEY, next.toString());
    
    // Play the gentle success sound
    audioService.playSuccessSound();
    
    return next;
  }

  getHistory(): HistoryEntry[] {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  addToHistory(type: string, icon: string, durationSeconds: number) {
    const history = this.getHistory();
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      type,
      icon,
      date: new Date().toISOString(),
      durationSeconds
    };
    const updatedHistory = [entry, ...history].slice(0, 50); // Keep last 50 entries
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  }

  clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
  }
}

export const statsService = new StatsService();

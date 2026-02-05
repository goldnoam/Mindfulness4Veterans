
import { audioService } from './audioService';

const STORAGE_KEY = 'mindfulness_stars_count';

class StatsService {
  getStars(): number {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  }

  addStar(): number {
    const current = this.getStars();
    const next = current + 1;
    localStorage.setItem(STORAGE_KEY, next.toString());
    
    // Play the gentle success sound
    audioService.playSuccessSound();
    
    return next;
  }
}

export const statsService = new StatsService();

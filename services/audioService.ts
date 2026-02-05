
class AudioService {
  private audioCtx: AudioContext | null = null;

  private initContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playSuccessSound() {
    this.initContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    
    // Play a gentle two-note chime (C6 and E6)
    this.playNote(1046.50, now, 0.5); // C6
    this.playNote(1318.51, now + 0.1, 0.6); // E6
  }

  private playNote(freq: number, startTime: number, duration: number) {
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05); // Soft attack
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // Smooth decay

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const audioService = new AudioService();

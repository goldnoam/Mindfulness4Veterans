
class MusicService {
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isPlaying: boolean = false;
  private currentVolume: number = 0.15;

  private init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.connect(this.audioCtx.destination);
      this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    }
  }

  toggle() {
    this.init();
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  private start() {
    if (!this.audioCtx || !this.gainNode) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    // Create a drone ambient sound using detuned sine waves
    const frequencies = [110, 164.81, 220, 329.63]; // A2, E3, A3, E4
    frequencies.forEach(freq => {
      const osc = this.audioCtx!.createOscillator();
      const lfo = this.audioCtx!.createOscillator();
      const lfoGain = this.audioCtx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx!.currentTime);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.1, this.audioCtx!.currentTime);
      lfoGain.gain.setValueAtTime(2, this.audioCtx!.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      osc.connect(this.gainNode!);

      osc.start();
      lfo.start();
      this.oscillators.push(osc, lfo);
    });

    this.gainNode.gain.linearRampToValueAtTime(this.currentVolume, this.audioCtx.currentTime + 2);
    this.isPlaying = true;
  }

  private stop() {
    if (!this.gainNode || !this.audioCtx) return;
    this.gainNode.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 1);
    setTimeout(() => {
      this.oscillators.forEach(osc => osc.stop());
      this.oscillators = [];
      this.isPlaying = false;
    }, 1100);
  }

  setVolume(val: number) {
    this.currentVolume = val;
    if (this.gainNode && this.isPlaying) {
      this.gainNode.gain.setTargetAtTime(val, this.audioCtx!.currentTime, 0.1);
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const musicService = new MusicService();

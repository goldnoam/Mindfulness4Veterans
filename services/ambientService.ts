
export type AmbientSoundMode = 'off' | 'rain' | 'waves' | 'forest' | 'yoga' | 'butterflies';

class AmbientService {
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private currentMode: AmbientSoundMode = 'off';
  private currentVolume: number = 0.2; // Defaulted to lower volume for pleasantness
  private sources: AudioNode[] = [];
  private birdTimer: number | null = null;
  private flutterTimer: number | null = null;
  private cricketTimer: number | null = null;

  private init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.connect(this.audioCtx.destination);
      this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    }
  }

  setMode(mode: AmbientSoundMode) {
    this.init();
    if (this.currentMode === mode) return;

    // Fade out current
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 1);
    }

    this.clearTimers();

    setTimeout(() => {
      this.stopSources();
      this.currentMode = mode;
      if (mode !== 'off') {
        this.startMode(mode);
      }
    }, 1100);
  }

  private clearTimers() {
    if (this.birdTimer) clearInterval(this.birdTimer);
    if (this.flutterTimer) clearInterval(this.flutterTimer);
    if (this.cricketTimer) clearInterval(this.cricketTimer);
    this.birdTimer = null;
    this.flutterTimer = null;
    this.cricketTimer = null;
  }

  private stopSources() {
    this.sources.forEach(s => {
      try { (s as any).stop?.(); } catch(e) {}
    });
    this.sources = [];
  }

  private triggerBirdChirp() {
    if (!this.audioCtx || !this.gainNode || this.currentMode !== 'forest') return;
    
    const now = this.audioCtx.currentTime;
    const numChirps = 1 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < numChirps; i++) {
      const startOffset = i * 0.2;
      const osc = this.audioCtx.createOscillator();
      const chirpGain = this.audioCtx.createGain();

      osc.type = 'sine';
      const baseFreq = 2200 + Math.random() * 800;
      osc.frequency.setValueAtTime(baseFreq, now + startOffset);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 1000, now + startOffset + 0.1);

      chirpGain.gain.setValueAtTime(0, now + startOffset);
      chirpGain.gain.linearRampToValueAtTime(0.015, now + startOffset + 0.02);
      chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + 0.15);

      osc.connect(chirpGain);
      chirpGain.connect(this.gainNode);
      
      osc.start(now + startOffset);
      osc.stop(now + startOffset + 0.2);
    }
  }

  private triggerSoftCricket() {
    if (!this.audioCtx || !this.gainNode || this.currentMode !== 'butterflies') return;
    
    const now = this.audioCtx.currentTime;
    // Crickets have a rhythmic "pulse"
    const pulses = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < pulses; i++) {
        const start = now + (i * 0.08);
        const osc = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(4500 + Math.random() * 500, start);
        
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.01, start + 0.01);
        g.gain.linearRampToValueAtTime(0, start + 0.04);
        
        osc.connect(g);
        g.connect(this.gainNode);
        osc.start(start);
        osc.stop(start + 0.05);
    }
  }

  private triggerButterflyFlutter() {
    if (!this.audioCtx || !this.gainNode || this.currentMode !== 'butterflies') return;
    
    const now = this.audioCtx.currentTime;
    const duration = 0.8 + Math.random() * 1.2;
    
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, now);

    const flutterGain = this.audioCtx.createGain();
    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(15 + Math.random() * 5, now);
    lfoGain.gain.setValueAtTime(0.3, now);

    flutterGain.gain.setValueAtTime(0, now);
    flutterGain.gain.linearRampToValueAtTime(0.03, now + 0.3);
    flutterGain.gain.linearRampToValueAtTime(0, now + duration);

    lfo.connect(lfoGain);
    lfoGain.connect(flutterGain.gain);
    source.connect(filter);
    filter.connect(flutterGain);
    flutterGain.connect(this.gainNode);

    source.start(now);
    lfo.start(now);
    source.stop(now + duration);
    lfo.stop(now + duration);
  }

  private startMode(mode: AmbientSoundMode) {
    if (!this.audioCtx || !this.gainNode) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    if (mode === 'yoga') {
        const freqs = [174.61, 220.00, 261.63, 349.23];
        freqs.forEach((f, i) => {
            const osc = this.audioCtx!.createOscillator();
            const oscGain = this.audioCtx!.createGain();
            const lfo = this.audioCtx!.createOscillator();
            const lfoGain = this.audioCtx!.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, this.audioCtx!.currentTime);
            oscGain.gain.setValueAtTime(0, this.audioCtx!.currentTime);
            oscGain.gain.linearRampToValueAtTime(0.12 / freqs.length, this.audioCtx!.currentTime + 3);
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(0.04 + i * 0.01, this.audioCtx!.currentTime);
            lfoGain.gain.setValueAtTime(0.04, this.audioCtx!.currentTime);
            lfo.connect(lfoGain);
            lfoGain.connect(oscGain.gain);
            osc.connect(oscGain);
            oscGain.connect(this.gainNode!);
            osc.start();
            lfo.start();
            this.sources.push(osc, lfo, oscGain, lfoGain);
        });
    } else {
        const bufferSize = 2 * this.audioCtx.sampleRate;
        const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

        const noiseSource = this.audioCtx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        const filter = this.audioCtx.createBiquadFilter();
        
        if (mode === 'rain') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, this.audioCtx.currentTime);
          const highPass = this.audioCtx.createBiquadFilter();
          highPass.type = 'highpass';
          highPass.frequency.setValueAtTime(400, this.audioCtx.currentTime);
          noiseSource.connect(highPass);
          highPass.connect(filter);
          filter.connect(this.gainNode);
          this.sources.push(noiseSource, filter, highPass);
        } else if (mode === 'waves') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(350, this.audioCtx.currentTime);
          const lfo = this.audioCtx.createOscillator();
          const lfoGain = this.audioCtx.createGain();
          lfo.frequency.setValueAtTime(0.1, this.audioCtx.currentTime);
          lfoGain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
          const innerGain = this.audioCtx.createGain();
          innerGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
          lfo.connect(lfoGain);
          lfoGain.connect(innerGain.gain);
          noiseSource.connect(filter);
          filter.connect(innerGain);
          innerGain.connect(this.gainNode);
          lfo.start();
          this.sources.push(noiseSource, filter, lfo, lfoGain, innerGain);
        } else if (mode === 'forest' || mode === 'butterflies') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(mode === 'forest' ? 400 : 600, this.audioCtx.currentTime);
          const lfo = this.audioCtx.createOscillator();
          const lfoGain = this.audioCtx.createGain();
          lfo.type = 'sine';
          lfo.frequency.setValueAtTime(0.05, this.audioCtx.currentTime);
          lfoGain.gain.setValueAtTime(100, this.audioCtx.currentTime);
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          noiseSource.connect(filter);
          filter.connect(this.gainNode);
          lfo.start();
          this.sources.push(noiseSource, filter, lfo, lfoGain);

          if (mode === 'forest') {
            this.birdTimer = window.setInterval(() => {
              if (Math.random() > 0.4) this.triggerBirdChirp();
            }, 4000);
          } else if (mode === 'butterflies') {
            this.flutterTimer = window.setInterval(() => {
              if (Math.random() > 0.5) this.triggerButterflyFlutter();
            }, 3000);
            this.cricketTimer = window.setInterval(() => {
              if (Math.random() > 0.3) this.triggerSoftCricket();
            }, 5000);
          }
        }
        noiseSource.start();
    }
    this.gainNode.gain.linearRampToValueAtTime(this.currentVolume, this.audioCtx.currentTime + 2);
  }

  setVolume(val: number) {
    this.currentVolume = val;
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setTargetAtTime(val, this.audioCtx.currentTime, 0.2);
    }
  }

  getMode() { return this.currentMode; }
}

export const ambientService = new AmbientService();

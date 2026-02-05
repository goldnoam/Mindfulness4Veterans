
export type AmbientSoundMode = 'off' | 'rain' | 'waves' | 'forest' | 'yoga' | 'butterflies';

class AmbientService {
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private currentMode: AmbientSoundMode = 'off';
  private currentVolume: number = 0.15; // Lower default volume for tranquility
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
    if (!this.audioCtx || !this.gainNode || (this.currentMode !== 'forest' && this.currentMode !== 'butterflies')) return;
    
    const now = this.audioCtx.currentTime;
    const numChirps = 1 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < numChirps; i++) {
      const startOffset = i * 0.3;
      const osc = this.audioCtx.createOscillator();
      const chirpGain = this.audioCtx.createGain();

      osc.type = 'sine';
      // Lower and softer frequency for "gentle" birds
      const baseFreq = 1800 + Math.random() * 600;
      osc.frequency.setValueAtTime(baseFreq, now + startOffset);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 400, now + startOffset + 0.15);

      chirpGain.gain.setValueAtTime(0, now + startOffset);
      chirpGain.gain.linearRampToValueAtTime(0.008, now + startOffset + 0.03); // Very quiet
      chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + 0.25);

      osc.connect(chirpGain);
      chirpGain.connect(this.gainNode);
      
      osc.start(now + startOffset);
      osc.stop(now + startOffset + 0.3);
    }
  }

  private triggerSoftCricket() {
    if (!this.audioCtx || !this.gainNode || this.currentMode !== 'butterflies') return;
    
    const now = this.audioCtx.currentTime;
    const pulses = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < pulses; i++) {
        const start = now + (i * 0.1);
        const osc = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(4000 + Math.random() * 300, start);
        
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.005, start + 0.02); // Barely audible
        g.gain.linearRampToValueAtTime(0, start + 0.06);
        
        osc.connect(g);
        g.connect(this.gainNode);
        osc.start(start);
        osc.stop(start + 0.1);
    }
  }

  private triggerButterflyFlutter() {
    if (!this.audioCtx || !this.gainNode || this.currentMode !== 'butterflies') return;
    
    const now = this.audioCtx.currentTime;
    const duration = 1.0 + Math.random() * 1.0;
    
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4000, now); // Higher for silkier sound

    const flutterGain = this.audioCtx.createGain();
    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(8 + Math.random() * 4, now); // Slower, gentler flutter
    lfoGain.gain.setValueAtTime(0.2, now);

    flutterGain.gain.setValueAtTime(0, now);
    flutterGain.gain.linearRampToValueAtTime(0.015, now + 0.4); 
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

    const bufferSize = 4 * this.audioCtx.sampleRate;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

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
            oscGain.gain.linearRampToValueAtTime(0.1 / freqs.length, this.audioCtx!.currentTime + 4);
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(0.03 + i * 0.01, this.audioCtx!.currentTime);
            lfoGain.gain.setValueAtTime(0.03, this.audioCtx!.currentTime);
            lfo.connect(lfoGain);
            lfoGain.connect(oscGain.gain);
            osc.connect(oscGain);
            oscGain.connect(this.gainNode!);
            osc.start();
            lfo.start();
            this.sources.push(osc, lfo, oscGain, lfoGain);
        });
    } else if (mode === 'rain') {
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, this.audioCtx.currentTime);
        noiseSource.connect(filter);
        filter.connect(this.gainNode);
        noiseSource.start();
        this.sources.push(noiseSource, filter);
    } else if (mode === 'waves') {
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, this.audioCtx.currentTime);
        const lfo = this.audioCtx.createOscillator();
        const lfoGain = this.audioCtx.createGain();
        lfo.frequency.setValueAtTime(0.08, this.audioCtx.currentTime);
        lfoGain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        const innerGain = this.audioCtx.createGain();
        innerGain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(innerGain.gain);
        noiseSource.connect(filter);
        filter.connect(innerGain);
        innerGain.connect(this.gainNode);
        lfo.start();
        noiseSource.start();
        this.sources.push(noiseSource, filter, lfo, lfoGain, innerGain);
    } else if (mode === 'forest' || mode === 'butterflies') {
        // Meadow/Forest Breeze Layer
        const breezeFilter = this.audioCtx.createBiquadFilter();
        breezeFilter.type = 'lowpass';
        breezeFilter.frequency.setValueAtTime(mode === 'forest' ? 300 : 500, this.audioCtx.currentTime);
        const breezeLfo = this.audioCtx.createOscillator();
        const breezeLfoGain = this.audioCtx.createGain();
        breezeLfo.frequency.setValueAtTime(0.04, this.audioCtx.currentTime);
        breezeLfoGain.gain.setValueAtTime(80, this.audioCtx.currentTime);
        breezeLfo.connect(breezeLfoGain);
        breezeLfoGain.connect(breezeFilter.frequency);
        noiseSource.connect(breezeFilter);
        breezeFilter.connect(this.gainNode);
        breezeLfo.start();
        noiseSource.start();
        this.sources.push(noiseSource, breezeFilter, breezeLfo, breezeLfoGain);

        if (mode === 'forest') {
            // Babbling Brook Layer (Water)
            const waterSource = this.audioCtx.createBufferSource();
            waterSource.buffer = noiseBuffer;
            waterSource.loop = true;
            const waterFilter = this.audioCtx.createBiquadFilter();
            waterFilter.type = 'lowpass';
            waterFilter.frequency.setValueAtTime(400, this.audioCtx.currentTime);
            const waterLfo = this.audioCtx.createOscillator();
            const waterLfoGain = this.audioCtx.createGain();
            waterLfo.frequency.setValueAtTime(1.5, this.audioCtx.currentTime); // Ripples
            waterLfoGain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
            const waterGain = this.audioCtx.createGain();
            waterGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
            waterLfo.connect(waterLfoGain);
            waterLfoGain.connect(waterGain.gain);
            waterSource.connect(waterFilter);
            waterFilter.connect(waterGain);
            waterGain.connect(this.gainNode);
            waterLfo.start();
            waterSource.start();
            this.sources.push(waterSource, waterFilter, waterLfo, waterLfoGain, waterGain);

            this.birdTimer = window.setInterval(() => {
                if (Math.random() > 0.5) this.triggerBirdChirp();
            }, 5000);
        } else {
            // Butterflies / Open Space
            this.flutterTimer = window.setInterval(() => {
                if (Math.random() > 0.6) this.triggerButterflyFlutter();
            }, 4000);
            this.cricketTimer = window.setInterval(() => {
                if (Math.random() > 0.4) this.triggerSoftCricket();
            }, 6000);
            this.birdTimer = window.setInterval(() => {
                if (Math.random() > 0.7) this.triggerBirdChirp();
            }, 8000);
        }
    }

    this.gainNode.gain.linearRampToValueAtTime(this.currentVolume, this.audioCtx.currentTime + 3);
  }

  setVolume(val: number) {
    this.currentVolume = val;
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setTargetAtTime(val, this.audioCtx.currentTime, 0.3);
    }
  }

  getMode() { return this.currentMode; }
}

export const ambientService = new AmbientService();

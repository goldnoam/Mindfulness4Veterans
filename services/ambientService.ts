
export type AmbientSoundMode = 'off' | 'rain' | 'waves' | 'forest' | 'yoga';

class AmbientService {
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private currentMode: AmbientSoundMode = 'off';
  private currentVolume: number = 0.3;
  private sources: AudioNode[] = [];

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

    setTimeout(() => {
      this.stopSources();
      this.currentMode = mode;
      if (mode !== 'off') {
        this.startMode(mode);
      }
    }, 1100);
  }

  private stopSources() {
    this.sources.forEach(s => {
      try { (s as any).stop?.(); } catch(e) {}
    });
    this.sources = [];
  }

  private startMode(mode: AmbientSoundMode) {
    if (!this.audioCtx || !this.gainNode) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    if (mode === 'yoga') {
        // Multi-layered harmonic drone for Yoga/Pilates feel
        const freqs = [174.61, 220.00, 261.63, 349.23]; // F3, A3, C4, F4 - F Major
        freqs.forEach((f, i) => {
            const osc = this.audioCtx!.createOscillator();
            const oscGain = this.audioCtx!.createGain();
            const lfo = this.audioCtx!.createOscillator();
            const lfoGain = this.audioCtx!.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, this.audioCtx!.currentTime);
            
            oscGain.gain.setValueAtTime(0, this.audioCtx!.currentTime);
            oscGain.gain.linearRampToValueAtTime(0.15 / freqs.length, this.audioCtx!.currentTime + 2);

            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(0.05 + i * 0.02, this.audioCtx!.currentTime);
            lfoGain.gain.setValueAtTime(0.05, this.audioCtx!.currentTime);

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

        // Create White/Pink/Brown noise based on mode
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const noiseSource = this.audioCtx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = this.audioCtx.createBiquadFilter();
        
        if (mode === 'rain') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1000, this.audioCtx.currentTime);
          const highPass = this.audioCtx.createBiquadFilter();
          highPass.type = 'highpass';
          highPass.frequency.setValueAtTime(500, this.audioCtx.currentTime);
          
          noiseSource.connect(highPass);
          highPass.connect(filter);
          filter.connect(this.gainNode);
          this.sources.push(noiseSource, filter, highPass);
        } else if (mode === 'waves') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(400, this.audioCtx.currentTime);
          
          const lfo = this.audioCtx.createOscillator();
          const lfoGain = this.audioCtx.createGain();
          lfo.frequency.setValueAtTime(0.12, this.audioCtx.currentTime); // 8 second cycle
          lfoGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
          
          const innerGain = this.audioCtx.createGain();
          innerGain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
          
          lfo.connect(lfoGain);
          lfoGain.connect(innerGain.gain);
          
          noiseSource.connect(filter);
          filter.connect(innerGain);
          innerGain.connect(this.gainNode);
          
          lfo.start();
          this.sources.push(noiseSource, filter, lfo, lfoGain, innerGain);
        } else if (mode === 'forest') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, this.audioCtx.currentTime);
          
          const lfo = this.audioCtx.createOscillator();
          const lfoGain = this.audioCtx.createGain();
          lfo.type = 'sine';
          lfo.frequency.setValueAtTime(0.05, this.audioCtx.currentTime);
          lfoGain.gain.setValueAtTime(300, this.audioCtx.currentTime);
          
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          
          noiseSource.connect(filter);
          filter.connect(this.gainNode);
          
          lfo.start();
          this.sources.push(noiseSource, filter, lfo, lfoGain);
        }
        noiseSource.start();
    }

    this.gainNode.gain.linearRampToValueAtTime(this.currentVolume, this.audioCtx.currentTime + 1.5);
  }

  setVolume(val: number) {
    this.currentVolume = val;
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setTargetAtTime(val, this.audioCtx.currentTime, 0.1);
    }
  }

  getMode() { return this.currentMode; }
}

export const ambientService = new AmbientService();

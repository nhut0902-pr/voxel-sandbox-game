export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterVolume = 0.8;
  private musicVolume = 0.6;
  private sfxVolume = 0.8;
  private currentMusic: AudioBufferSourceNode | null = null;

  async init(): Promise<void> {
    if (this.audioContext) return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create gain nodes
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.masterVolume;
    this.masterGain.connect(this.audioContext.destination);

    this.musicGain = this.audioContext.createGain();
    this.musicGain.gain.value = this.musicVolume;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.audioContext.createGain();
    this.sfxGain.gain.value = this.sfxVolume;
    this.sfxGain.connect(this.masterGain);
  }

  async playSound(url: string, type: 'music' | 'sfx' = 'sfx'): Promise<void> {
    if (!this.audioContext) await this.init();

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);

      const source = this.audioContext!.createBufferSource();
      source.buffer = audioBuffer;

      if (type === 'music') {
        source.loop = true;
        source.connect(this.musicGain!);
        this.currentMusic = source;
      } else {
        source.connect(this.sfxGain!);
      }

      source.start(0);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  playBlockBreak(): void {
    this.playTone(200, 0.1, 'sfx');
  }

  playBlockPlace(): void {
    this.playTone(400, 0.1, 'sfx');
  }

  playFootstep(): void {
    this.playTone(150, 0.05, 'sfx');
  }

  private playTone(frequency: number, duration: number, type: 'music' | 'sfx' = 'sfx'): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(gain);

    if (type === 'music') {
      gain.connect(this.musicGain!);
    } else {
      gain.connect(this.sfxGain!);
    }

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume;
    }
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain) {
      this.musicGain.gain.value = this.musicVolume;
    }
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.sfxVolume;
    }
  }

  stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  getMusicVolume(): number {
    return this.musicVolume;
  }

  getSfxVolume(): number {
    return this.sfxVolume;
  }
}

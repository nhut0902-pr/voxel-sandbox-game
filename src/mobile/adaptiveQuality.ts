import { GameRenderer } from '../engine/renderer';

export interface QualitySettings {
  renderDistance: number;
  shadowsEnabled: boolean;
  particlesEnabled: boolean;
  fogDistance: number;
  pixelRatio: number;
  maxFPS: number;
  textureQuality: 'low' | 'medium' | 'high';
}

export class AdaptiveQuality {
  private renderer: GameRenderer;
  private isMobile: boolean = false;
  private settings: QualitySettings;
  private lastFPS: number = 60;
  private fpsHistory: number[] = [];
  private maxHistorySize: number = 30;

  constructor(renderer: GameRenderer) {
    this.renderer = renderer;
    this.isMobile = this.detectMobile();
    this.settings = this.getDefaultSettings();
  }

  private detectMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  private getDefaultSettings(): QualitySettings {
    if (this.isMobile) {
      // Check device capabilities
      const memory = (navigator as any).deviceMemory || 4;
      const cores = navigator.hardwareConcurrency || 2;

      if (memory <= 2 || cores <= 2) {
        // Low-end device
        return {
          renderDistance: 4,
          shadowsEnabled: false,
          particlesEnabled: false,
          fogDistance: 100,
          pixelRatio: 1,
          maxFPS: 30,
          textureQuality: 'low',
        };
      } else if (memory <= 4 || cores <= 4) {
        // Mid-range device
        return {
          renderDistance: 6,
          shadowsEnabled: false,
          particlesEnabled: true,
          fogDistance: 150,
          pixelRatio: 1,
          maxFPS: 45,
          textureQuality: 'medium',
        };
      } else {
        // High-end device
        return {
          renderDistance: 8,
          shadowsEnabled: true,
          particlesEnabled: true,
          fogDistance: 200,
          pixelRatio: window.devicePixelRatio,
          maxFPS: 60,
          textureQuality: 'high',
        };
      }
    } else {
      // Desktop defaults
      return {
        renderDistance: 12,
        shadowsEnabled: true,
        particlesEnabled: true,
        fogDistance: 300,
        pixelRatio: window.devicePixelRatio,
        maxFPS: 60,
        textureQuality: 'high',
      };
    }
  }

  updateQualityBasedOnFPS(currentFPS: number): void {
    if (!this.isMobile) return;

    this.lastFPS = currentFPS;
    this.fpsHistory.push(currentFPS);

    if (this.fpsHistory.length > this.maxHistorySize) {
      this.fpsHistory.shift();
    }

    const averageFPS =
      this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;

    // Adaptive quality adjustment
    if (averageFPS < this.settings.maxFPS * 0.7) {
      // Performance is poor, reduce quality
      this.reduceQuality();
    } else if (averageFPS > this.settings.maxFPS * 0.95 && this.fpsHistory.length > 20) {
      // Performance is good, can increase quality
      this.increaseQuality();
    }
  }

  private reduceQuality(): void {
    const oldSettings = { ...this.settings };

    if (this.settings.renderDistance > 4) {
      this.settings.renderDistance--;
    } else if (this.settings.particlesEnabled) {
      this.settings.particlesEnabled = false;
    } else if (this.settings.shadowsEnabled) {
      this.settings.shadowsEnabled = false;
    } else if (this.settings.textureQuality === 'high') {
      this.settings.textureQuality = 'medium';
    } else if (this.settings.textureQuality === 'medium') {
      this.settings.textureQuality = 'low';
    }

    if (JSON.stringify(oldSettings) !== JSON.stringify(this.settings)) {
      this.applySettings();
      console.log('Quality reduced:', this.settings);
    }
  }

  private increaseQuality(): void {
    const oldSettings = { ...this.settings };

    if (this.settings.textureQuality === 'low') {
      this.settings.textureQuality = 'medium';
    } else if (this.settings.textureQuality === 'medium') {
      this.settings.textureQuality = 'high';
    } else if (!this.settings.shadowsEnabled) {
      this.settings.shadowsEnabled = true;
    } else if (!this.settings.particlesEnabled) {
      this.settings.particlesEnabled = true;
    } else if (this.settings.renderDistance < 12) {
      this.settings.renderDistance++;
    }

    if (JSON.stringify(oldSettings) !== JSON.stringify(this.settings)) {
      this.applySettings();
      console.log('Quality increased:', this.settings);
    }
  }

  private applySettings(): void {
    // Apply render distance
    this.renderer.getChunkManager().setRenderDistance(this.settings.renderDistance);

    // Apply fog
    this.renderer.getScene().fog = new (require('three')).Fog(
      0x87ceeb,
      this.settings.fogDistance * 0.5,
      this.settings.fogDistance
    );

    // Apply shadows
    this.renderer.getRenderer().shadowMap.enabled = this.settings.shadowsEnabled;
  }

  getSettings(): QualitySettings {
    return { ...this.settings };
  }

  setQualityPreset(preset: 'low' | 'medium' | 'high' | 'ultra'): void {
    switch (preset) {
      case 'low':
        this.settings = {
          renderDistance: 4,
          shadowsEnabled: false,
          particlesEnabled: false,
          fogDistance: 80,
          pixelRatio: 1,
          maxFPS: 30,
          textureQuality: 'low',
        };
        break;
      case 'medium':
        this.settings = {
          renderDistance: 6,
          shadowsEnabled: false,
          particlesEnabled: true,
          fogDistance: 150,
          pixelRatio: 1,
          maxFPS: 45,
          textureQuality: 'medium',
        };
        break;
      case 'high':
        this.settings = {
          renderDistance: 8,
          shadowsEnabled: true,
          particlesEnabled: true,
          fogDistance: 200,
          pixelRatio: window.devicePixelRatio,
          maxFPS: 60,
          textureQuality: 'high',
        };
        break;
      case 'ultra':
        this.settings = {
          renderDistance: 12,
          shadowsEnabled: true,
          particlesEnabled: true,
          fogDistance: 300,
          pixelRatio: window.devicePixelRatio,
          maxFPS: 60,
          textureQuality: 'high',
        };
        break;
    }

    this.applySettings();
  }

  getLastFPS(): number {
    return this.lastFPS;
  }

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }
}

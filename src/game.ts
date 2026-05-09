import { GameRenderer } from './engine/renderer';
import { HUD } from './ui/hud';
import { AudioManager } from './audio/audioManager';
import { GameStorage } from './utils/storage';
import { MobileInputManager } from './mobile/mobileInput';
import { MobileUI } from './mobile/mobileUI';
import { AdaptiveQuality } from './mobile/adaptiveQuality';
import { BlockType } from './types';

export class Game {
  private renderer: GameRenderer;
  private hud: HUD;
  private audioManager: AudioManager;
  private storage: GameStorage;
  private mobileInput: MobileInputManager | null = null;
  private mobileUI: MobileUI | null = null;
  private adaptiveQuality: AdaptiveQuality | null = null;
  private isRunning = false;
  private canvas: HTMLCanvasElement;
  private lastClickTime = 0;
  private clickDelay = 100; // ms between clicks
  private fpsCounter = 0;
  private lastFpsTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new GameRenderer(canvas);
    this.hud = new HUD(this.renderer.getPlayer());
    this.audioManager = new AudioManager();
    this.storage = new GameStorage();

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Mouse click for block interaction
    document.addEventListener('mousedown', (e) => {
      const now = performance.now();
      if (now - this.lastClickTime < this.clickDelay) return;
      this.lastClickTime = now;

      if (e.button === 0) {
        // Left click - break block
        this.renderer.getPlayer().breakBlock();
        this.audioManager.playBlockBreak();
      } else if (e.button === 2) {
        // Right click - place block
        const selectedBlock = this.renderer.getPlayer().getSelectedBlock();
        this.renderer.getPlayer().placeBlock(selectedBlock);
        this.audioManager.playBlockPlace();
      }
    });

    // Prevent context menu on right click
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Mobile touch controls
    this.setupMobileControls();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.togglePause();
      if (e.key === 'e') this.toggleInventory();
    });
  }

  private setupMobileControls(): void {
    // Virtual joystick for mobile
    const touchStart = { x: 0, y: 0 };
    const touchCurrent = { x: 0, y: 0 };

    document.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      touchStart.x = touch.clientX;
      touchStart.y = touch.clientY;
    });

    document.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      touchCurrent.x = touch.clientX;
      touchCurrent.y = touch.clientY;

      // Simulate mouse movement for camera control
      const movementX = touchCurrent.x - touchStart.x;
      const movementY = touchCurrent.y - touchStart.y;

      // This would be handled by the player controller
      touchStart.x = touchCurrent.x;
      touchStart.y = touchCurrent.y;
    });
  }

  private togglePause(): void {
    const state = this.renderer.getGameState();
    state.isPaused = !state.isPaused;

    if (state.isPaused) {
      this.pause();
    } else {
      this.resume();
    }
  }

  private toggleInventory(): void {
    // Inventory UI would be shown here
    console.log('Inventory:', this.renderer.getPlayer().getInventory());
  }

  async init(): Promise<void> {
    await this.audioManager.init();
    await this.storage.init();

    // Initialize mobile systems
    this.mobileInput = new MobileInputManager(this.canvas, this.renderer.getPlayer());
    this.mobileUI = new MobileUI(this.renderer.getPlayer());
    this.adaptiveQuality = new AdaptiveQuality(this.renderer);

    // Load saved game state if available
    const savedState = await this.storage.loadGameState();
    if (savedState) {
      Object.assign(this.renderer.getGameState(), savedState);
    }

    const savedPlayer = await this.storage.loadPlayerData();
    if (savedPlayer) {
      // Restore player data
      console.log('Loaded player data:', savedPlayer);
    }
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    const gameLoop = () => {
      if (this.isRunning) {
        this.renderer.render();
        this.hud.update();

        // Update mobile UI
        if (this.mobileUI) {
          this.mobileUI.update();
        }

        // Update adaptive quality
        if (this.adaptiveQuality) {
          this.fpsCounter++;
          const now = performance.now();
          if (now - this.lastFpsTime >= 1000) {
            const fps = this.fpsCounter;
            this.adaptiveQuality.updateQualityBasedOnFPS(fps);
            this.fpsCounter = 0;
            this.lastFpsTime = now;
          }
        }

        requestAnimationFrame(gameLoop);
      }
    };

    requestAnimationFrame(gameLoop);
  }

  pause(): void {
    console.log('Game paused');
  }

  resume(): void {
    console.log('Game resumed');
  }

  async save(): Promise<void> {
    const player = this.renderer.getPlayer();
    const gameState = this.renderer.getGameState();

    await this.storage.savePlayerData(player.getData());
    await this.storage.saveGameState(gameState);

    console.log('Game saved');
  }

  async quit(): Promise<void> {
    await this.save();
    this.isRunning = false;
    this.hud.dispose();

    if (this.mobileInput) {
      this.mobileInput.dispose();
    }

    if (this.mobileUI) {
      this.mobileUI.dispose();
    }

    this.renderer.dispose();
  }

  getRenderer(): GameRenderer {
    return this.renderer;
  }

  getAudioManager(): AudioManager {
    return this.audioManager;
  }

  getStorage(): GameStorage {
    return this.storage;
  }
}

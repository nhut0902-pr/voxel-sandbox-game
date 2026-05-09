import * as THREE from 'three';
import { ChunkManager } from './chunkmanager';
import { Player } from './player';
import { GameState } from '../types';

export class GameRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private chunkManager: ChunkManager;
  private player: Player;
  private gameState: GameState;
  private clock: THREE.Clock;
  private fpsCounter = 0;
  private lastFpsTime = 0;

  constructor(canvas: HTMLCanvasElement, seed: number = 12345) {
    // Setup scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 200, 400);

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 100, 0);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;

    // Setup lighting
    this.setupLighting();

    // Setup managers
    this.chunkManager = new ChunkManager(this.scene, seed);
    this.player = new Player(this.camera, this.chunkManager);

    // Game state
    this.gameState = {
      isPaused: false,
      isCreativeMode: true,
      renderDistance: 8,
      fpsTarget: 60,
      masterVolume: 0.8,
      musicVolume: 0.6,
      sfxVolume: 0.8,
      seed,
    };

    this.clock = new THREE.Clock();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Request pointer lock
    canvas.addEventListener('click', () => {
      canvas.requestPointerLock = canvas.requestPointerLock || (canvas as any).mozRequestPointerLock;
      canvas.requestPointerLock();
    });
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 150, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -256;
    directionalLight.shadow.camera.right = 256;
    directionalLight.shadow.camera.top = 256;
    directionalLight.shadow.camera.bottom = -256;
    this.scene.add(directionalLight);

    // Skybox
    this.setupSkybox();
  }

  private setupSkybox(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    const geometry = new THREE.SphereGeometry(500, 32, 32);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    const skybox = new THREE.Mesh(geometry, material);
    this.scene.add(skybox);
  }

  render(): void {
    const deltaTime = this.clock.getDelta();

    // Update player
    this.player.update(deltaTime);

    // Update chunk manager
    this.chunkManager.updateChunks(this.player.getPosition());

    // Render
    this.renderer.render(this.scene, this.camera);

    // Update FPS counter
    this.updateFpsCounter(deltaTime);
  }

  private updateFpsCounter(deltaTime: number): void {
    this.fpsCounter++;
    const now = performance.now();

    if (now - this.lastFpsTime >= 1000) {
      console.log(`FPS: ${this.fpsCounter}`);
      this.fpsCounter = 0;
      this.lastFpsTime = now;
    }
  }

  private onWindowResize(): void {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  getPlayer(): Player {
    return this.player;
  }

  getChunkManager(): ChunkManager {
    return this.chunkManager;
  }

  getGameState(): GameState {
    return this.gameState;
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  dispose(): void {
    this.renderer.dispose();
    this.chunkManager.clear();
  }
}

import { VirtualJoystick, JoystickState } from './joystick';
import { TouchCameraController, TouchCameraState } from './touchCamera';
import { Player } from '../engine/player';

export class MobileInputManager {
  private joystick: VirtualJoystick | null = null;
  private touchCamera: TouchCameraController;
  private player: Player;
  private isMobile: boolean = false;
  private joystickState: JoystickState = {
    x: 0,
    y: 0,
    magnitude: 0,
    angle: 0,
    isActive: false,
  };
  private cameraState: TouchCameraState = {
    deltaX: 0,
    deltaY: 0,
    isActive: false,
  };

  constructor(canvas: HTMLCanvasElement, player: Player) {
    this.player = player;
    this.touchCamera = new TouchCameraController(canvas);
    this.isMobile = this.detectMobile();

    if (this.isMobile) {
      this.initializeMobileInput();
    }
  }

  private detectMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  private initializeMobileInput(): void {
    // Create joystick container if it doesn't exist
    let container = document.getElementById('joystick-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'joystick-container';
      document.body.appendChild(container);
    }

    // Initialize virtual joystick
    this.joystick = new VirtualJoystick('joystick-container');
    this.joystick.onStateChange((state) => {
      this.joystickState = state;
      this.updateMovement();
    });

    // Initialize touch camera
    this.touchCamera.onStateChange((state) => {
      this.cameraState = state;
      this.updateCamera();
    });

    // Setup viewport meta tag for mobile
    this.setupViewport();
  }

  private setupViewport(): void {
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    );
  }

  private updateMovement(): void {
    if (!this.isMobile || !this.joystickState.isActive) return;

    // Simulate keyboard input based on joystick position
    const keys = ['w', 'a', 's', 'd'];
    const magnitude = this.joystickState.magnitude;

    if (magnitude > 0.1) {
      const angle = this.joystickState.angle;

      // Determine which keys should be pressed
      const isForward = Math.cos(angle) > 0.3;
      const isBackward = Math.cos(angle) < -0.3;
      const isLeft = Math.sin(angle) > 0.3;
      const isRight = Math.sin(angle) < -0.3;

      // Simulate key events
      if (isForward) this.simulateKeyPress('w');
      if (isBackward) this.simulateKeyPress('s');
      if (isLeft) this.simulateKeyPress('a');
      if (isRight) this.simulateKeyPress('d');
    }
  }

  private updateCamera(): void {
    if (!this.isMobile || !this.cameraState.isActive) return;

    // Apply camera rotation based on touch input
    // This is handled by the player controller's mouse movement
    const event = new MouseEvent('mousemove', {
      movementX: this.cameraState.deltaX,
      movementY: this.cameraState.deltaY,
    });
    document.dispatchEvent(event);
  }

  private simulateKeyPress(key: string): void {
    const downEvent = new KeyboardEvent('keydown', {
      key,
      code: key.toUpperCase(),
      bubbles: true,
    });
    document.dispatchEvent(downEvent);

    // Auto-release after a short delay
    setTimeout(() => {
      const upEvent = new KeyboardEvent('keyup', {
        key,
        code: key.toUpperCase(),
        bubbles: true,
      });
      document.dispatchEvent(upEvent);
    }, 50);
  }

  update(): void {
    // Update is handled by event listeners
  }

  getJoystickState(): JoystickState {
    return { ...this.joystickState };
  }

  getCameraState(): TouchCameraState {
    return { ...this.cameraState };
  }

  isMobileDevice(): boolean {
    return this.isMobile;
  }

  setJoystickSensitivity(value: number): void {
    if (this.joystick) {
      this.joystick.setDeadzone(value);
    }
  }

  setCameraSensitivity(value: number): void {
    this.touchCamera.setSensitivity(value);
  }

  dispose(): void {
    if (this.joystick) {
      this.joystick.dispose();
    }
  }
}

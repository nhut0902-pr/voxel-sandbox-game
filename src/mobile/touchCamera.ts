export interface TouchCameraState {
  deltaX: number;
  deltaY: number;
  isActive: boolean;
}

export class TouchCameraController {
  private canvas: HTMLCanvasElement;
  private touchId: number | null = null;
  private lastX: number = 0;
  private lastY: number = 0;
  private sensitivity: number = 0.5;
  private stateChangeCallback: ((state: TouchCameraState) => void) | null = null;
  private isMobile: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.isMobile = this.detectMobile();
    this.setupTouchEvents();
  }

  private detectMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  private setupTouchEvents(): void {
    // Right side of screen for camera control on mobile
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
    document.addEventListener('touchmove', (e) => this.handleTouchMove(e), false);
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);
    document.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), false);

    // Mouse fallback for desktop
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e), false);
  }

  private handleTouchStart(e: TouchEvent): void {
    if (this.touchId !== null) return;

    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();

    // Only activate on right side of screen (camera control area)
    if (touch.clientX > rect.left + rect.width * 0.5) {
      this.touchId = touch.identifier;
      this.lastX = touch.clientX;
      this.lastY = touch.clientY;
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    if (this.touchId === null) return;

    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === this.touchId) {
        const touch = e.touches[i];
        const deltaX = touch.clientX - this.lastX;
        const deltaY = touch.clientY - this.lastY;

        this.lastX = touch.clientX;
        this.lastY = touch.clientY;

        this.notifyStateChange(deltaX, deltaY, true);
        break;
      }
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (this.touchId === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.touchId) {
        this.touchId = null;
        this.notifyStateChange(0, 0, false);
        break;
      }
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    // Only use mouse movement for camera on desktop
    if (!this.isMobile && e.buttons === 0) {
      const deltaX = e.movementX || 0;
      const deltaY = e.movementY || 0;

      if (deltaX !== 0 || deltaY !== 0) {
        this.notifyStateChange(deltaX, deltaY, true);
      }
    }
  }

  private notifyStateChange(deltaX: number, deltaY: number, isActive: boolean): void {
    if (this.stateChangeCallback) {
      this.stateChangeCallback({
        deltaX: deltaX * this.sensitivity,
        deltaY: deltaY * this.sensitivity,
        isActive,
      });
    }
  }

  setSensitivity(value: number): void {
    this.sensitivity = Math.max(0.1, Math.min(2, value));
  }

  onStateChange(callback: (state: TouchCameraState) => void): void {
    this.stateChangeCallback = callback;
  }

  isMobileDevice(): boolean {
    return this.isMobile;
  }
}

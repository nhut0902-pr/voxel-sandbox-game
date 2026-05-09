export interface JoystickState {
  x: number;
  y: number;
  magnitude: number;
  angle: number;
  isActive: boolean;
}

export class VirtualJoystick {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private touchId: number | null = null;
  private centerX: number = 0;
  private centerY: number = 0;
  private currentX: number = 0;
  private currentY: number = 0;
  private radius: number = 50;
  private deadzone: number = 10;
  private state: JoystickState = {
    x: 0,
    y: 0,
    magnitude: 0,
    angle: 0,
    isActive: false,
  };

  private stateChangeCallback: ((state: JoystickState) => void) | null = null;

  constructor(containerId: string = 'joystick-container') {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    this.container = container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;

    this.setupCanvas();
    this.setupTouchEvents();
  }

  private setupCanvas(): void {
    const size = 150;
    this.canvas.width = size;
    this.canvas.height = size;
    this.canvas.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 50%;
      touch-action: none;
      z-index: 200;
      cursor: grab;
    `;

    this.centerX = size / 2;
    this.centerY = size / 2;
    this.radius = size / 3;

    this.container.appendChild(this.canvas);
    this.draw();
  }

  private setupTouchEvents(): void {
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
    document.addEventListener('touchmove', (e) => this.handleTouchMove(e), false);
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);
    document.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), false);

    // Mouse fallback for desktop testing
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e), false);
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e), false);
    document.addEventListener('mouseup', (e) => this.handleMouseUp(e), false);
  }

  private handleTouchStart(e: TouchEvent): void {
    if (this.touchId !== null) return;

    const touch = e.touches[0];
    this.touchId = touch.identifier;
    this.updatePosition(touch.clientX, touch.clientY);
  }

  private handleTouchMove(e: TouchEvent): void {
    if (this.touchId === null) return;

    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === this.touchId) {
        this.updatePosition(e.touches[i].clientX, e.touches[i].clientY);
        break;
      }
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (this.touchId === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.touchId) {
        this.touchId = null;
        this.reset();
        break;
      }
    }
  }

  private handleMouseDown(e: MouseEvent): void {
    if (this.touchId !== null) return;
    this.touchId = -1;
    this.updatePosition(e.clientX, e.clientY);
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.touchId !== -1) return;
    this.updatePosition(e.clientX, e.clientY);
  }

  private handleMouseUp(e: MouseEvent): void {
    if (this.touchId !== -1) return;
    this.touchId = null;
    this.reset();
  }

  private updatePosition(clientX: number, clientY: number): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left - this.centerX;
    const y = clientY - rect.top - this.centerY;

    const distance = Math.sqrt(x * x + y * y);

    if (distance < this.deadzone) {
      this.currentX = 0;
      this.currentY = 0;
      this.state.magnitude = 0;
    } else {
      const angle = Math.atan2(y, x);
      const limitedDistance = Math.min(distance, this.radius);

      this.currentX = Math.cos(angle) * limitedDistance;
      this.currentY = Math.sin(angle) * limitedDistance;
      this.state.magnitude = limitedDistance / this.radius;
      this.state.angle = angle;
    }

    this.state.x = this.currentX / this.radius;
    this.state.y = this.currentY / this.radius;
    this.state.isActive = true;

    this.draw();
    this.notifyStateChange();
  }

  private reset(): void {
    this.currentX = 0;
    this.currentY = 0;
    this.state = {
      x: 0,
      y: 0,
      magnitude: 0,
      angle: 0,
      isActive: false,
    };
    this.draw();
    this.notifyStateChange();
  }

  private draw(): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.clearRect(0, 0, w, h);

    // Background circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner circle (stick)
    const stickRadius = 15;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(
      this.centerX + this.currentX,
      this.centerY + this.currentY,
      stickRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Stick border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Direction indicator
    if (this.state.magnitude > 0.1) {
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.centerX, this.centerY);
      ctx.lineTo(
        this.centerX + Math.cos(this.state.angle) * (this.radius + 10),
        this.centerY + Math.sin(this.state.angle) * (this.radius + 10)
      );
      ctx.stroke();
    }
  }

  private notifyStateChange(): void {
    if (this.stateChangeCallback) {
      this.stateChangeCallback(this.state);
    }
  }

  getState(): JoystickState {
    return { ...this.state };
  }

  onStateChange(callback: (state: JoystickState) => void): void {
    this.stateChangeCallback = callback;
  }

  setDeadzone(value: number): void {
    this.deadzone = Math.max(0, Math.min(value, this.radius));
  }

  setRadius(value: number): void {
    this.radius = value;
    this.draw();
  }

  dispose(): void {
    this.canvas.remove();
  }
}

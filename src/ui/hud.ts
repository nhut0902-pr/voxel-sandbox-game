import { Player } from '../engine/player';
import { BlockType } from '../types';

export class HUD {
  private container: HTMLElement;
  private player: Player;
  private healthBar: HTMLElement;
  private hungerBar: HTMLElement;
  private hotbarContainer: HTMLElement;
  private crosshair: HTMLElement;
  private debugInfo: HTMLElement;
  private showDebug = false;

  constructor(player: Player) {
    this.player = player;
    this.container = document.getElementById('hud') || document.body;
    this.healthBar = document.createElement('div');
    this.hungerBar = document.createElement('div');
    this.hotbarContainer = document.createElement('div');
    this.crosshair = document.createElement('div');
    this.debugInfo = document.createElement('div');

    this.createHUD();
    this.setupDebugToggle();
  }

  private createHUD(): void {
    // Crosshair
    this.crosshair.id = 'crosshair';
    this.crosshair.innerHTML = '+';
    this.crosshair.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
      color: white;
      text-shadow: 0 0 2px black;
      pointer-events: none;
      z-index: 100;
    `;
    this.container.appendChild(this.crosshair);

    // Health bar
    this.healthBar.id = 'health-bar';
    this.healthBar.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 182px;
      height: 20px;
      background: rgba(0, 0, 0, 0.5);
      border: 2px solid #333;
      z-index: 100;
    `;
    this.container.appendChild(this.healthBar);

    // Hunger bar
    this.hungerBar.id = 'hunger-bar';
    this.hungerBar.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 182px;
      height: 20px;
      background: rgba(0, 0, 0, 0.5);
      border: 2px solid #333;
      z-index: 100;
    `;
    this.container.appendChild(this.hungerBar);

    // Hotbar
    this.hotbarContainer.id = 'hotbar';
    this.hotbarContainer.style.cssText = `
      position: fixed;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 4px;
      z-index: 100;
    `;
    this.container.appendChild(this.hotbarContainer);

    this.createHotbar();

    // Debug info
    this.debugInfo.id = 'debug-info';
    this.debugInfo.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: #0f0;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      z-index: 100;
      display: none;
      max-width: 400px;
    `;
    this.container.appendChild(this.debugInfo);
  }

  private createHotbar(): void {
    const inventory = this.player.getInventory();
    for (let i = 0; i < 9; i++) {
      const slot = document.createElement('div');
      slot.className = `hotbar-slot ${i === this.player.getHotbarIndex() ? 'active' : ''}`;
      slot.style.cssText = `
        width: 40px;
        height: 40px;
        background: rgba(0, 0, 0, 0.5);
        border: 2px solid ${i === this.player.getHotbarIndex() ? '#fff' : '#666'};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        cursor: pointer;
      `;

      const item = inventory[i];
      if (item) {
        slot.textContent = `${BlockType[item.type]} (${item.count})`;
      }

      this.hotbarContainer.appendChild(slot);
    }
  }

  private setupDebugToggle(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F3') {
        this.showDebug = !this.showDebug;
        this.debugInfo.style.display = this.showDebug ? 'block' : 'none';
      }
    });
  }

  update(): void {
    this.updateHealthBar();
    this.updateHungerBar();
    this.updateDebugInfo();
  }

  private updateHealthBar(): void {
    const health = this.player.getHealth();
    const percentage = (health / 20) * 100;
    this.healthBar.innerHTML = `
      <div style="
        width: ${percentage}%;
        height: 100%;
        background: linear-gradient(to right, #ff0000, #ff6666);
        transition: width 0.1s;
      "></div>
      <span style="
        position: absolute;
        top: 2px;
        left: 5px;
        color: white;
        font-size: 12px;
        font-weight: bold;
      ">${health}/20</span>
    `;
  }

  private updateHungerBar(): void {
    const hunger = this.player.getHunger();
    const percentage = (hunger / 20) * 100;
    this.hungerBar.innerHTML = `
      <div style="
        width: ${percentage}%;
        height: 100%;
        background: linear-gradient(to right, #ff9900, #ffcc66);
        transition: width 0.1s;
      "></div>
      <span style="
        position: absolute;
        top: 2px;
        left: 5px;
        color: white;
        font-size: 12px;
        font-weight: bold;
      ">${hunger}/20</span>
    `;
  }

  private updateDebugInfo(): void {
    if (!this.showDebug) return;

    const pos = this.player.getPosition();
    const info = `
      Position: ${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}
      Chunk: ${Math.floor(pos.x / 16)}, ${Math.floor(pos.z / 16)}
      Flying: ${this.player.isFlying()}
      Sprinting: ${this.player.isSprinting()}
      Selected: ${BlockType[this.player.getSelectedBlock()]}
    `;
    this.debugInfo.textContent = info;
  }

  dispose(): void {
    this.crosshair.remove();
    this.healthBar.remove();
    this.hungerBar.remove();
    this.hotbarContainer.remove();
    this.debugInfo.remove();
  }
}

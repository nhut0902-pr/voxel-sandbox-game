import { Player } from '../engine/player';
import { BlockType } from '../types';

export class MobileUI {
  private container: HTMLElement;
  private player: Player;
  private isMobile: boolean = false;
  private breakButton: HTMLElement | null = null;
  private placeButton: HTMLElement | null = null;
  private jumpButton: HTMLElement | null = null;
  private sprintButton: HTMLElement | null = null;
  private flyButton: HTMLElement | null = null;
  private hotbarContainer: HTMLElement | null = null;
  private pauseButton: HTMLElement | null = null;

  constructor(player: Player) {
    this.player = player;
    this.container = document.getElementById('mobile-ui') || document.body;
    this.isMobile = this.detectMobile();

    if (this.isMobile) {
      this.createMobileUI();
    }
  }

  private detectMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  private createMobileUI(): void {
    // Create mobile UI container
    const uiContainer = document.createElement('div');
    uiContainer.id = 'mobile-ui-container';
    uiContainer.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 150;
    `;
    this.container.appendChild(uiContainer);

    // Create action buttons (right side)
    this.createActionButtons(uiContainer);

    // Create hotbar (bottom center)
    this.createHotbar(uiContainer);

    // Create top buttons (pause, settings)
    this.createTopButtons(uiContainer);

    // Create movement indicators
    this.createMovementIndicators(uiContainer);
  }

  private createActionButtons(container: HTMLElement): void {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      position: fixed;
      bottom: 180px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: auto;
      z-index: 180;
    `;

    // Break button
    this.breakButton = this.createButton('Break', '#ff4444');
    this.breakButton.addEventListener('touchstart', () => {
      this.player.breakBlock();
    });
    buttonContainer.appendChild(this.breakButton);

    // Place button
    this.placeButton = this.createButton('Place', '#44ff44');
    this.placeButton.addEventListener('touchstart', () => {
      const selectedBlock = this.player.getSelectedBlock();
      this.player.placeBlock(selectedBlock);
    });
    buttonContainer.appendChild(this.placeButton);

    // Jump button
    this.jumpButton = this.createButton('Jump', '#4444ff');
    this.jumpButton.addEventListener('touchstart', () => {
      // Trigger jump via keyboard event
      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);
    });
    buttonContainer.appendChild(this.jumpButton);

    // Sprint button
    this.sprintButton = this.createButton('Sprint', '#ffff44');
    this.sprintButton.addEventListener('touchstart', () => {
      const event = new KeyboardEvent('keydown', { key: 'Shift' });
      document.dispatchEvent(event);
    });
    this.sprintButton.addEventListener('touchend', () => {
      const event = new KeyboardEvent('keyup', { key: 'Shift' });
      document.dispatchEvent(event);
    });
    buttonContainer.appendChild(this.sprintButton);

    // Fly button
    this.flyButton = this.createButton('Fly', '#ff44ff');
    this.flyButton.addEventListener('touchstart', () => {
      const event = new KeyboardEvent('keydown', { key: 'f' });
      document.dispatchEvent(event);
    });
    buttonContainer.appendChild(this.flyButton);

    container.appendChild(buttonContainer);
  }

  private createButton(text: string, color: string): HTMLElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 2px solid white;
      background: ${color};
      color: white;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      transition: all 0.1s;
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
    `;

    button.addEventListener('touchstart', () => {
      button.style.transform = 'scale(0.9)';
      button.style.opacity = '0.8';
    });

    button.addEventListener('touchend', () => {
      button.style.transform = 'scale(1)';
      button.style.opacity = '1';
    });

    return button;
  }

  private createHotbar(container: HTMLElement): void {
    this.hotbarContainer = document.createElement('div');
    this.hotbarContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      background: rgba(0, 0, 0, 0.5);
      padding: 8px;
      border-radius: 8px;
      pointer-events: auto;
      z-index: 180;
    `;

    const inventory = this.player.getInventory();
    for (let i = 0; i < 9; i++) {
      const slot = document.createElement('button');
      slot.className = `hotbar-slot-mobile ${i === this.player.getHotbarIndex() ? 'active' : ''}`;
      slot.style.cssText = `
        width: 50px;
        height: 50px;
        background: rgba(50, 50, 50, 0.8);
        border: 2px solid ${i === this.player.getHotbarIndex() ? '#fff' : '#666'};
        border-radius: 4px;
        color: white;
        font-size: 11px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        padding: 4px;
        text-align: center;
        transition: all 0.1s;
        touch-action: manipulation;
      `;

      const item = inventory[i];
      if (item) {
        slot.innerHTML = `<div style="font-weight: bold; font-size: 10px;">${BlockType[item.type]}</div><div style="font-size: 9px;">${item.count}</div>`;
      }

      slot.addEventListener('click', () => {
        // Trigger number key
        const event = new KeyboardEvent('keydown', { key: String(i + 1) });
        document.dispatchEvent(event);
      });

      this.hotbarContainer.appendChild(slot);
    }

    container.appendChild(this.hotbarContainer);
  }

  private createTopButtons(container: HTMLElement): void {
    const topContainer = document.createElement('div');
    topContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      gap: 10px;
      pointer-events: auto;
      z-index: 180;
    `;

    // Pause button
    this.pauseButton = document.createElement('button');
    this.pauseButton.textContent = '⏸';
    this.pauseButton.style.cssText = `
      width: 50px;
      height: 50px;
      border-radius: 8px;
      border: 2px solid white;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      transition: all 0.1s;
      touch-action: manipulation;
    `;

    this.pauseButton.addEventListener('click', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
    });

    topContainer.appendChild(this.pauseButton);
    container.appendChild(topContainer);
  }

  private createMovementIndicators(container: HTMLElement): void {
    const indicatorContainer = document.createElement('div');
    indicatorContainer.style.cssText = `
      position: fixed;
      top: 50%;
      right: 20px;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      gap: 15px;
      pointer-events: none;
      z-index: 100;
    `;

    // Health indicator
    const healthIndicator = document.createElement('div');
    healthIndicator.id = 'mobile-health';
    healthIndicator.style.cssText = `
      width: 40px;
      height: 40px;
      background: rgba(255, 0, 0, 0.3);
      border: 2px solid red;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
    `;
    healthIndicator.textContent = '❤️';
    indicatorContainer.appendChild(healthIndicator);

    // Hunger indicator
    const hungerIndicator = document.createElement('div');
    hungerIndicator.id = 'mobile-hunger';
    hungerIndicator.style.cssText = `
      width: 40px;
      height: 40px;
      background: rgba(255, 165, 0, 0.3);
      border: 2px solid orange;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
    `;
    hungerIndicator.textContent = '🍗';
    indicatorContainer.appendChild(hungerIndicator);

    container.appendChild(indicatorContainer);
  }

  update(): void {
    // Update hotbar active state
    if (this.hotbarContainer) {
      const slots = this.hotbarContainer.querySelectorAll('.hotbar-slot-mobile');
      slots.forEach((slot, index) => {
        if (index === this.player.getHotbarIndex()) {
          (slot as HTMLElement).style.borderColor = '#fff';
          (slot as HTMLElement).style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
        } else {
          (slot as HTMLElement).style.borderColor = '#666';
          (slot as HTMLElement).style.boxShadow = 'none';
        }
      });
    }

    // Update health indicator
    const healthIndicator = document.getElementById('mobile-health');
    if (healthIndicator) {
      const health = this.player.getHealth();
      healthIndicator.textContent = `❤️ ${health}`;
      const healthPercent = (health / 20) * 100;
      healthIndicator.style.background = `rgba(255, 0, 0, ${0.3 + healthPercent / 200})`;
    }

    // Update hunger indicator
    const hungerIndicator = document.getElementById('mobile-hunger');
    if (hungerIndicator) {
      const hunger = this.player.getHunger();
      hungerIndicator.textContent = `🍗 ${hunger}`;
      const hungerPercent = (hunger / 20) * 100;
      hungerIndicator.style.background = `rgba(255, 165, 0, ${0.3 + hungerPercent / 200})`;
    }
  }

  dispose(): void {
    const container = document.getElementById('mobile-ui-container');
    if (container) {
      container.remove();
    }
  }

  isMobileDevice(): boolean {
    return this.isMobile;
  }
}

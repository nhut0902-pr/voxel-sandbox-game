import * as THREE from 'three';
import { PlayerData, Vector3, BlockType, InventoryItem } from '../types';
import { ChunkManager } from './chunkmanager';
import { isBlockSolid, isBlockLiquid } from './blocks';

const GRAVITY = 0.0098;
const PLAYER_SPEED = 0.1;
const SPRINT_MULTIPLIER = 1.5;
const JUMP_FORCE = 0.42;
const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.3;

export class Player {
  private data: PlayerData;
  private camera: THREE.PerspectiveCamera;
  private chunkManager: ChunkManager;
  private keys: Record<string, boolean> = {};
  private mouseX = 0;
  private mouseY = 0;
  private isOnGround = false;
  private canJump = true;
  private swimTimer = 0;

  constructor(camera: THREE.PerspectiveCamera, chunkManager: ChunkManager) {
    this.camera = camera;
    this.chunkManager = chunkManager;

    this.data = {
      position: { x: 0, y: 100, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0 },
      health: 20,
      hunger: 20,
      inventory: this.initializeInventory(),
      hotbarIndex: 0,
      isFlying: false,
      isSprinting: false,
    };

    this.setupControls();
  }

  private initializeInventory(): InventoryItem[] {
    return [
      { type: BlockType.DIRT, count: 64 },
      { type: BlockType.STONE, count: 64 },
      { type: BlockType.GRASS, count: 64 },
      { type: BlockType.WOOD, count: 32 },
      { type: BlockType.LEAVES, count: 32 },
      { type: BlockType.SAND, count: 32 },
      { type: BlockType.GLASS, count: 16 },
    ];
  }

  private setupControls(): void {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;

      if (e.key === 'f') this.data.isFlying = !this.data.isFlying;
      if (e.key === 'Shift') this.data.isSprinting = true;
      if (e.key === ' ') this.jump();

      // Hotbar selection
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        this.data.hotbarIndex = num - 1;
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      if (e.key === 'Shift') this.data.isSprinting = false;
    });

    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.movementX || 0;
      this.mouseY = e.movementY || 0;
    });

    document.addEventListener('click', () => {
      this.camera.getWorldDirection(new THREE.Vector3());
    });
  }

  update(deltaTime: number): void {
    // Update rotation
    this.data.rotation.y += this.mouseX * 0.003;
    this.data.rotation.x -= this.mouseY * 0.003;

    // Clamp pitch
    this.data.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.data.rotation.x));

    // Update camera
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.data.rotation.y;
    this.camera.rotation.x = this.data.rotation.x;

    // Handle movement
    this.handleMovement(deltaTime);

    // Apply gravity
    if (!this.data.isFlying) {
      this.data.velocity.y -= GRAVITY;
    } else {
      this.data.velocity.y = 0;
    }

    // Apply velocity
    this.data.position.x += this.data.velocity.x;
    this.data.position.y += this.data.velocity.y;
    this.data.position.z += this.data.velocity.z;

    // Collision detection
    this.handleCollisions();

    // Update camera position
    this.camera.position.set(
      this.data.position.x,
      this.data.position.y + PLAYER_HEIGHT * 0.85,
      this.data.position.z
    );

    // Update chunk loading
    this.chunkManager.updateChunks(this.data.position);

    // Reset mouse movement
    this.mouseX = 0;
    this.mouseY = 0;
  }

  private handleMovement(deltaTime: number): void {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    forward.setFromMatrixColumn(this.camera.matrix, 0);
    forward.y = 0;
    forward.normalize();

    right.setFromMatrixColumn(this.camera.matrix, 0);
    right.y = 0;
    right.normalize();

    const moveSpeed = this.data.isSprinting ? PLAYER_SPEED * SPRINT_MULTIPLIER : PLAYER_SPEED;
    const moveVector = new THREE.Vector3();

    if (this.keys['w']) moveVector.add(forward);
    if (this.keys['s']) moveVector.sub(forward);
    if (this.keys['a']) moveVector.sub(right);
    if (this.keys['d']) moveVector.add(right);

    if (moveVector.length() > 0) {
      moveVector.normalize().multiplyScalar(moveSpeed);
      this.data.velocity.x = moveVector.x;
      this.data.velocity.z = moveVector.z;
    } else {
      this.data.velocity.x *= 0.9;
      this.data.velocity.z *= 0.9;
    }

    // Flying mode
    if (this.data.isFlying) {
      if (this.keys[' ']) this.data.velocity.y = moveSpeed;
      if (this.keys['shift']) this.data.velocity.y = -moveSpeed;
    }
  }

  private handleCollisions(): void {
    const checkPos = (x: number, y: number, z: number): boolean => {
      const block = this.chunkManager.getBlock({ x, y, z });
      return !!(block && isBlockSolid(block.type));
    };

    // Simple AABB collision
    const px = this.data.position.x;
    const py = this.data.position.y;
    const pz = this.data.position.z;

    // Check ground
    this.isOnGround = checkPos(px, py - 0.1, pz) || checkPos(px, py - 0.1, pz);

    if (this.isOnGround) {
      this.canJump = true;
      this.data.velocity.y = Math.max(0, this.data.velocity.y);
    }

    // Check collisions
    if (checkPos(px + PLAYER_RADIUS, py, pz) || checkPos(px - PLAYER_RADIUS, py, pz)) {
      this.data.velocity.x = 0;
    }
    if (checkPos(px, py, pz + PLAYER_RADIUS) || checkPos(px, py, pz - PLAYER_RADIUS)) {
      this.data.velocity.z = 0;
    }
  }

  private jump(): void {
    if (this.canJump && !this.data.isFlying) {
      this.data.velocity.y = JUMP_FORCE;
      this.canJump = false;
    }
  }

  placeBlock(blockType: BlockType): void {
    const raycaster = new THREE.Raycaster(this.camera.position, this.getForwardVector());
    const maxDistance = 5;

    const rayOrigin = raycaster.ray.origin;
    const rayDir = raycaster.ray.direction;

    for (let i = 0; i < maxDistance * 10; i++) {
      const checkPos = {
        x: rayOrigin.x + rayDir.x * (i * 0.1),
        y: rayOrigin.y + rayDir.y * (i * 0.1),
        z: rayOrigin.z + rayDir.z * (i * 0.1),
      };

      const block = this.chunkManager.getBlock(checkPos);
      if (block && isBlockSolid(block.type)) {
        // Place block at previous position
        const placePos = {
          x: Math.round(rayOrigin.x + rayDir.x * ((i - 1) * 0.1)),
          y: Math.round(rayOrigin.y + rayDir.y * ((i - 1) * 0.1)),
          z: Math.round(rayOrigin.z + rayDir.z * ((i - 1) * 0.1)),
        };
        this.chunkManager.setBlock(placePos, blockType);
        return;
      }
    }
  }

  breakBlock(): void {
    const raycaster = new THREE.Raycaster(this.camera.position, this.getForwardVector());
    const maxDistance = 5;

    const rayOrigin = raycaster.ray.origin;
    const rayDir = raycaster.ray.direction;

    for (let i = 0; i < maxDistance * 10; i++) {
      const checkPos = {
        x: rayOrigin.x + rayDir.x * (i * 0.1),
        y: rayOrigin.y + rayDir.y * (i * 0.1),
        z: rayOrigin.z + rayDir.z * (i * 0.1),
      };

      const block = this.chunkManager.getBlock(checkPos);
      if (block && isBlockSolid(block.type)) {
        this.chunkManager.setBlock(checkPos, BlockType.AIR);
        return;
      }
    }
  }

  private getForwardVector(): THREE.Vector3 {
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    return forward.normalize();
  }

  getData(): PlayerData {
    return this.data;
  }

  getPosition(): Vector3 {
    return this.data.position;
  }

  getHealth(): number {
    return this.data.health;
  }

  getHunger(): number {
    return this.data.hunger;
  }

  getInventory(): InventoryItem[] {
    return this.data.inventory;
  }

  getHotbarIndex(): number {
    return this.data.hotbarIndex;
  }

  getSelectedBlock(): BlockType {
    const item = this.data.inventory[this.data.hotbarIndex];
    return item?.type || BlockType.DIRT;
  }

  isFlying(): boolean {
    return this.data.isFlying;
  }

  isSprinting(): boolean {
    return this.data.isSprinting;
  }
}

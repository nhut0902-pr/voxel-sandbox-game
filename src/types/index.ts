export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface ChunkCoord {
  x: number;
  z: number;
}

export interface BlockData {
  type: BlockType;
  metadata?: number;
}

export enum BlockType {
  AIR = 0,
  DIRT = 1,
  GRASS = 2,
  STONE = 3,
  SAND = 4,
  WOOD = 5,
  LEAVES = 6,
  GLASS = 7,
  WATER = 8,
  LAVA = 9,
  COAL_ORE = 10,
  IRON_ORE = 11,
  GOLD_ORE = 12,
  DIAMOND_ORE = 13,
}

export interface BlockTexture {
  top: number;
  bottom: number;
  front: number;
  back: number;
  left: number;
  right: number;
}

export interface Chunk {
  coord: ChunkCoord;
  blocks: BlockData[][][];
  mesh?: any;
  isDirty: boolean;
  isLoaded: boolean;
}

export interface PlayerData {
  position: Vector3;
  velocity: Vector3;
  rotation: { x: number; y: number };
  health: number;
  hunger: number;
  inventory: InventoryItem[];
  hotbarIndex: number;
  isFlying: boolean;
  isSprinting: boolean;
}

export interface InventoryItem {
  type: BlockType;
  count: number;
}

export interface GameState {
  isPaused: boolean;
  isCreativeMode: boolean;
  renderDistance: number;
  fpsTarget: number;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  seed: number;
}

export interface RaycastHit {
  blockPos: Vector3;
  face: 'top' | 'bottom' | 'front' | 'back' | 'left' | 'right';
  distance: number;
}

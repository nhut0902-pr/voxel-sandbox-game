import { createNoise2D, createNoise3D } from 'simplex-noise';
import { BlockType, BlockData, Vector3 } from '../types';

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 256;
const SEA_LEVEL = 64;

export class WorldGenerator {
  private noise2D: ReturnType<typeof createNoise2D>;
  private noise3D: ReturnType<typeof createNoise3D>;
  private seed: number;

  constructor(seed: number = 12345) {
    this.seed = seed;
    const seededRandom = () => this.seededRandom();
    this.noise2D = createNoise2D(seededRandom);
    this.noise3D = createNoise3D(seededRandom);
  }

  private seededRandom(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  generateChunk(chunkX: number, chunkZ: number): BlockData[][][] {
    const blocks: BlockData[][][] = [];

    for (let x = 0; x < CHUNK_SIZE; x++) {
      blocks[x] = [];
      for (let z = 0; z < CHUNK_SIZE; z++) {
        blocks[x][z] = [];

        const worldX = chunkX * CHUNK_SIZE + x;
        const worldZ = chunkZ * CHUNK_SIZE + z;

        // Generate terrain height
        const height = this.getTerrainHeight(worldX, worldZ);
        const biome = this.getBiome(worldX, worldZ);

        for (let y = 0; y < CHUNK_HEIGHT; y++) {
          const block = this.getBlockAtHeight(y, height, biome, worldX, worldZ);
          blocks[x][z][y] = { type: block };
        }
      }
    }

    // Generate trees and vegetation
    this.generateTrees(blocks, chunkX, chunkZ);

    return blocks;
  }

  private getTerrainHeight(x: number, z: number): number {
    let height = 0;

    // Base terrain
    const baseNoise = this.noise2D(x * 0.01, z * 0.01) * 0.5 + 0.5;
    height += baseNoise * 32;

    // Hills
    const hillNoise = this.noise2D(x * 0.005, z * 0.005) * 0.5 + 0.5;
    height += hillNoise * 48;

    // Details
    const detailNoise = this.noise2D(x * 0.05, z * 0.05) * 0.5 + 0.5;
    height += detailNoise * 8;

    const finalHeight = Math.floor(Math.max(SEA_LEVEL - 10, Math.min(CHUNK_HEIGHT - 20, height + SEA_LEVEL)));
    return finalHeight;
  }

  private getBiome(x: number, z: number): string {
    const biomeNoise = this.noise2D(x * 0.002, z * 0.002) * 0.5 + 0.5;
    const tempNoise = this.noise2D(x * 0.001 + 1000, z * 0.001 + 1000) * 0.5 + 0.5;

    if (tempNoise > 0.7) return 'snow';
    if (tempNoise < 0.3) return 'desert';
    if (biomeNoise > 0.6) return 'forest';
    if (biomeNoise > 0.4) return 'mountains';
    return 'plains';
  }

  private getBlockAtHeight(y: number, terrainHeight: number, biome: string, worldX: number, worldZ: number): BlockType {
    if (y > terrainHeight) {
      // Sky or water
      if (y < SEA_LEVEL) return BlockType.WATER;
      return BlockType.AIR;
    }

    // Bedrock at bottom
    if (y < 5) return BlockType.STONE;

    // Caves
    const caveNoise = Math.abs(this.noise3D(worldX * 0.05, y * 0.05, worldZ * 0.05));
    if (caveNoise < 0.3 && y > 20 && y < terrainHeight - 5) {
      return BlockType.AIR;
    }

    // Ores
    if (y < terrainHeight - 10) {
      const oreNoise = this.noise3D(worldX * 0.1, y * 0.1, worldZ * 0.1);
      if (oreNoise > 0.7) return BlockType.COAL_ORE;
      if (oreNoise > 0.75) return BlockType.IRON_ORE;
      if (oreNoise > 0.8) return BlockType.GOLD_ORE;
      if (oreNoise > 0.85) return BlockType.DIAMOND_ORE;
    }

    // Surface blocks
    const depthFromSurface = terrainHeight - y;

    if (depthFromSurface === 0) {
      // Top surface - always show grass or sand
      if (biome === 'desert') return BlockType.SAND;
      if (biome === 'snow') return BlockType.SAND;
      return BlockType.GRASS;
    }

    if (depthFromSurface < 4) {
      // Dirt layer
      if (biome === 'desert') return BlockType.SAND;
      return BlockType.DIRT;
    }

    // Stone
    return BlockType.STONE;
  }

  generateTrees(blocks: BlockData[][][], chunkX: number, chunkZ: number): void {
    const treeNoise = this.noise2D(chunkX * 0.3, chunkZ * 0.3);
    if (treeNoise < 0.3) return;

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const worldX = chunkX * CHUNK_SIZE + x;
        const worldZ = chunkZ * CHUNK_SIZE + z;

        const treeChance = this.noise2D(worldX * 0.1, worldZ * 0.1) * 0.5 + 0.5;
        if (treeChance > 0.85) {
          // Find ground level
          for (let y = CHUNK_HEIGHT - 1; y > 0; y--) {
            if (blocks[x][z][y].type !== BlockType.AIR && blocks[x][z][y].type !== BlockType.WATER) {
              this.placeTree(blocks, x, y + 1, z);
              break;
            }
          }
        }
      }
    }
  }

  private placeTree(blocks: BlockData[][][], x: number, y: number, z: number): void {
    const height = 5 + Math.floor(Math.random() * 3);

    // Trunk
    for (let i = 0; i < height; i++) {
      if (y + i < CHUNK_HEIGHT) {
        blocks[x][z][y + i] = { type: BlockType.WOOD };
      }
    }

    // Leaves
    const leafRadius = 3;
    for (let dx = -leafRadius; dx <= leafRadius; dx++) {
      for (let dz = -leafRadius; dz <= leafRadius; dz++) {
        for (let dy = 0; dy < 4; dy++) {
          const distance = Math.sqrt(dx * dx + dz * dz);
          if (distance < leafRadius && y + height - 2 + dy < CHUNK_HEIGHT) {
            const lx = x + dx;
            const lz = z + dz;
            if (lx >= 0 && lx < CHUNK_SIZE && lz >= 0 && lz < CHUNK_SIZE) {
              if (blocks[lx][lz][y + height - 2 + dy].type === BlockType.AIR) {
                blocks[lx][lz][y + height - 2 + dy] = { type: BlockType.LEAVES };
              }
            }
          }
        }
      }
    }
  }
}

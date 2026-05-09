import * as THREE from 'three';
import { Chunk, ChunkCoord, BlockData, Vector3 } from '../types';
import { WorldGenerator } from './worldgen';
import { ChunkMesher } from './mesher';

const CHUNK_SIZE = 16;

export class ChunkManager {
  private chunks: Map<string, Chunk> = new Map();
  private worldGenerator: WorldGenerator;
  private mesher: ChunkMesher;
  private renderDistance: number = 8;
  private scene: THREE.Scene;
  private lastPlayerChunk: ChunkCoord = { x: 0, z: 0 };

  constructor(scene: THREE.Scene, seed: number) {
    this.scene = scene;
    this.worldGenerator = new WorldGenerator(seed);
    this.mesher = new ChunkMesher();
  }

  private getChunkKey(coord: ChunkCoord): string {
    return `${coord.x},${coord.z}`;
  }

  private getChunkCoord(pos: Vector3): ChunkCoord {
    return {
      x: Math.floor(pos.x / CHUNK_SIZE),
      z: Math.floor(pos.z / CHUNK_SIZE),
    };
  }

  updateChunks(playerPos: Vector3): void {
    const playerChunk = this.getChunkCoord(playerPos);

    // Check if player moved to a new chunk
    if (playerChunk.x !== this.lastPlayerChunk.x || playerChunk.z !== this.lastPlayerChunk.z) {
      this.lastPlayerChunk = playerChunk;
      this.loadVisibleChunks(playerChunk);
      this.unloadDistantChunks(playerChunk);
    }
  }

  private loadVisibleChunks(centerChunk: ChunkCoord): void {
    for (let x = centerChunk.x - this.renderDistance; x <= centerChunk.x + this.renderDistance; x++) {
      for (let z = centerChunk.z - this.renderDistance; z <= centerChunk.z + this.renderDistance; z++) {
        const coord = { x, z };
        const key = this.getChunkKey(coord);

        if (!this.chunks.has(key)) {
          this.loadChunk(coord);
        }
      }
    }
  }

  private unloadDistantChunks(centerChunk: ChunkCoord): void {
    const chunksToRemove: string[] = [];

    this.chunks.forEach((chunk, key) => {
      const distance = Math.max(
        Math.abs(chunk.coord.x - centerChunk.x),
        Math.abs(chunk.coord.z - centerChunk.z)
      );

      if (distance > this.renderDistance + 1) {
        chunksToRemove.push(key);
      }
    });

    chunksToRemove.forEach((key) => {
      const chunk = this.chunks.get(key);
      if (chunk?.mesh) {
        this.scene.remove(chunk.mesh);
      }
      this.chunks.delete(key);
    });
  }

  private loadChunk(coord: ChunkCoord): void {
    const blocks = this.worldGenerator.generateChunk(coord.x, coord.z);
    this.worldGenerator.generateTrees(blocks, coord.x, coord.z);

    const chunk: Chunk = {
      coord,
      blocks,
      isDirty: true,
      isLoaded: true,
    };

    this.chunks.set(this.getChunkKey(coord), chunk);
    this.meshChunk(chunk);
  }

  private meshChunk(chunk: Chunk): void {
    // Get neighboring chunks for face culling
    const neighbors = {
      north: this.chunks.get(this.getChunkKey({ x: chunk.coord.x, z: chunk.coord.z - 1 })),
      south: this.chunks.get(this.getChunkKey({ x: chunk.coord.x, z: chunk.coord.z + 1 })),
      east: this.chunks.get(this.getChunkKey({ x: chunk.coord.x + 1, z: chunk.coord.z })),
      west: this.chunks.get(this.getChunkKey({ x: chunk.coord.x - 1, z: chunk.coord.z })),
    };

    const mesh = this.mesher.createChunkMesh(chunk, neighbors);
    if (mesh) {
      mesh.position.set(
        chunk.coord.x * CHUNK_SIZE,
        0,
        chunk.coord.z * CHUNK_SIZE
      );
      this.scene.add(mesh);
      chunk.mesh = mesh;
    }
    chunk.isDirty = false;
  }

  getBlock(pos: Vector3): BlockData | null {
    const chunkCoord = this.getChunkCoord(pos);
    const key = this.getChunkKey(chunkCoord);
    const chunk = this.chunks.get(key);

    if (!chunk) return null;

    const localX = Math.floor(pos.x) % CHUNK_SIZE;
    const localZ = Math.floor(pos.z) % CHUNK_SIZE;
    const y = Math.floor(pos.y);

    if (y < 0 || y >= 256) return null;

    return chunk.blocks[localX]?.[localZ]?.[y] ?? null;
  }

  setBlock(pos: Vector3, blockType: number): void {
    const chunkCoord = this.getChunkCoord(pos);
    const key = this.getChunkKey(chunkCoord);
    const chunk = this.chunks.get(key);

    if (!chunk) return;

    const localX = Math.floor(pos.x) % CHUNK_SIZE;
    const localZ = Math.floor(pos.z) % CHUNK_SIZE;
    const y = Math.floor(pos.y);

    if (y < 0 || y >= 256) return;

    chunk.blocks[localX][localZ][y] = { type: blockType };
    chunk.isDirty = true;

    // Remesh the chunk
    this.meshChunk(chunk);

    // Remesh neighboring chunks if block is on edge
    if (localX === 0) this.remeshNeighbor({ x: chunkCoord.x - 1, z: chunkCoord.z });
    if (localX === CHUNK_SIZE - 1) this.remeshNeighbor({ x: chunkCoord.x + 1, z: chunkCoord.z });
    if (localZ === 0) this.remeshNeighbor({ x: chunkCoord.x, z: chunkCoord.z - 1 });
    if (localZ === CHUNK_SIZE - 1) this.remeshNeighbor({ x: chunkCoord.x, z: chunkCoord.z + 1 });
  }

  private remeshNeighbor(coord: ChunkCoord): void {
    const key = this.getChunkKey(coord);
    const chunk = this.chunks.get(key);
    if (chunk) {
      this.meshChunk(chunk);
    }
  }

  setRenderDistance(distance: number): void {
    this.renderDistance = distance;
  }

  getChunk(coord: ChunkCoord): Chunk | undefined {
    return this.chunks.get(this.getChunkKey(coord));
  }

  getAllChunks(): Chunk[] {
    return Array.from(this.chunks.values());
  }

  clear(): void {
    this.chunks.forEach((chunk) => {
      if (chunk.mesh) {
        this.scene.remove(chunk.mesh);
      }
    });
    this.chunks.clear();
  }
}

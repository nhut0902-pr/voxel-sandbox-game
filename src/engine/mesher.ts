import * as THREE from 'three';
import { Chunk, BlockData } from '../types';
import { BLOCK_TEXTURES, isBlockSolid, isBlockTransparent } from './blocks';

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 256;
const TEXTURE_ATLAS_SIZE = 16;
const TEXTURE_SIZE = 1 / TEXTURE_ATLAS_SIZE;

export class ChunkMesher {
  private textureCanvas: HTMLCanvasElement;
  private textureCtx: CanvasRenderingContext2D;

  constructor() {
    this.textureCanvas = document.createElement('canvas');
    this.textureCanvas.width = 256;
    this.textureCanvas.height = 256;
    this.textureCtx = this.textureCanvas.getContext('2d')!;
    this.generateTextureAtlas();
  }

  private generateTextureAtlas(): void {
    // Generate simple colored textures for each block type
    const colors: Record<number, string> = {
      0: '#8B7355', // Dirt
      1: '#808080', // Stone
      2: '#228B22', // Grass top
      3: '#8B7355', // Grass side
      4: '#F4A460', // Sand
      5: '#654321', // Wood
      6: '#228B22', // Leaves
      7: '#87CEEB', // Glass
      14: '#4169E1', // Water
      15: '#FF4500', // Lava
      16: '#36454F', // Coal ore
      17: '#A9A9A9', // Iron ore
      18: '#F4A460', // Sand
      19: '#FFD700', // Gold ore
      20: '#00CED1', // Diamond ore
    };

    for (let i = 0; i < TEXTURE_ATLAS_SIZE * TEXTURE_ATLAS_SIZE; i++) {
      const x = (i % TEXTURE_ATLAS_SIZE) * 16;
      const y = Math.floor(i / TEXTURE_ATLAS_SIZE) * 16;
      const color = colors[i] || '#808080';

      this.textureCtx.fillStyle = color;
      this.textureCtx.fillRect(x, y, 16, 16);

      // Add grid
      this.textureCtx.strokeStyle = '#000000';
      this.textureCtx.lineWidth = 0.5;
      this.textureCtx.strokeRect(x, y, 16, 16);
    }
  }

  createChunkMesh(chunk: Chunk, neighbors: any): THREE.Mesh | null {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    let vertexCount = 0;

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        for (let y = 0; y < CHUNK_HEIGHT; y++) {
          const block = chunk.blocks[x][z][y];
          if (!isBlockSolid(block.type)) continue;

          // Check each face
          if (this.isFaceVisible(x, y, z, 'top', chunk, neighbors)) {
            this.addFace(positions, uvs, normals, indices, x, y, z, 'top', block.type, vertexCount);
            vertexCount += 4;
          }

          if (this.isFaceVisible(x, y, z, 'bottom', chunk, neighbors)) {
            this.addFace(positions, uvs, normals, indices, x, y, z, 'bottom', block.type, vertexCount);
            vertexCount += 4;
          }

          if (this.isFaceVisible(x, y, z, 'front', chunk, neighbors)) {
            this.addFace(positions, uvs, normals, indices, x, y, z, 'front', block.type, vertexCount);
            vertexCount += 4;
          }

          if (this.isFaceVisible(x, y, z, 'back', chunk, neighbors)) {
            this.addFace(positions, uvs, normals, indices, x, y, z, 'back', block.type, vertexCount);
            vertexCount += 4;
          }

          if (this.isFaceVisible(x, y, z, 'left', chunk, neighbors)) {
            this.addFace(positions, uvs, normals, indices, x, y, z, 'left', block.type, vertexCount);
            vertexCount += 4;
          }

          if (this.isFaceVisible(x, y, z, 'right', chunk, neighbors)) {
            this.addFace(positions, uvs, normals, indices, x, y, z, 'right', block.type, vertexCount);
            vertexCount += 4;
          }
        }
      }
    }

    if (positions.length === 0) return null;

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
    geometry.computeVertexNormals();

    const texture = new THREE.CanvasTexture(this.textureCanvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      flatShading: false,
      side: THREE.FrontSide,
    });

    return new THREE.Mesh(geometry, material);
  }

  private isFaceVisible(
    x: number,
    y: number,
    z: number,
    face: string,
    chunk: Chunk,
    neighbors: any
  ): boolean {
    const faceDir = this.getFaceDirection(face);
    const nx = x + faceDir.x;
    const ny = y + faceDir.y;
    const nz = z + faceDir.z;

    const neighborBlock = this.getNeighborBlock(chunk, neighbors, { x: nx, y: ny, z: nz });

    // Face is visible if neighbor is air or transparent
    if (!neighborBlock || !isBlockSolid(neighborBlock.type)) {
      return true;
    }

    return false;
  }

  private addFace(
    positions: number[],
    uvs: number[],
    normals: number[],
    indices: number[],
    x: number,
    y: number,
    z: number,
    face: string,
    blockType: number,
    vertexCount: number
  ): void {
    const texture = BLOCK_TEXTURES[blockType];
    const textureIndex = texture[face as keyof typeof texture] || 0;
    const uvX = (textureIndex % TEXTURE_ATLAS_SIZE) * TEXTURE_SIZE;
    const uvY = Math.floor(textureIndex / TEXTURE_ATLAS_SIZE) * TEXTURE_SIZE;

    let verts: number[][] = [];
    let norm: number[] = [0, 0, 0];

    switch (face) {
      case 'top':
        verts = [[x, y + 1, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]];
        norm = [0, 1, 0];
        break;
      case 'bottom':
        verts = [[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y, z], [x, y, z]];
        norm = [0, -1, 0];
        break;
      case 'front':
        verts = [[x, y, z], [x + 1, y, z], [x + 1, y + 1, z], [x, y + 1, z]];
        norm = [0, 0, -1];
        break;
      case 'back':
        verts = [[x + 1, y, z + 1], [x, y, z + 1], [x, y + 1, z + 1], [x + 1, y + 1, z + 1]];
        norm = [0, 0, 1];
        break;
      case 'left':
        verts = [[x, y, z + 1], [x, y, z], [x, y + 1, z], [x, y + 1, z + 1]];
        norm = [-1, 0, 0];
        break;
      case 'right':
        verts = [[x + 1, y, z], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x + 1, y + 1, z]];
        norm = [1, 0, 0];
        break;
    }

    for (let i = 0; i < 4; i++) {
      positions.push(...verts[i]);
      normals.push(...norm);
      uvs.push(uvX + (i % 2) * TEXTURE_SIZE, uvY + Math.floor(i / 2) * TEXTURE_SIZE);
    }

    indices.push(vertexCount, vertexCount + 1, vertexCount + 2);
    indices.push(vertexCount, vertexCount + 2, vertexCount + 3);
  }

  private getFaceDirection(face: string): { x: number; y: number; z: number } {
    const directions: Record<string, { x: number; y: number; z: number }> = {
      top: { x: 0, y: 1, z: 0 },
      bottom: { x: 0, y: -1, z: 0 },
      front: { x: 0, y: 0, z: -1 },
      back: { x: 0, y: 0, z: 1 },
      left: { x: -1, y: 0, z: 0 },
      right: { x: 1, y: 0, z: 0 },
    };
    return directions[face] || { x: 0, y: 0, z: 0 };
  }

  private getNeighborBlock(chunk: Chunk, neighbors: any, pos: any): BlockData | null {
    if (pos.y < 0 || pos.y >= CHUNK_HEIGHT) return null;

    if (pos.x >= 0 && pos.x < CHUNK_SIZE && pos.z >= 0 && pos.z < CHUNK_SIZE) {
      return chunk.blocks[pos.x]?.[pos.z]?.[pos.y] ?? null;
    }

    // Check neighboring chunks
    if (pos.x < 0 && neighbors?.west) {
      return neighbors.west.blocks[CHUNK_SIZE + pos.x]?.[pos.z]?.[pos.y] ?? null;
    }
    if (pos.x >= CHUNK_SIZE && neighbors?.east) {
      return neighbors.east.blocks[pos.x - CHUNK_SIZE]?.[pos.z]?.[pos.y] ?? null;
    }
    if (pos.z < 0 && neighbors?.north) {
      return neighbors.north.blocks[pos.x]?.[CHUNK_SIZE + pos.z]?.[pos.y] ?? null;
    }
    if (pos.z >= CHUNK_SIZE && neighbors?.south) {
      return neighbors.south.blocks[pos.x]?.[pos.z - CHUNK_SIZE]?.[pos.y] ?? null;
    }

    return null;
  }
}

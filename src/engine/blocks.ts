import { BlockType, BlockTexture } from '../types';

export const BLOCK_TEXTURES: Record<number, BlockTexture> = {
  [BlockType.AIR]: { top: 0, bottom: 0, front: 0, back: 0, left: 0, right: 0 },
  [BlockType.DIRT]: { top: 2, bottom: 2, front: 2, back: 2, left: 2, right: 2 },
  [BlockType.GRASS]: { top: 0, bottom: 2, front: 3, back: 3, left: 3, right: 3 },
  [BlockType.STONE]: { top: 1, bottom: 1, front: 1, back: 1, left: 1, right: 1 },
  [BlockType.SAND]: { top: 18, bottom: 18, front: 18, back: 18, left: 18, right: 18 },
  [BlockType.WOOD]: { top: 4, bottom: 4, front: 5, back: 5, left: 5, right: 5 },
  [BlockType.LEAVES]: { top: 6, bottom: 6, front: 6, back: 6, left: 6, right: 6 },
  [BlockType.GLASS]: { top: 7, bottom: 7, front: 7, back: 7, left: 7, right: 7 },
  [BlockType.WATER]: { top: 14, bottom: 14, front: 14, back: 14, left: 14, right: 14 },
  [BlockType.LAVA]: { top: 15, bottom: 15, front: 15, back: 15, left: 15, right: 15 },
  [BlockType.COAL_ORE]: { top: 16, bottom: 16, front: 16, back: 16, left: 16, right: 16 },
  [BlockType.IRON_ORE]: { top: 17, bottom: 17, front: 17, back: 17, left: 17, right: 17 },
  [BlockType.GOLD_ORE]: { top: 19, bottom: 19, front: 19, back: 19, left: 19, right: 19 },
  [BlockType.DIAMOND_ORE]: { top: 20, bottom: 20, front: 20, back: 20, left: 20, right: 20 },
};

export const BLOCK_PROPERTIES = {
  [BlockType.AIR]: { solid: false, transparent: true, liquid: false, hardness: 0 },
  [BlockType.DIRT]: { solid: true, transparent: false, liquid: false, hardness: 0.5 },
  [BlockType.GRASS]: { solid: true, transparent: false, liquid: false, hardness: 0.6 },
  [BlockType.STONE]: { solid: true, transparent: false, liquid: false, hardness: 1.5 },
  [BlockType.SAND]: { solid: true, transparent: false, liquid: false, hardness: 0.5 },
  [BlockType.WOOD]: { solid: true, transparent: false, liquid: false, hardness: 2 },
  [BlockType.LEAVES]: { solid: true, transparent: true, liquid: false, hardness: 0.2 },
  [BlockType.GLASS]: { solid: true, transparent: true, liquid: false, hardness: 0.3 },
  [BlockType.WATER]: { solid: false, transparent: true, liquid: true, hardness: 100 },
  [BlockType.LAVA]: { solid: false, transparent: true, liquid: true, hardness: 100 },
  [BlockType.COAL_ORE]: { solid: true, transparent: false, liquid: false, hardness: 3 },
  [BlockType.IRON_ORE]: { solid: true, transparent: false, liquid: false, hardness: 3 },
  [BlockType.GOLD_ORE]: { solid: true, transparent: false, liquid: false, hardness: 3 },
  [BlockType.DIAMOND_ORE]: { solid: true, transparent: false, liquid: false, hardness: 3 },
};

export function isBlockSolid(type: BlockType): boolean {
  return BLOCK_PROPERTIES[type]?.solid ?? false;
}

export function isBlockTransparent(type: BlockType): boolean {
  return BLOCK_PROPERTIES[type]?.transparent ?? false;
}

export function isBlockLiquid(type: BlockType): boolean {
  return BLOCK_PROPERTIES[type]?.liquid ?? false;
}

export function getBlockHardness(type: BlockType): number {
  return BLOCK_PROPERTIES[type]?.hardness ?? 0;
}

export function getBlockName(type: BlockType): string {
  return BlockType[type] || 'Unknown';
}

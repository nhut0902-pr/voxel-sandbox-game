import { PlayerData, GameState, Chunk } from '../types';

const STORAGE_PREFIX = 'voxel_game_';
const DB_NAME = 'VoxelGameDB';
const DB_VERSION = 1;

export class GameStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('chunks')) {
          db.createObjectStore('chunks', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('playerData')) {
          db.createObjectStore('playerData', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('gameState')) {
          db.createObjectStore('gameState', { keyPath: 'id' });
        }
      };
    });
  }

  async savePlayerData(playerData: PlayerData): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['playerData'], 'readwrite');
      const store = transaction.objectStore('playerData');
      const request = store.put({ id: 'player', data: playerData });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async loadPlayerData(): Promise<PlayerData | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['playerData'], 'readonly');
      const store = transaction.objectStore('playerData');
      const request = store.get('player');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.data || null);
    });
  }

  async saveGameState(gameState: GameState): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameState'], 'readwrite');
      const store = transaction.objectStore('gameState');
      const request = store.put({ id: 'state', data: gameState });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async loadGameState(): Promise<GameState | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameState'], 'readonly');
      const store = transaction.objectStore('gameState');
      const request = store.get('state');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.data || null);
    });
  }

  async saveChunk(chunk: Chunk): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chunks'], 'readwrite');
      const store = transaction.objectStore('chunks');
      const key = `${chunk.coord.x},${chunk.coord.z}`;
      const request = store.put({ key, data: chunk });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async loadChunk(x: number, z: number): Promise<Chunk | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chunks'], 'readonly');
      const store = transaction.objectStore('chunks');
      const key = `${x},${z}`;
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.data || null);
    });
  }

  async deleteChunk(x: number, z: number): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chunks'], 'readwrite');
      const store = transaction.objectStore('chunks');
      const key = `${x},${z}`;
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chunks', 'playerData', 'gameState'], 'readwrite');

      transaction.objectStore('chunks').clear();
      transaction.objectStore('playerData').clear();
      transaction.objectStore('gameState').clear();

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  }

  // LocalStorage fallback for settings
  saveSettings(settings: Record<string, any>): void {
    localStorage.setItem(STORAGE_PREFIX + 'settings', JSON.stringify(settings));
  }

  loadSettings(): Record<string, any> {
    const data = localStorage.getItem(STORAGE_PREFIX + 'settings');
    return data ? JSON.parse(data) : {};
  }

  clearSettings(): void {
    localStorage.removeItem(STORAGE_PREFIX + 'settings');
  }
}

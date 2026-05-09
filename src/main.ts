import { Game } from './game';
import './styles.css';

async function main() {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  const game = new Game(canvas);
  await game.init();
  game.start();

  // Save game periodically
  setInterval(() => {
    game.save().catch(console.error);
  }, 30000); // Every 30 seconds

  // Handle page unload
  window.addEventListener('beforeunload', async (e) => {
    e.preventDefault();
    await game.quit();
  });
}

main().catch(console.error);

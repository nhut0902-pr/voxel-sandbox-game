# Voxel Sandbox Game

A complete voxel block-building sandbox game inspired by Minecraft, built with Three.js and Vite. Fully playable on both desktop and mobile browsers.

## Features

### World System
- **Infinite Procedural Terrain**: Chunk-based world generation with Simplex noise
- **Biomes**: Plains, Desert, Forest, Snow, Mountains
- **Environmental Features**: Cave generation, trees, water, lava
- **Dynamic Lighting**: Day/night cycle with dynamic shadows
- **Optimization**: Frustum culling, chunk loading/unloading, face culling

### Block System
- **14 Block Types**: Dirt, Grass, Stone, Sand, Wood, Leaves, Glass, Water, Lava, Coal Ore, Iron Ore, Gold Ore, Diamond Ore
- **Texture Atlas**: Efficient texture mapping system
- **Block Interactions**: Place and break blocks with smooth animations
- **Transparent Blocks**: Proper rendering of glass, leaves, water

### Player System
- **First-Person Controls**: Smooth camera and movement
- **Movement Modes**: Walking, Sprinting, Jumping, Flying (Creative Mode)
- **Inventory System**: 9-slot hotbar with multiple items
- **Health & Hunger**: Status tracking with visual indicators
- **Collision Detection**: Proper physics and collision handling
- **Swimming**: Water interaction support

### Mobile Optimization
- **Virtual Joystick**: Touch-based movement controls
- **Touch Camera**: Responsive camera control on mobile
- **Adaptive Quality**: Reduced render distance on weak devices
- **Battery Optimization**: Efficient rendering for mobile

### Desktop Support
- **WASD Movement**: Standard keyboard controls
- **Mouse Camera**: Smooth mouse-look
- **Hotbar Selection**: Number keys 1-9
- **Block Interaction**: Left-click to break, right-click to place
- **Fullscreen Support**: Immersive gameplay

### UI System
- **Main HUD**: Crosshair, health bar, hunger bar
- **Hotbar Display**: Visual inventory selection
- **Debug Overlay**: Press F3 for debug information
- **Pause Menu**: ESC to pause
- **Settings Menu**: Volume, render distance, creative mode toggle

### Graphics
- **Three.js Renderer**: Modern WebGL rendering
- **Realistic Lighting**: Ambient and directional lighting
- **Skybox**: Dynamic sky rendering
- **Smooth Animations**: Fluid block interactions
- **Post-Processing Ready**: Framework for advanced effects

### Audio
- **Block Sounds**: Break and place sound effects
- **Ambient Sounds**: Environmental audio
- **Volume Control**: Master, music, and SFX sliders
- **Web Audio API**: High-quality sound synthesis

### Save System
- **IndexedDB Storage**: Persistent world and player data
- **Auto-Save**: Automatic saving every 30 seconds
- **Player Persistence**: Save inventory, position, health
- **Settings Storage**: LocalStorage for preferences

## Installation

### Prerequisites
- Node.js 18+ and pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/voxel-sandbox-game.git
cd voxel-sandbox-game

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The game will be available at `http://localhost:3000`

### Build for Production

```bash
pnpm run build
```

Output will be in the `dist/` directory.

## Controls

### Desktop

| Key | Action |
|-----|--------|
| **W/A/S/D** | Move forward/left/backward/right |
| **Space** | Jump |
| **Shift** | Sprint |
| **F** | Toggle Flying Mode (Creative) |
| **1-9** | Select hotbar item |
| **Mouse Move** | Look around |
| **Left Click** | Break block |
| **Right Click** | Place block |
| **Scroll** | Change hotbar selection |
| **ESC** | Pause game |
| **E** | Open inventory |
| **F3** | Toggle debug overlay |

### Mobile

- **Left Joystick**: Move character
- **Right Side**: Look around (touch and drag)
- **Tap Block**: Break/place (depending on mode)
- **UI Buttons**: Hotbar selection, menu access

## Project Structure

```
voxel-sandbox-game/
├── src/
│   ├── engine/
│   │   ├── renderer.ts       # Main game renderer
│   │   ├── worldgen.ts       # World generation
│   │   ├── chunkmanager.ts   # Chunk loading/unloading
│   │   ├── mesher.ts         # Mesh generation
│   │   ├── blocks.ts         # Block definitions
│   │   └── player.ts         # Player controller
│   ├── ui/
│   │   └── hud.ts            # HUD and UI elements
│   ├── audio/
│   │   └── audioManager.ts   # Audio system
│   ├── utils/
│   │   └── storage.ts        # Save/load system
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   ├── main.ts               # Entry point
│   ├── game.ts               # Game controller
│   └── styles.css            # Game styles
├── index.html                # HTML entry point
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── vercel.json               # Vercel deployment config
├── package.json              # Dependencies
└── README.md                 # This file
```

## Technology Stack

- **Three.js**: 3D rendering engine
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type-safe JavaScript
- **Simplex Noise**: Procedural terrain generation
- **Web Audio API**: Sound synthesis
- **IndexedDB**: Persistent storage

## Performance

- **Chunk-based rendering**: Only visible chunks are rendered
- **Face culling**: Hidden faces are not rendered
- **Greedy meshing**: Optimized mesh generation
- **Object pooling**: Efficient memory usage
- **LOD system**: Reduced detail at distance
- **Mobile optimization**: Adaptive quality settings

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 15+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

The `vercel.json` configuration is already set up for optimal deployment.

### GitHub Pages

```bash
# Build the project
pnpm run build

# Deploy dist/ folder to GitHub Pages
```

### Other Platforms

The `dist/` folder contains a static site that can be deployed to any static hosting:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting
- Cloudflare Pages

## Development

### Running Tests

```bash
pnpm run check  # TypeScript check
```

### Code Quality

- TypeScript strict mode enabled
- ESLint ready (can be configured)
- Prettier formatting available

## Future Enhancements

- Multiplayer support
- Advanced lighting and shadows
- More block types and decorations
- Crafting system
- Mobs and creatures
- Biome-specific structures
- Weather system
- Better mobile UI
- Sound effects library
- Particle effects
- Redstone mechanics

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Credits

- Built with [Three.js](https://threejs.org/)
- Terrain generation using [Simplex Noise](https://github.com/jwagner/simplex-noise.js)
- Inspired by Minecraft and voxel-based games

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Performance Tips

1. **Render Distance**: Lower on mobile devices for better performance
2. **Creative Mode**: Disable for better performance in survival
3. **Shadows**: Can be disabled in settings for mobile
4. **Fog**: Helps with performance by culling distant objects

## Known Limitations

- Single-player only (multiplayer planned)
- Limited block types (expandable)
- No advanced lighting effects yet
- Mobile controls could be improved

## Changelog

### Version 1.0.0
- Initial release
- Core game systems implemented
- Desktop and mobile support
- Save/load functionality
- Audio system
- HUD and UI

Enjoy building! 🎮

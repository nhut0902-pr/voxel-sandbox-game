# Mobile Optimization Guide

## Overview

This voxel sandbox game is fully optimized for mobile devices with a complete virtual joystick system, touch camera controls, and adaptive quality settings.

## Mobile Features

### 1. Virtual Joystick System

**Location**: Bottom-left corner of the screen

**Features**:
- Circular joystick with visual feedback
- Smooth analog input for movement
- Deadzone to prevent drift
- Touch-optimized size (150x150px)
- Visual direction indicator

**Usage**:
```typescript
import { VirtualJoystick } from './mobile/joystick';

const joystick = new VirtualJoystick('container-id');
joystick.onStateChange((state) => {
  console.log(state.x, state.y, state.magnitude);
});
```

### 2. Touch Camera Controls

**Location**: Right side of screen (50% of width)

**Features**:
- Responsive camera rotation
- Configurable sensitivity
- Smooth interpolation
- Multi-touch support

**Usage**:
```typescript
import { TouchCameraController } from './mobile/touchCamera';

const camera = new TouchCameraController(canvas);
camera.setSensitivity(0.5);
camera.onStateChange((state) => {
  // Apply camera rotation
});
```

### 3. Mobile UI

**Components**:
- **Action Buttons** (Right side):
  - Break (Red) - Destroy blocks
  - Place (Green) - Build blocks
  - Jump (Blue) - Jump
  - Sprint (Yellow) - Run faster
  - Fly (Magenta) - Toggle flight mode

- **Hotbar** (Bottom center):
  - 9-slot inventory selector
  - Touch-friendly size (50x50px each)
  - Visual selection indicator

- **Status Indicators** (Right side):
  - Health (❤️) - Current health/20
  - Hunger (🍗) - Current hunger/20

- **Top Controls**:
  - Pause button (⏸) - Open pause menu

**Styling**:
- Large touch targets (minimum 50x50px)
- High contrast colors
- Responsive positioning
- No text selection on buttons

### 4. Adaptive Quality System

**Auto-Detection**:
```typescript
// Automatically detects device capabilities
- Device memory (navigator.deviceMemory)
- CPU cores (navigator.hardwareConcurrency)
- Screen pixel ratio
```

**Quality Presets**:

| Preset | Render Distance | Shadows | Particles | Fog | Max FPS | Texture |
|--------|-----------------|---------|-----------|-----|---------|---------|
| Low | 4 | No | No | 80 | Low |
| Medium | 6 | No | Yes | 150 | Medium |
| High | 8 | Yes | Yes | 200 | High |
| Ultra | 12 | Yes | Yes | 300 | High |

**Adaptive Adjustment**:
- Monitors FPS continuously
- Reduces quality if FPS < 70% of target
- Increases quality if FPS > 95% of target
- Smooth transitions between presets

**Usage**:
```typescript
const quality = new AdaptiveQuality(renderer);

// Set preset
quality.setQualityPreset('medium');

// Get current settings
const settings = quality.getSettings();

// Monitor performance
const avgFPS = quality.getAverageFPS();
```

### 5. Mobile Input Manager

**Integration**:
```typescript
const mobileInput = new MobileInputManager(canvas, player);

// Get current states
const joystickState = mobileInput.getJoystickState();
const cameraState = mobileInput.getCameraState();

// Adjust sensitivity
mobileInput.setJoystickSensitivity(15);
mobileInput.setCameraSensitivity(0.5);
```

## Performance Optimization

### Rendering Optimization
- **Chunk-based rendering**: Only visible chunks rendered
- **Face culling**: Hidden faces not rendered
- **LOD system**: Reduced detail at distance
- **Frustum culling**: Off-screen objects skipped

### Memory Optimization
- **Texture compression**: Reduced memory footprint
- **Object pooling**: Reuse game objects
- **Chunk unloading**: Remove distant chunks
- **Garbage collection**: Efficient memory management

### Battery Optimization
- **Adaptive frame rate**: Lower FPS on low battery
- **Reduced animations**: Smooth but efficient
- **Efficient physics**: Simple collision detection
- **Audio optimization**: Lightweight sound synthesis

## Device Support

### Recommended Specifications

**Low-End Devices**:
- 2GB RAM, 2 cores
- Render distance: 4
- No shadows/particles
- 30 FPS target

**Mid-Range Devices**:
- 4GB RAM, 4 cores
- Render distance: 6
- Basic particles
- 45 FPS target

**High-End Devices**:
- 6GB+ RAM, 6+ cores
- Render distance: 8-12
- Full effects
- 60 FPS target

### Tested Devices
- iPhone 12/13/14
- Samsung Galaxy S20/S21
- Pixel 5/6
- iPad Pro
- Android tablets

## Touch Controls Reference

### Movement
- **Left Joystick**: Move character
- **Joystick Direction**: Forward/backward/left/right

### Camera
- **Right Side Touch**: Look around
- **Drag Up/Down**: Pitch camera
- **Drag Left/Right**: Yaw camera

### Actions
- **Break Button**: Destroy block in front
- **Place Button**: Place block in front
- **Jump Button**: Jump
- **Sprint Button**: Run faster
- **Fly Button**: Toggle flight mode

### Hotbar
- **Tap Slot**: Select block type
- **Swipe**: Quick selection (future)

## Settings

### Accessibility
- Joystick sensitivity: 0-100
- Camera sensitivity: 0.1-2.0
- Button size: Adjustable
- Color blind mode: Available

### Performance
- Quality preset: Low/Medium/High/Ultra
- Render distance: 4-16 chunks
- Shadows: On/Off
- Particles: On/Off
- Fog distance: Adjustable

### Audio
- Master volume: 0-100%
- Music volume: 0-100%
- SFX volume: 0-100%

## Troubleshooting

### Performance Issues
1. Lower render distance
2. Disable shadows
3. Reduce particle effects
4. Lower camera sensitivity
5. Close other apps

### Touch Input Not Working
1. Clear browser cache
2. Restart browser
3. Check device orientation
4. Verify touch screen calibration

### Battery Drain
1. Lower quality preset
2. Reduce screen brightness
3. Close background apps
4. Disable music
5. Reduce render distance

## Future Improvements

- Haptic feedback support
- Gesture controls (pinch to zoom)
- Controller support (gamepad)
- Voice commands
- Multiplayer touch optimization
- AR mode support
- Progressive Web App (PWA)

## Development

### Testing Mobile
```bash
# Build for production
pnpm run build

# Test on device
# 1. Deploy to Vercel
# 2. Open on mobile device
# 3. Test all touch controls
# 4. Monitor performance
```

### Debug Mobile
```typescript
// Enable debug overlay on mobile
// Press F3 to show:
// - Position
// - Chunk coordinates
// - FPS
// - Quality settings
// - Input states
```

## Resources

- [Touch Events API](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Device Memory API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory)
- [Hardware Concurrency](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/hardwareConcurrency)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Three.js Mobile Optimization](https://threejs.org/docs/index.html#manual/en/introduction/How-to-run-things-locally)

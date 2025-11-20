# Neon Survivor

A mobile-first vertical scrolling shoot 'em up built with **Phaser 3** and modern ES6 modules. Features procedurally generated assets, persistent progression, and a clean modular architecture.

![Phaser 3](https://img.shields.io/badge/Phaser-3.90-brightgreen)
![Vite](https://img.shields.io/badge/Vite-7.0-646CFF)
![ES6](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## Features

### Core Gameplay
- **Auto-firing Combat** - Focus on movement and dodging
- **Progressive Difficulty** - Enemy health scales with player level
- **XP & Leveling System** - Permanent stat upgrades
- **Persistent Progression** - Save system using localStorage

### Technical Highlights
- **Zero Asset Downloads** - All graphics and audio generated procedurally at runtime
- **Modular ES6 Architecture** - Clean separation of concerns
- **Object Pooling** - Efficient memory management for bullets, enemies, and particles
- **Parallax Background** - Multi-layered scrolling starfield
- **Mobile-First** - Virtual joystick for touch controls
- **Hot Module Replacement** - Vite dev server with instant updates

## Project Structure

```
shmup1/
├── index.html              # Entry point
├── package.json            # Dependencies and scripts
├── src/
│   ├── main.js            # Game configuration and initialization
│   ├── scenes/            # Game scenes
│   │   ├── TitleScene.js  # Menu and texture generation
│   │   ├── GameScene.js   # Main gameplay loop
│   │   └── UIScene.js     # HUD and overlays
│   ├── entities/          # Game objects
│   │   └── Player.js      # Player ship with auto-fire
│   ├── managers/          # Game systems coordination
│   │   └── EnemyManager.js # Enemy spawning and AI
│   ├── systems/           # Core systems
│   │   ├── AudioEngine.js  # Web Audio API synthesizer
│   │   ├── Background.js   # Parallax scrolling system
│   │   └── SaveSystem.js   # localStorage persistence
│   └── utils/             # Helpers
│       └── Joystick.js    # Virtual joystick controller
```

## Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at **http://localhost:5173**

### Other Commands

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Controls

### Mobile
- **Joystick** - Drag on the bottom-right area to move
- **Auto-fire** - Ship fires automatically

### Desktop
- **Mouse** - Click and drag in the bottom-right quadrant to control
- **Auto-fire** - Ship fires automatically

## Game Mechanics

### Progression System
1. **Defeat Enemies** - Earn score and XP drops
2. **Collect XP Orbs** - Fill the blue XP bar
3. **Level Up** - Gain permanent stat increases:
   - Max Health +20
   - Move Speed +10
   - Fire Rate +10ms faster (min 50ms)
4. **Stats Persist** - Progress saved automatically on death

### Stats Overview

| Stat | Starting Value | Per Level | Cap |
|------|----------------|-----------|-----|
| Health | 100 | +20 | ∞ |
| Speed | 200 | +10 | ∞ |
| Fire Rate | 200ms | -10ms | 50ms |
| Damage | 1x | - | - |

### Enemy Behavior
- **Random Spawning** - Every 800ms at random X position
- **Homing Bullets** - Enemies fire tracking projectiles
- **Scaling HP** - `2 + (level * 0.5)` health per enemy

## Development

### Tech Stack
- **Phaser 3.90** - Game framework
- **Vite 7.0** - Build tool and dev server
- **Web Audio API** - Procedural sound effects
- **Canvas API** - Procedural graphics generation

### Adding Features

#### Create a New Scene
```javascript
// src/scenes/MyScene.js
import Phaser from 'phaser';

export default class MyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MyScene' });
    }

    create() {
        // Your scene logic
    }
}
```

Then register it in `src/main.js`:
```javascript
import MyScene from './scenes/MyScene.js';

const config = {
    // ...
    scene: [TitleScene, GameScene, UIScene, MyScene]
};
```

#### Modify Game Balance
- **Starting Stats** - Edit `src/systems/SaveSystem.js:4-12`
- **Enemy Spawn Rate** - Edit `src/managers/EnemyManager.js:10`
- **Level Up Bonuses** - Edit `src/scenes/GameScene.js:105-109`
- **Screen Size** - Edit `src/main.js:8-10`

### Code Quality
- **ES6 Modules** - All files use `import`/`export`
- **No Global Variables** - Phaser imported per-file
- **Clean Dependencies** - Only Phaser + Vite required
- **Comments** - Key systems documented inline

## Troubleshooting

### CORS Errors
**Problem:** `Access to script has been blocked by CORS policy`

**Solution:** Never open `index.html` directly. Always use:
```bash
npm run dev
```

### Phaser is not defined
**Problem:** `Uncaught ReferenceError: Phaser is not defined`

**Solution:** Ensure all files import Phaser:
```javascript
import Phaser from 'phaser';
```

### No textures visible
**Problem:** Black screen or missing sprites

**Solution:** Textures are generated in `TitleScene.preload()`. Always start from the title screen.

## Architecture Decisions

### Why Procedural Assets?
- **Zero Load Time** - No HTTP requests for images/audio
- **Tiny Bundle Size** - ~500KB total (Phaser only)
- **Easy Prototyping** - Change colors/sizes in code instantly

### Why Vite?
- **Fast HMR** - Changes reflect instantly
- **ES6 Native** - No transpilation for modern browsers
- **Simple Config** - Works out of the box with Phaser

### Why localStorage?
- **No Backend Required** - Fully client-side
- **Instant Save/Load** - No async operations
- **Reset-Friendly** - Clear browser data to restart

## Roadmap

- [ ] More enemy types (zigzag, burst fire, boss)
- [ ] Power-up system (shields, damage boost, XP multiplier)
- [ ] Weapon upgrades (spread shot, laser, missiles)
- [ ] Audio settings (mute, volume control)
- [ ] Leaderboard (high scores)
- [ ] Particle effects (explosions, trails)

## License

MIT - Feel free to use this as a learning resource or game template.

## Credits

Built with [Phaser 3](https://phaser.io/) - HTML5 Game Framework

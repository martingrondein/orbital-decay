import Phaser from 'phaser';
import TitleScene from './scenes/TitleScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import ShopScene from './scenes/ShopScene.js';
import { initPWAInstall, registerSWUpdate } from './utils/pwa.js';
import {
    GAME_WIDTH,
    GAME_HEIGHT,
    calculateOptimalZoom,
    getScaleConfig,
    setupResizeHandler,
    logScalingInfo
} from './utils/scaleManager.js';

// Calculate optimal zoom for current device
const initialZoom = calculateOptimalZoom();

// Log scaling information for debugging
logScalingInfo();

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    zoom: initialZoom,
    backgroundColor: '#000000',
    scale: getScaleConfig(),
    render: {
        pixelArt: true,
        roundPixels: true,
        antialias: false
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false },
        fps: 60,
    },
    fps: {
        target: 60,
        forceSetTimeOut: true,
    },
    scene: [TitleScene, GameScene, UIScene, ShopScene]
};

const game = new Phaser.Game(config);

// Hide loader once game is ready
game.events.once('ready', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 500); // Remove after fade out
    }
});

// Setup dynamic scaling with resize handler
setupResizeHandler(game);

// Initialize PWA install prompt
initPWAInstall();

// Register service worker and check for updates
registerSWUpdate();
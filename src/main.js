import Phaser from 'phaser';
import TitleScene from './scenes/TitleScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import ShopScene from './scenes/ShopScene.js';

const config = {
    type: Phaser.AUTO,
    width: 375,
    height: 812,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
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
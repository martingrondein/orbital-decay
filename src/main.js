import Phaser from 'phaser';
import TitleScene from './scenes/TitleScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 450,
        height: 800
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [TitleScene, GameScene, UIScene]
};

new Phaser.Game(config);
import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem.js';

export default class TitleScene extends Phaser.Scene {
    constructor() { super({ key: 'TitleScene' }); }

    preload() {
        // Load logo (from public folder, respects base path in production)
        this.load.image('logo', 'assets/od-logo.png');

        // Load background
        this.load.image('bg', 'assets/bg.png');

        // Load custom font
        this.load.font('PixelifySans', 'assets/PixelifySans-Regular.ttf');

        // Load game assets
        this.load.image('player', 'assets/player.png');
        this.load.image('enemy', 'assets/enemy1.png');
        this.load.image('xp', 'assets/xp.png');
        this.load.image('gold', 'assets/gold.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('ebullet', 'assets/enemy-bullet.png');
        this.load.image('fuel', 'assets/fuel.png');

        // Load powerup textures - all use the same sprite
        this.load.image('powerup_spray', 'assets/powerup.png');
        this.load.image('powerup_damage', 'assets/powerup.png');
        this.load.image('powerup_firerate', 'assets/powerup.png');
        this.load.image('powerup_doublexp', 'assets/powerup.png');
        this.load.image('powerup_triplescore', 'assets/powerup.png');
        this.load.image('powerup_shield', 'assets/powerup.png');
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Load player stats
        const stats = SaveSystem.load();

        // Display logo
        const logo = this.add.image(w/2, 120, 'logo');
        // Scale logo to fit width (with padding)
        const logoScale = Math.min((w - 40) / logo.width, 150 / logo.height);
        logo.setScale(logoScale);

        // Display version number
        this.add.text(w - 10, h - 10, 'v1.0.0', {
            fontFamily: 'PixelifySans',
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(1, 1);

        // Display high score
        const highScore = SaveSystem.loadHighScore();
        this.add.text(w/2, 190, `High Score: ${highScore}`, {
            fontFamily: 'PixelifySans',
            fontSize: '24px',
            color: '#ffff00',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Display best distance
        const bestDistance = SaveSystem.loadBestDistance();
        this.add.text(w/2, 220, `Best Distance: ${bestDistance}m`, {
            fontFamily: 'PixelifySans',
            fontSize: '24px',
            color: '#00ffff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Display player stats
        const statsText = [
            `Level: ${stats.level}`,
            `Gold: ${stats.gold}`,
            `Health: ${stats.maxHealth}`,
            `Speed: ${stats.moveSpeed}`,
            `Fire Rate: ${stats.fireRateMs}ms`,
            `Damage: x${stats.damageMult}`,
            `XP Mult: x${stats.xpMult}`
        ].join('\n');

        this.add.text(w/2, h/2 - 50, statsText, {
            fontFamily: 'PixelifySans',
            fontSize: '20px',
            color: '#fff',
            align: 'center',
            lineSpacing: 5
        }).setOrigin(0.5);

        // START button
        const startBtn = this.add.rectangle(w/2, h/2 + 120, 200, 50, 0x00aaff).setInteractive();
        const startTxt = this.add.text(w/2, h/2 + 120, 'START', {
            fontFamily: 'PixelifySans',
            fontSize: '24px',
            color: 'black'
        }).setOrigin(0.5);

        startBtn.on('pointerdown', () => {
            this.scene.start('UIScene');
            this.scene.start('GameScene');
        });

        // SHOP button
        const shopBtn = this.add.rectangle(w/2, h/2 + 185, 200, 50, 0xffd700).setInteractive();
        const shopTxt = this.add.text(w/2, h/2 + 185, 'SHOP', {
            fontFamily: 'PixelifySans',
            fontSize: '24px',
            color: 'black'
        }).setOrigin(0.5);

        shopBtn.on('pointerdown', () => {
            this.scene.start('ShopScene');
        });

        // Start at Level 40 button
        // const lv40Btn = this.add.rectangle(w/2, h/2 + 165, 200, 50, 0xff9900).setInteractive();
        // const lv40Txt = this.add.text(w/2, h/2 + 165, 'START AT LV 40', { fontSize: '18px', color: 'black' }).setOrigin(0.5);

        // lv40Btn.on('pointerdown', () => {
        //     const lv40Stats = SaveSystem.calculateStatsForLevel(40);
        //     SaveSystem.save(lv40Stats);
        //     this.scene.start('UIScene');
        //     this.scene.start('GameScene');
        // });

        // // Start at Level 80 button
        // const lv80Btn = this.add.rectangle(w/2, h/2 + 230, 200, 50, 0xaa00ff).setInteractive();
        // const lv80Txt = this.add.text(w/2, h/2 + 230, 'START AT LV 80', { fontSize: '18px', color: 'black' }).setOrigin(0.5);

        // lv80Btn.on('pointerdown', () => {
        //     const lv80Stats = SaveSystem.calculateStatsForLevel(80);
        //     SaveSystem.save(lv80Stats);
        //     this.scene.start('UIScene');
        //     this.scene.start('GameScene');
        // });

        // Reset Stats button
        const resetBtn = this.add.rectangle(w/2, h/2 + 250, 200, 50, 0xff3333).setInteractive();
        const resetTxt = this.add.text(w/2, h/2 + 250, 'RESET STATS', {
            fontFamily: 'PixelifySans',
            fontSize: '18px',
            color: 'black'
        }).setOrigin(0.5);

        resetBtn.on('pointerdown', () => {
            SaveSystem.reset();
            this.scene.restart();
        });

        // Debug buttons
        const debugY = h - 70;

        // +1000 Gold button
        const goldBtn = this.add.rectangle(w/2 - 110, debugY, 180, 40, 0xffd700).setInteractive();
        const goldTxt = this.add.text(w/2 - 110, debugY, '+1000 GOLD', {
            fontFamily: 'PixelifySans',
            fontSize: '16px',
            color: 'black'
        }).setOrigin(0.5);

        goldBtn.on('pointerdown', () => {
            const currentStats = SaveSystem.load();
            currentStats.gold += 1000;
            SaveSystem.save(currentStats);
            this.scene.restart();
        });

        // +1 Level button
        const lvlBtn = this.add.rectangle(w/2 + 110, debugY, 180, 40, 0x00aaff).setInteractive();
        const lvlTxt = this.add.text(w/2 + 110, debugY, '+1 LEVEL', {
            fontFamily: 'PixelifySans',
            fontSize: '16px',
            color: 'black'
        }).setOrigin(0.5);

        lvlBtn.on('pointerdown', () => {
            const currentStats = SaveSystem.load();
            currentStats.level += 1;
            // Recalculate stats for new level
            const newStats = SaveSystem.calculateStatsForLevel(currentStats.level);
            // Keep existing gold
            newStats.gold = currentStats.gold;
            SaveSystem.save(newStats);
            this.scene.restart();
        });
    }
}
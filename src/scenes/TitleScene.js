import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem.js';

export default class TitleScene extends Phaser.Scene {
    constructor() { super({ key: 'TitleScene' }); }

    preload() {
        // Load logo (from public folder, respects base path in production)
        this.load.image('logo', 'assets/od-logo.png');

        // Load parallax background layers
        this.load.image('bg1-stars', 'assets/bg1-stars.png');
        this.load.image('bg2-dust', 'assets/bg2-dust.png');
        this.load.image('bg3-nebulae', 'assets/bg3-nebulae.png');

        // Load custom font
        this.load.font('Silkscreen', 'fonts/Silkscreen-Regular.ttf');

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

        // Load audio files
        this.load.audio('collect-coin', 'sounds/collect-coin.wav');
        this.load.audio('collect-xp', 'sounds/collect-xp.wav');
        this.load.audio('collectible-drop', 'sounds/collectible-drop.wav');
        this.load.audio('enemy-explode', 'sounds/enemy-explode.wav');
        this.load.audio('enemy-hit', 'sounds/enemy-hit.wav');
        this.load.audio('enemy-shoot', 'sounds/enemy-shoot.wav');
        this.load.audio('game-over', 'sounds/game-over.wav');
        this.load.audio('level-up', 'sounds/level-up.wav');
        this.load.audio('player-hit', 'sounds/player-hit.wav');
        this.load.audio('spend-gold', 'sounds/spend-gold.wav');

        // Load background music
        this.load.audio('bgmusic', 'music/DavidKBD-Eternity Pack - 02 - Agony Space-deep - loop.ogg');
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Load player stats
        const stats = SaveSystem.load();

        // === LAYOUT SPACING CONFIGURATION ===
        // Organized sections for better visual hierarchy
        const HEADER_Y = 70;           // Logo position
        const SCORES_START_Y = 170;    // High score position
        const SCORES_GAP = 35;         // Gap between score lines
        const STATS_Y = 365;           // Player stats section (center point)
        const BUTTONS_START_Y = 520;   // Action buttons section
        const BUTTON_GAP = 60;         // Gap between buttons
        const DEBUG_Y = h - 55;        // Debug buttons at bottom

        // === HEADER SECTION ===
        // Display logo
        const logo = this.add.image(w/2, HEADER_Y, 'logo');
        // Scale logo to fit width (with padding)
        const logoScale = Math.min((w - 40) / logo.width, 120 / logo.height);
        logo.setScale(logoScale);

        // Display version number
        this.add.text(w - 10, h - 10, 'v0.251122', {
            fontFamily: 'Silkscreen',
            fontSize: '14px',
            color: '#666666'
        }).setOrigin(1, 1);

        // === ACHIEVEMENTS SECTION ===
        // Display high score
        const highScore = SaveSystem.loadHighScore();
        this.add.text(w/2, SCORES_START_Y, `High Score: ${highScore}`, {
            fontFamily: 'Silkscreen',
            fontSize: '22px',
            color: '#ffff00',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Display best distance
        const bestDistance = SaveSystem.loadBestDistance();
        this.add.text(w/2, SCORES_START_Y + SCORES_GAP, `Best Distance: ${bestDistance}m`, {
            fontFamily: 'Silkscreen',
            fontSize: '22px',
            color: '#00ffff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // === PLAYER STATS SECTION ===
        // Display player stats with better line spacing
        const statsText = [
            `Level: ${stats.level}`,
            `Gold: ${stats.gold}`,
            `Health: ${stats.maxHealth}`,
            `Speed: ${stats.moveSpeed}`,
            `Fire Rate: ${stats.fireRateMs}ms`,
            `Damage: x${stats.damageMult.toFixed(2)}`,
            `XP Mult: x${stats.xpMult}`
        ].join('\n');

        this.add.text(w/2, STATS_Y, statsText, {
            fontFamily: 'Silkscreen',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        // === ACTION BUTTONS SECTION ===
        // START button
        const startBtn = this.add.rectangle(w/2, BUTTONS_START_Y, 220, 50, 0x00aaff).setInteractive();
        const startTxt = this.add.text(w/2, BUTTONS_START_Y, 'START', {
            fontFamily: 'Silkscreen',
            fontSize: '28px',
            color: '#000000'
        }).setOrigin(0.5);

        startBtn.on('pointerdown', () => {
            this.scene.start('UIScene');
            this.scene.start('GameScene');
        });

        // SHOP button
        const shopBtn = this.add.rectangle(w/2, BUTTONS_START_Y + BUTTON_GAP, 220, 50, 0xffd700).setInteractive();
        const shopTxt = this.add.text(w/2, BUTTONS_START_Y + BUTTON_GAP, 'SHOP', {
            fontFamily: 'Silkscreen',
            fontSize: '28px',
            color: '#000000'
        }).setOrigin(0.5);

        shopBtn.on('pointerdown', () => {
            this.scene.start('ShopScene');
        });

        // Reset Stats button
        const resetBtn = this.add.rectangle(w/2, BUTTONS_START_Y + (BUTTON_GAP * 2), 220, 50, 0xff3333).setInteractive();
        const resetTxt = this.add.text(w/2, BUTTONS_START_Y + (BUTTON_GAP * 2), 'RESET STATS', {
            fontFamily: 'Silkscreen',
            fontSize: '20px',
            color: '#000000'
        }).setOrigin(0.5);

        resetBtn.on('pointerdown', () => {
            SaveSystem.reset();
            this.scene.restart();
        });

        // === DEBUG SECTION ===
        // +1000 Gold button
        const goldBtn = this.add.rectangle(w/2 - 110, DEBUG_Y, 180, 40, 0xffd700).setInteractive();
        const goldTxt = this.add.text(w/2 - 110, DEBUG_Y, '+1000 GOLD', {
            fontFamily: 'Silkscreen',
            fontSize: '15px',
            color: '#000000'
        }).setOrigin(0.5);

        goldBtn.on('pointerdown', () => {
            const currentStats = SaveSystem.load();
            currentStats.gold += 1000;
            SaveSystem.save(currentStats);
            this.scene.restart();
        });

        // +1 Level button
        const lvlBtn = this.add.rectangle(w/2 + 110, DEBUG_Y, 180, 40, 0x00aaff).setInteractive();
        const lvlTxt = this.add.text(w/2 + 110, DEBUG_Y, '+1 LEVEL', {
            fontFamily: 'Silkscreen',
            fontSize: '15px',
            color: '#000000'
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
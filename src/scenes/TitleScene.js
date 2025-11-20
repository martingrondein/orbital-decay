import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem.js';

export default class TitleScene extends Phaser.Scene {
    constructor() { super({ key: 'TitleScene' }); }

    preload() {
        // Generate textures once globally here
        const make = (k, c, r) => {
            if(this.textures.exists(k)) return;
            const g = this.make.graphics({ add: false });
            g.fillStyle(c, 1); g.fillCircle(r, r, r); g.generateTexture(k, r*2, r*2);
        };
        make('player', 0x00ff00, 20);
        make('bullet', 0xffff00, 5);
        make('enemy', 0xff0000, 20);
        make('ebullet', 0xffaa00, 6);
        make('xp', 0x00ffff, 8);
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Load player stats
        const stats = SaveSystem.load();

        this.add.text(w/2, h/2 - 150, 'ORBITAL DECAY', { fontSize: '40px', color: '#0f0' }).setOrigin(0.5);

        // Display player stats
        const statsText = [
            `Level: ${stats.level}`,
            `Health: ${stats.maxHealth}`,
            `Speed: ${stats.moveSpeed}`,
            `Fire Rate: ${stats.fireRateMs}ms`,
            `Damage: x${stats.damageMult}`,
            `XP Mult: x${stats.xpMult}`
        ].join('\n');

        this.add.text(w/2, h/2 - 40, statsText, {
            fontSize: '20px',
            color: '#fff',
            align: 'center',
            lineSpacing: 5
        }).setOrigin(0.5);

        // START button
        const startBtn = this.add.rectangle(w/2, h/2 + 100, 200, 50, 0x00aaff).setInteractive();
        const startTxt = this.add.text(w/2, h/2 + 100, 'START', { fontSize: '24px', color: 'black' }).setOrigin(0.5);

        startBtn.on('pointerdown', () => {
            this.scene.start('UIScene');
            this.scene.start('GameScene');
        });

        // Start at Level 40 button
        const lv40Btn = this.add.rectangle(w/2, h/2 + 165, 200, 50, 0xff9900).setInteractive();
        const lv40Txt = this.add.text(w/2, h/2 + 165, 'START AT LV 40', { fontSize: '18px', color: 'black' }).setOrigin(0.5);

        lv40Btn.on('pointerdown', () => {
            const lv40Stats = SaveSystem.calculateStatsForLevel(40);
            SaveSystem.save(lv40Stats);
            this.scene.start('UIScene');
            this.scene.start('GameScene');
        });

        // Reset Stats button
        const resetBtn = this.add.rectangle(w/2, h/2 + 230, 200, 50, 0xff3333).setInteractive();
        const resetTxt = this.add.text(w/2, h/2 + 230, 'RESET STATS', { fontSize: '18px', color: 'black' }).setOrigin(0.5);

        resetBtn.on('pointerdown', () => {
            SaveSystem.reset();
            this.scene.restart();
        });
    }
}
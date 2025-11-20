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

        this.add.text(w/2, h/2 - 150, 'NEON SURVIVOR', { fontSize: '40px', color: '#0f0' }).setOrigin(0.5);

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

        const btn = this.add.rectangle(w/2, h/2 + 120, 200, 60, 0x00aaff).setInteractive();
        const txt = this.add.text(w/2, h/2 + 120, 'START', { fontSize: '24px', color: 'black' }).setOrigin(0.5);

        btn.on('pointerdown', () => {
            this.scene.start('UIScene'); // Start UI first to set up event listeners
            this.scene.start('GameScene');
        });
    }
}
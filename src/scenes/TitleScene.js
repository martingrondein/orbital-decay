import Phaser from 'phaser';

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

        this.add.text(w/2, h/2 - 50, 'NEON SURVIVOR', { fontSize: '40px', color: '#0f0' }).setOrigin(0.5);

        const btn = this.add.rectangle(w/2, h/2 + 50, 200, 60, 0x00aaff).setInteractive();
        const txt = this.add.text(w/2, h/2 + 50, 'START', { fontSize: '24px', color: 'black' }).setOrigin(0.5);

        btn.on('pointerdown', () => {
            this.scene.start('UIScene'); // Start UI first to set up event listeners
            this.scene.start('GameScene');
        });
    }
}
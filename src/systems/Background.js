import Phaser from 'phaser';

export default class Background {
    constructor(scene) {
        this.scene = scene;
        this.layers = [];
        this.init();
    }

    init() {
        // Create Procedural Star Textures (different sizes)
        for (let size = 1; size <= 3; size++) {
            const g = this.scene.make.graphics({ add: false });
            g.fillStyle(0xffffff, 1);
            g.fillCircle(size, size, size);
            g.generateTexture(`star_${size}`, size * 2, size * 2);
        }

        // Create 4 Parallax Layers with different depths
        this.createLayer(0.3, 30, 0.15, 0.2);   // Very distant, very dim
        this.createLayer(0.7, 60, 0.3, 0.45);   // Distant, dim
        this.createLayer(1.2, 100, 0.5, 0.7);   // Medium distance
        this.createLayer(2.0, 150, 0.7, 1.0);   // Close, bright
    }

    createLayer(scrollFactor, count, minAlpha, maxAlpha) {
        // Create a RenderTexture to act as a repeatable tile
        const texKey = `bg_layer_${scrollFactor}`;
        const rt = this.scene.make.renderTexture({ width: 450, height: 800 }, false);

        // Star colors for variety (white, slightly blue, slightly yellow)
        const colors = [0xffffff, 0xaaccff, 0xffffcc];

        for(let i=0; i<count; i++) {
            const x = Phaser.Math.Between(0, 450);
            const y = Phaser.Math.Between(0, 800);

            // Random opacity within layer's range
            const alpha = Phaser.Math.FloatBetween(minAlpha, maxAlpha);

            // Random star size (smaller = more distant)
            const size = Math.random() < 0.7 ? 1 : (Math.random() < 0.8 ? 2 : 3);
            const starKey = `star_${size}`;

            // Occasional colored stars
            const tint = Math.random() < 0.85 ? 0xffffff : Phaser.Utils.Array.GetRandom(colors);

            rt.draw(starKey, x, y, alpha, tint);
        }
        rt.saveTexture(texKey);

        const tile = this.scene.add.tileSprite(225, 400, 450, 800, texKey);
        tile.setDepth(-10); // Behind everything
        this.layers.push({ sprite: tile, speed: scrollFactor });
    }

    update() {
        this.layers.forEach(l => {
            l.sprite.tilePositionY -= l.speed;
        });
    }
}
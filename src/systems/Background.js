import Phaser from 'phaser';

export default class Background {
    constructor(scene) {
        this.scene = scene;
        this.layers = [];
        this.init();
    }

    init() {
        // Create Procedural Star Texture
        const g = this.scene.make.graphics({ add: false });
        g.fillStyle(0xffffff, 1);
        g.fillCircle(2, 2, 2);
        g.generateTexture('star', 4, 4);

        // Create 4 Parallax Layers with different depths and opacities
        this.createLayer(0.3, 30, 0.2);   // Very distant, very dim
        this.createLayer(0.7, 60, 0.4);   // Distant, dim
        this.createLayer(1.2, 100, 0.6);  // Medium distance
        this.createLayer(2.0, 150, 0.85); // Close, bright
    }

    createLayer(scrollFactor, count, layerAlpha) {
        // Create a RenderTexture to act as a repeatable tile
        const texKey = `bg_layer_${scrollFactor}`;
        const rt = this.scene.make.renderTexture({ width: 450, height: 800 }, false);

        for(let i=0; i<count; i++) {
            const x = Phaser.Math.Between(0, 450);
            const y = Phaser.Math.Between(0, 800);
            rt.draw('star', x, y);
        }
        rt.saveTexture(texKey);

        const tile = this.scene.add.tileSprite(225, 400, 450, 800, texKey);
        tile.setDepth(-10); // Behind everything
        tile.setAlpha(layerAlpha); // Set opacity for entire layer for depth effect
        this.layers.push({ sprite: tile, speed: scrollFactor });
    }

    update() {
        this.layers.forEach(l => {
            l.sprite.tilePositionY -= l.speed;
        });
    }
}
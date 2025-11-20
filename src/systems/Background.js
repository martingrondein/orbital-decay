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

        // Create 3 Parallax Layers
        this.createLayer(0.5, 50, 0.3);  // Slow, distant
        this.createLayer(1.0, 100, 0.6); // Medium
        this.createLayer(1.5, 200, 1.0); // Fast, close
    }

    createLayer(scrollFactor, count, alpha) {
        // Create a RenderTexture to act as a repeatable tile
        const texKey = `bg_layer_${scrollFactor}`;
        const rt = this.scene.make.renderTexture({ width: 450, height: 800 }, false);

        for(let i=0; i<count; i++) {
            const x = Phaser.Math.Between(0, 450);
            const y = Phaser.Math.Between(0, 800);
            rt.draw('star', x, y, alpha);
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
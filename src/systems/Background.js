import Phaser from 'phaser';

export default class Background {
    constructor(scene) {
        this.scene = scene;
        this.tile = null;
        this.init();
    }

    init() {
        // Create tiled background using bg.png
        const w = this.scene.scale.width;
        const h = this.scene.scale.height;

        this.tile = this.scene.add.tileSprite(w / 2, h / 2, w, h, 'bg');
        this.tile.setDepth(-10); // Behind everything
    }

    update() {
        // Scroll background downward for vertical movement effect
        if (this.tile) {
            this.tile.tilePositionY -= 1;
        }
    }
}
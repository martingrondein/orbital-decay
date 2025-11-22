import Phaser from 'phaser';

export default class Background {
    constructor(scene) {
        this.scene = scene;
        this.layers = [];
        this.init();
    }

    init() {
        // Create parallax background layers using 3 images
        const w = this.scene.scale.width;
        const h = this.scene.scale.height;

        // Layer 1: Stars (furthest back, slowest)
        const stars = this.scene.add.tileSprite(w / 2, h / 2, w, h, 'bg1-stars');
        stars.setDepth(-30);
        this.layers.push({ sprite: stars, speed: 0.3 });

        // Layer 2: Dust (middle, medium speed)
        const dust = this.scene.add.tileSprite(w / 2, h / 2, w, h, 'bg2-dust');
        dust.setDepth(-20);
        this.layers.push({ sprite: dust, speed: 0.6 });

        // Layer 3: Nebulae (closest, fastest)
        const nebulae = this.scene.add.tileSprite(w / 2, h / 2, w, h, 'bg3-nebulae');
        nebulae.setDepth(-10);
        this.layers.push({ sprite: nebulae, speed: 1.0 });
    }

    update() {
        // Scroll each layer at different speeds for parallax effect
        this.layers.forEach(layer => {
            layer.sprite.tilePositionY -= layer.speed;
        });
    }
}
import Phaser from 'phaser';

export default class PowerupManager {
    constructor(scene) {
        this.scene = scene;

        // Powerup types
        this.types = ['spray', 'damage', 'firerate'];

        // Pooled powerups
        this.powerups = scene.physics.add.group({
            maxSize: 10 // Increased for enemy drops
        });

        // Timed spawning disabled - powerups now drop from enemies

        this.activePowerup = null;
    }

    spawnAtPosition(x, y) {
        // Spawn a random powerup at the given position
        const type = Phaser.Utils.Array.GetRandom(this.types);

        const powerup = this.powerups.get(x, y, `powerup_${type}`);
        if (powerup) {
            powerup.enableBody(true, x, y, true, true);
            powerup.setVelocityY(100);
            powerup.powerupType = type;
        }
    }

    cleanup() {
        const h = this.scene.scale.height;
        this.powerups.children.iterate(p => {
            if (p.active && (p.y < -60 || p.y > h + 60)) {
                p.disableBody(true, true);
            }
        });
    }

    setActivePowerup(type) {
        this.activePowerup = type;
    }

    clearActivePowerup() {
        this.activePowerup = null;
    }
}

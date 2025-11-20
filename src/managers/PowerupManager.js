import Phaser from 'phaser';

export default class PowerupManager {
    constructor(scene) {
        this.scene = scene;

        // Powerup types
        this.types = ['spray', 'damage', 'firerate'];

        // Pooled powerups
        this.powerups = scene.physics.add.group({
            maxSize: 5
        });

        // Spawn timer
        this.spawnTimer = scene.time.addEvent({
            delay: 25000, // Spawn every 25 seconds
            callback: this.trySpawn,
            callbackScope: this,
            loop: true
        });

        this.activePowerup = null;
    }

    trySpawn() {
        // Don't spawn if game is over or a powerup is already active
        if (this.scene.isGameOver || this.activePowerup) return;

        const type = Phaser.Utils.Array.GetRandom(this.types);
        const x = Phaser.Math.Between(50, this.scene.scale.width - 50);
        const y = -30;

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

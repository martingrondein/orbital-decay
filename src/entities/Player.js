import Phaser from 'phaser';
import { AudioEngine } from '../systems/AudioEngine.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, stats) {
        super(scene, x, y, 'player');
        this.scene = scene;
        this.stats = stats; // Reference to persistent stats
        this.currentHealth = stats.maxHealth;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setDepth(1);
        this.lastFired = 0;
        this.isInvulnerable = false;
    }

    update(time, joystickData) {
        // Movement
        if (joystickData.active) {
            this.setVelocity(
                joystickData.x * this.stats.moveSpeed,
                joystickData.y * this.stats.moveSpeed
            );
        } else {
            this.setVelocity(0);
        }

        // Auto Fire
        if (time > this.lastFired + this.stats.fireRateMs) {
            this.fire();
            this.lastFired = time;
        }
    }

    fire() {
        const bullet = this.scene.bullets.get(this.x, this.y - 20);
        if (bullet) {
            bullet.enableBody(true, this.x, this.y - 20, true, true);
            bullet.setVelocityY(-600);
            bullet.setTint(this.stats.damageMult > 1 ? 0xff0000 : 0xffff00);
            AudioEngine.play('shoot');
        }
    }

    takeDamage(amount) {
        if (this.isInvulnerable) return;
        this.currentHealth -= amount;
        this.scene.cameras.main.shake(100, 0.01);

        // Visual hit flash
        this.scene.tweens.add({
            targets: this, alpha: 0, duration: 50, yoyo: true, repeat: 1
        });
    }
}
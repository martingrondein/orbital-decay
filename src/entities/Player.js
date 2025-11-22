import Phaser from 'phaser';
import { AudioEngine } from '../systems/AudioEngine.js';
import { GameBalance } from '../config/GameBalance.js';

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
        this.setScale(1.25); // Scale 32x32 sprite to 40x40 for original size
        this.lastFired = 0;
        this.isInvulnerable = false;
        this.sprayShot = false; // Powerup flag
    }

    update(time, joystickData) {
        // Movement - only if canMove flag is true
        if (joystickData.active && this.scene.canMove) {
            this.setVelocity(
                joystickData.x * this.stats.moveSpeed,
                joystickData.y * this.stats.moveSpeed
            );

            // Deplete fuel on movement
            if (this.scene.fuel > 0) {
                this.scene.fuel = Math.max(0, this.scene.fuel - GameBalance.fuel.depletionPerMovement);
                this.scene.events.emit('updateFuel', this.scene.fuel);
                if (this.scene.fuel <= 0) {
                    this.scene.canMove = false; // Stop player movement when out of fuel
                }
            }
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
        if (this.sprayShot) {
            this.fireSpray();
        } else {
            this.fireSingle();
        }
    }

    fireSingle() {
        if (this.stats.hasExtraShooter) {
            // Fire 2 bullets (left and right)
            const offsets = [-10, 10];
            offsets.forEach(offset => {
                const bullet = this.scene.bullets.get(this.x + offset, this.y - 20);
                if (bullet) {
                    bullet.enableBody(true, this.x + offset, this.y - 20, true, true);
                    bullet.setVelocityY(-600);
                    bullet.setScale(1); // 8x8 sprite, no scaling needed
                    bullet.setTint(this.stats.damageMult > 1 ? 0xff0000 : 0xffff00);
                }
            });
        } else {
            // Fire single bullet
            const bullet = this.scene.bullets.get(this.x, this.y - 20);
            if (bullet) {
                bullet.enableBody(true, this.x, this.y - 20, true, true);
                bullet.setVelocityY(-600);
                bullet.setScale(1); // 8x8 sprite, no scaling needed
                bullet.setTint(this.stats.damageMult > 1 ? 0xff0000 : 0xffff00);
            }
        }
        AudioEngine.play('shoot');
    }

    fireSpray() {
        // Fire 5 bullets in a spread pattern (10 with extra shooter)
        const angles = [-30, -15, 0, 15, 30];
        const speed = 600;
        const positions = this.stats.hasExtraShooter ? [-10, 10] : [0];

        positions.forEach(xOffset => {
            angles.forEach(angle => {
                const bullet = this.scene.bullets.get(this.x + xOffset, this.y - 20);
                if (bullet) {
                    bullet.enableBody(true, this.x + xOffset, this.y - 20, true, true);

                    const angleRad = Phaser.Math.DegToRad(angle - 90); // -90 because 0 is right
                    const vx = Math.cos(angleRad) * speed;
                    const vy = Math.sin(angleRad) * speed;

                    bullet.setVelocity(vx, vy);
                    bullet.setScale(1); // 8x8 sprite, no scaling needed
                    bullet.setTint(0x00ff00); // Green for spray shot
                }
            });
        });

        AudioEngine.play('shoot');
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
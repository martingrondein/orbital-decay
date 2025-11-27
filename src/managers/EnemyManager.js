import Phaser from 'phaser';
import { AudioEngine } from '../systems/AudioEngine.js';
import { GameBalance } from '../config/GameBalance.js';
import { createSpawnEffect, createMuzzleFlash, createDirectionalBurst } from '../utils/EffectsUtils.js';

export default class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = scene.physics.add.group({
            defaultKey: 'enemy',
            maxSize: GameBalance.enemy.maxPoolSize
        });
        this.blueEnemies = scene.physics.add.group({
            defaultKey: 'enemy',
            maxSize: GameBalance.blueEnemy.maxPoolSize
        });
        this.greenEnemies = scene.physics.add.group({
            defaultKey: 'enemy',
            maxSize: GameBalance.greenEnemy.maxPoolSize
        });
        this.yellowEnemies = scene.physics.add.group({
            defaultKey: 'enemy',
            maxSize: GameBalance.yellowEnemy.maxPoolSize
        });
        this.purpleEnemies = scene.physics.add.group({
            defaultKey: 'enemy',
            maxSize: GameBalance.purpleEnemy.maxPoolSize
        });
        this.enemyBullets = scene.physics.add.group({
            defaultKey: 'ebullet',
            maxSize: GameBalance.enemy.bulletPoolSize
        });

        this.gameStartTime = Date.now();

        // Wave tracking
        this.currentWave = 1;
        this.currentCycle = 1;

        // Timers
        scene.time.addEvent({
            delay: GameBalance.enemy.spawnDelayMs,
            callback: this.spawn,
            callbackScope: this,
            loop: true
        });
        scene.time.addEvent({
            delay: GameBalance.enemy.fireDelayMs,
            callback: this.fireLogic,
            callbackScope: this,
            loop: true
        });
    }

    spawn() {
        if (this.scene.isGameOver) return;

        const x = Phaser.Math.Between(30, this.scene.scale.width - 30);

        // Get current wave's color from cycle
        const colorCycle = GameBalance.waves.colorCycle;
        const waveIndex = (this.currentWave - 1) % colorCycle.length;
        const enemyType = colorCycle[waveIndex];

        // Spawn the enemy type for this wave
        switch (enemyType) {
            case 'purple':
                this.spawnPurpleEnemy(x);
                break;
            case 'yellow':
                this.spawnYellowEnemy(x);
                break;
            case 'green':
                this.spawnGreenEnemy(x);
                break;
            case 'blue':
                this.spawnBlueEnemy(x);
                break;
            default:
                this.spawnRedEnemy(x);
                break;
        }
    }

    /**
     * Calculate difficulty scaling for current wave
     */
    getWaveDifficultyMultiplier() {
        const wave = this.currentWave;
        return {
            health: Math.pow(GameBalance.waves.healthMultiplier, wave - 1),
            velocity: Math.pow(GameBalance.waves.velocityMultiplier, wave - 1)
        };
    }

    /**
     * Get tail count for current cycle
     */
    getTailCount() {
        return GameBalance.waves.baseTailCount + ((this.currentCycle - 1) * GameBalance.waves.tailsPerCycle);
    }

    spawnRedEnemy(x) {
        const e = this.enemies.get(x, -50);
        if (e) {
            const multiplier = this.getWaveDifficultyMultiplier();

            e.enableBody(true, x, -50, true, true);
            e.setVelocity(
                Phaser.Math.Between(GameBalance.enemy.velocityX.min, GameBalance.enemy.velocityX.max) * multiplier.velocity,
                Phaser.Math.Between(GameBalance.enemy.velocityY.min, GameBalance.enemy.velocityY.max) * multiplier.velocity
            );
            e.hp = Math.ceil(GameBalance.enemy.baseHealth * multiplier.health);
            e.setTint(0xff0000);
            e.setScale(1.25);
            e.body.setCircle(12);
            e.enemyType = 'red';

            // Spawn effect
            createSpawnEffect(this.scene, x, -50, 0xff0000);
        }
    }

    spawnBlueEnemy(x) {
        const e = this.blueEnemies.get(x, -50);
        if (e) {
            const multiplier = this.getWaveDifficultyMultiplier();

            e.enableBody(true, x, -50, true, true);
            e.setVelocity(
                Phaser.Math.Between(GameBalance.blueEnemy.velocityX.min, GameBalance.blueEnemy.velocityX.max) * multiplier.velocity,
                Phaser.Math.Between(GameBalance.blueEnemy.velocityY.min, GameBalance.blueEnemy.velocityY.max) * multiplier.velocity
            );
            e.hp = Math.ceil(GameBalance.blueEnemy.baseHealth * multiplier.health);
            e.setTint(0x0000ff);
            e.setScale(1.25);
            e.body.setCircle(12);
            e.enemyType = 'blue';

            // Spawn effect
            createSpawnEffect(this.scene, x, -50, 0x0000ff);
        }
    }

    spawnGreenEnemy(x) {
        const e = this.greenEnemies.get(x, -50);
        if (e) {
            const multiplier = this.getWaveDifficultyMultiplier();

            e.enableBody(true, x, -50, true, true);
            e.setVelocity(
                Phaser.Math.Between(GameBalance.greenEnemy.velocityX.min, GameBalance.greenEnemy.velocityX.max) * multiplier.velocity,
                Phaser.Math.Between(GameBalance.greenEnemy.velocityY.min, GameBalance.greenEnemy.velocityY.max) * multiplier.velocity
            );
            e.hp = Math.ceil(GameBalance.greenEnemy.baseHealth * multiplier.health);
            e.setTint(0x00ff00);
            e.setScale(1.25);
            e.body.setCircle(12);
            e.enemyType = 'green';

            // Spawn effect
            createSpawnEffect(this.scene, x, -50, 0x00ff00);
        }
    }

    spawnYellowEnemy(x) {
        const e = this.yellowEnemies.get(x, -50);
        if (e) {
            const multiplier = this.getWaveDifficultyMultiplier();

            e.enableBody(true, x, -50, true, true);
            e.setVelocity(
                Phaser.Math.Between(GameBalance.yellowEnemy.velocityX.min, GameBalance.yellowEnemy.velocityX.max) * multiplier.velocity,
                Phaser.Math.Between(GameBalance.yellowEnemy.velocityY.min, GameBalance.yellowEnemy.velocityY.max) * multiplier.velocity
            );
            e.hp = Math.ceil(GameBalance.yellowEnemy.baseHealth * multiplier.health);
            e.setTint(0xffff00);
            e.setScale(1.25);
            e.body.setCircle(12);
            e.enemyType = 'yellow';

            // Spawn effect
            createSpawnEffect(this.scene, x, -50, 0xffff00);
        }
    }

    spawnPurpleEnemy(x) {
        const e = this.purpleEnemies.get(x, -50);
        if (e) {
            const multiplier = this.getWaveDifficultyMultiplier();

            e.enableBody(true, x, -50, true, true);
            e.setVelocity(
                Phaser.Math.Between(GameBalance.purpleEnemy.velocityX.min, GameBalance.purpleEnemy.velocityX.max) * multiplier.velocity,
                Phaser.Math.Between(GameBalance.purpleEnemy.velocityY.min, GameBalance.purpleEnemy.velocityY.max) * multiplier.velocity
            );
            e.hp = Math.ceil(GameBalance.purpleEnemy.baseHealth * multiplier.health);
            e.setTint(0x9932cc);
            e.setScale(1.25);
            e.body.setCircle(12);
            e.enemyType = 'purple';

            // Spawn effect
            createSpawnEffect(this.scene, x, -50, 0x9932cc);
        }
    }

    fireLogic() {
        if (this.scene.isGameOver) return;
        const fireFromGroup = (group) => {
            group.children.iterate(child => {
                if (child.active && child.y > 0 && child.y < this.scene.scale.height * 0.75 && Math.random() < GameBalance.enemy.fireChance) {
                    const b = this.enemyBullets.get(child.x, child.y);
                    if (b) {
                        b.enableBody(true, child.x, child.y, true, true);
                        b.setScale(1); // 8x8 sprite, no scaling needed
                        b.body.setCircle(3); // Circular hitbox with 3px radius (ignores transparent edges)
                        this.scene.physics.moveToObject(b, this.scene.player, GameBalance.enemy.bulletSpeed);
                        AudioEngine.play('enemyshoot', 0.3);

                        // Muzzle flash effect
                        const angle = Phaser.Math.Angle.Between(child.x, child.y, this.scene.player.x, this.scene.player.y);
                        createMuzzleFlash(this.scene, child.x, child.y, {
                            direction: angle,
                            color: 0xffaa00,
                            count: 3,
                            distance: 12
                        });
                    }
                }
            });
        };
        fireFromGroup(this.enemies);
        fireFromGroup(this.blueEnemies);
        fireFromGroup(this.greenEnemies);
        fireFromGroup(this.yellowEnemies);
        fireFromGroup(this.purpleEnemies);
    }

    handleHit(enemy, damage) {
        enemy.hp -= damage;

        // Play hit sound
        AudioEngine.play('enemyhit', 0.3);

        // Impact particles
        createDirectionalBurst(this.scene, enemy.x, enemy.y, Math.PI / 2, {
            count: 4,
            radius: 2,
            color: 0xffffff,
            spread: 20,
            duration: 150
        });

        // Cancel any existing flash timer to ensure new flash is visible
        if (enemy.flashTimer) {
            enemy.flashTimer.remove();
        }

        // Flash white when hit using tintFill for more visible flash
        const originalTints = {
            'blue': 0x0000ff,
            'green': 0x00ff00,
            'yellow': 0xffff00,
            'red': 0xff0000
        };
        const originalTint = originalTints[enemy.enemyType];
        enemy.clearTint();
        enemy.setTintFill(0xffffff); // Fill with white for strong flash effect

        // Restore original tint after 150ms
        enemy.flashTimer = this.scene.time.delayedCall(150, () => {
            if (enemy.active) {
                enemy.clearTint();
                if (originalTint) {
                    enemy.setTint(originalTint);
                }
            }
            enemy.flashTimer = null;
        });

        if (enemy.hp <= 0) {
            // Clean up flash timer
            if (enemy.flashTimer) {
                enemy.flashTimer.remove();
                enemy.flashTimer = null;
            }

            // Create explosion effect
            const explosionColors = {
                'red': 0xff0000,
                'blue': 0x0000ff,
                'green': 0x00ff00,
                'yellow': 0xffff00,
                'purple': 0x9932cc
            };
            const explosionColor = explosionColors[enemy.enemyType] || 0xff0000;
            this.createExplosion(enemy.x, enemy.y, explosionColor);

            // Random gold drop
            const dropGold = Math.random() < GameBalance.progression.goldDropChance;
            this.scene.onEnemyKilled(enemy.x, enemy.y, dropGold, enemy.enemyType);
            enemy.disableBody(true, true);
            AudioEngine.play('explode');
        }
    }

    createExplosion(x, y, color = 0xff0000) {
        // Create multiple expanding circles for explosion effect
        for (let i = 0; i < 3; i++) {
            const circle = this.scene.add.circle(x, y, 5, color, 0.8).setDepth(50);

            this.scene.tweens.add({
                targets: circle,
                radius: 40 + (i * 10),
                alpha: 0,
                duration: 300 + (i * 100),
                ease: 'Power2',
                onComplete: () => circle.destroy()
            });
        }

        // Add some particles
        const particleColor = color === 0x0000ff ? 0x00aaff : 0xffaa00;
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const particle = this.scene.add.circle(x, y, 3, particleColor, 1).setDepth(50);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 50,
                y: y + Math.sin(angle) * 50,
                alpha: 0,
                duration: 400,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }

    cleanup() {
        const w = this.scene.scale.width;
        const h = this.scene.scale.height;
        const boundary = 60;

        const clean = (g) => g.children.iterate(c => {
            if(c.active && (
                c.y < -boundary ||
                c.y > h + boundary ||
                c.x < -boundary ||
                c.x > w + boundary
            )) {
                // Clean up flash timer if it exists
                if (c.flashTimer) {
                    c.flashTimer.remove();
                    c.flashTimer = null;
                }
                c.disableBody(true,true);
            }
        });
        clean(this.enemies);
        clean(this.blueEnemies);
        clean(this.greenEnemies);
        clean(this.yellowEnemies);
        clean(this.purpleEnemies);
        clean(this.enemyBullets);
    }
}
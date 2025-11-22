import Phaser from 'phaser';
import { AudioEngine } from '../systems/AudioEngine.js';
import { GameBalance } from '../config/GameBalance.js';

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
        this.enemyBullets = scene.physics.add.group({
            defaultKey: 'ebullet',
            maxSize: GameBalance.enemy.bulletPoolSize
        });

        this.gameStartTime = Date.now();

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

        const elapsedTime = Date.now() - this.gameStartTime;
        const x = Phaser.Math.Between(30, this.scene.scale.width - 30);

        // Check which enemy types are unlocked
        const yellowUnlocked = elapsedTime >= GameBalance.yellowEnemy.introductionTime;
        const greenUnlocked = elapsedTime >= GameBalance.greenEnemy.introductionTime;
        const blueUnlocked = elapsedTime >= GameBalance.blueEnemy.introductionTime;

        // Determine which enemy to spawn (prioritize harder enemies)
        let enemyType = 'red'; // Default
        const roll = Math.random();

        if (yellowUnlocked && roll < GameBalance.yellowEnemy.spawnChance) {
            enemyType = 'yellow';
        } else if (greenUnlocked && roll < (GameBalance.yellowEnemy.spawnChance + GameBalance.greenEnemy.spawnChance)) {
            enemyType = 'green';
        } else if (blueUnlocked && roll < (GameBalance.yellowEnemy.spawnChance + GameBalance.greenEnemy.spawnChance + GameBalance.blueEnemy.spawnChance)) {
            enemyType = 'blue';
        }

        // Spawn the selected enemy type
        switch (enemyType) {
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

    spawnRedEnemy(x) {
        const e = this.enemies.get(x, -50);
        if (e) {
            e.enableBody(true, x, -50, true, true);
            e.setVelocity(
                Phaser.Math.Between(GameBalance.enemy.velocityX.min, GameBalance.enemy.velocityX.max),
                Phaser.Math.Between(GameBalance.enemy.velocityY.min, GameBalance.enemy.velocityY.max)
            );
            e.hp = GameBalance.enemy.baseHealth;
            e.clearTint();
            e.setScale(1.25);
            e.body.setCircle(12);
            e.enemyType = 'red';
        }
    }

    spawnBlueEnemy(x) {
        const e = this.blueEnemies.get(x, -50);
        if (e) {
            e.enableBody(true, x, -50, true, true);
            e.setVelocity(
                Phaser.Math.Between(GameBalance.blueEnemy.velocityX.min, GameBalance.blueEnemy.velocityX.max),
                Phaser.Math.Between(GameBalance.blueEnemy.velocityY.min, GameBalance.blueEnemy.velocityY.max)
            );
            e.hp = GameBalance.blueEnemy.baseHealth;
            e.setTint(0x0000ff);
            e.setScale(1.25);
            e.body.setCircle(12);
            e.enemyType = 'blue';
        }
    }

    spawnGreenEnemy(x) {
        const e = this.greenEnemies.get(x, -50);
        if (e) {
            e.enableBody(true, x, -50, true, true);
            e.setVelocity(
                Phaser.Math.Between(GameBalance.greenEnemy.velocityX.min, GameBalance.greenEnemy.velocityX.max),
                Phaser.Math.Between(GameBalance.greenEnemy.velocityY.min, GameBalance.greenEnemy.velocityY.max)
            );
            e.hp = GameBalance.greenEnemy.baseHealth;
            e.setTint(0x00ff00);
            e.setScale(1.25);
            e.body.setCircle(12);
            e.enemyType = 'green';
        }
    }

    spawnYellowEnemy(x) {
        const e = this.yellowEnemies.get(x, -50);
        if (e) {
            e.enableBody(true, x, -50, true, true);
            e.setVelocity(
                Phaser.Math.Between(GameBalance.yellowEnemy.velocityX.min, GameBalance.yellowEnemy.velocityX.max),
                Phaser.Math.Between(GameBalance.yellowEnemy.velocityY.min, GameBalance.yellowEnemy.velocityY.max)
            );
            e.hp = GameBalance.yellowEnemy.baseHealth;
            e.setTint(0xffff00);
            e.setScale(1.25);
            e.body.setCircle(12);
            e.enemyType = 'yellow';
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
                    }
                }
            });
        };
        fireFromGroup(this.enemies);
        fireFromGroup(this.blueEnemies);
        fireFromGroup(this.greenEnemies);
        fireFromGroup(this.yellowEnemies);
    }

    handleHit(enemy, damage) {
        enemy.hp -= damage;

        // Cancel any existing flash timer to ensure new flash is visible
        if (enemy.flashTimer) {
            enemy.flashTimer.remove();
        }

        // Flash white when hit using tintFill for more visible flash
        const originalTints = {
            'blue': 0x0000ff,
            'green': 0x00ff00,
            'yellow': 0xffff00,
            'red': null
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
                // Red enemies stay with no tint (original sprite colors)
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
                'yellow': 0xffff00
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
        const h = this.scene.scale.height;
        const clean = (g) => g.children.iterate(c => {
            if(c.active && (c.y < -60 || c.y > h + 60)) {
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
        clean(this.enemyBullets);
    }
}
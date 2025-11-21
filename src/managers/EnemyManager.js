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
        const blueEnemiesUnlocked = elapsedTime >= GameBalance.blueEnemy.introductionTime;
        const spawnBlue = blueEnemiesUnlocked && Math.random() < GameBalance.blueEnemy.spawnChance;

        const x = Phaser.Math.Between(30, this.scene.scale.width - 30);

        if (spawnBlue) {
            // Spawn blue enemy
            const e = this.blueEnemies.get(x, -50);
            if (e) {
                e.enableBody(true, x, -50, true, true);
                e.setVelocity(
                    Phaser.Math.Between(GameBalance.blueEnemy.velocityX.min, GameBalance.blueEnemy.velocityX.max),
                    Phaser.Math.Between(GameBalance.blueEnemy.velocityY.min, GameBalance.blueEnemy.velocityY.max)
                );
                e.hp = GameBalance.blueEnemy.baseHealth;
                e.setTint(0x0000ff); // Blue tint
                e.setScale(0.5); // Half size
                e.enemyType = 'blue';
            }
        } else {
            // Spawn regular red enemy
            const e = this.enemies.get(x, -50);
            if (e) {
                e.enableBody(true, x, -50, true, true);
                e.setVelocity(
                    Phaser.Math.Between(GameBalance.enemy.velocityX.min, GameBalance.enemy.velocityX.max),
                    Phaser.Math.Between(GameBalance.enemy.velocityY.min, GameBalance.enemy.velocityY.max)
                );
                e.hp = GameBalance.enemy.baseHealth;
                e.setTint(0xff0000); // Red tint
                e.setScale(1); // Normal size
                e.enemyType = 'red';
            }
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
                        this.scene.physics.moveToObject(b, this.scene.player, GameBalance.enemy.bulletSpeed);
                    }
                }
            });
        };
        fireFromGroup(this.enemies);
        fireFromGroup(this.blueEnemies);
    }

    handleHit(enemy, damage) {
        enemy.hp -= damage;

        // Flash white by clearing tint (shows white texture)
        enemy.clearTint();

        // Restore original tint after 100ms
        const originalTint = enemy.enemyType === 'blue' ? 0x0000ff : 0xff0000;
        this.scene.time.delayedCall(100, () => {
            if (enemy.active) {
                enemy.setTint(originalTint);
            }
        });

        if (enemy.hp <= 0) {
            // Create explosion effect
            const explosionColor = enemy.enemyType === 'blue' ? 0x0000ff : 0xff0000;
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
            if(c.active && (c.y < -60 || c.y > h + 60)) c.disableBody(true,true);
        });
        clean(this.enemies);
        clean(this.blueEnemies);
        clean(this.enemyBullets);
    }
}
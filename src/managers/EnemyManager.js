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
        this.enemyBullets = scene.physics.add.group({
            defaultKey: 'ebullet',
            maxSize: GameBalance.enemy.bulletPoolSize
        });

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
        const e = this.enemies.get(x, -50);
        if (e) {
            e.enableBody(true, x, -50, true, true);
            e.setVelocity(
                Phaser.Math.Between(GameBalance.enemy.velocityX.min, GameBalance.enemy.velocityX.max),
                Phaser.Math.Between(GameBalance.enemy.velocityY.min, GameBalance.enemy.velocityY.max)
            );
            e.hp = GameBalance.enemy.baseHealth;
            e.setTint(0xff0000); // Tint white texture red
        }
    }

    fireLogic() {
        if (this.scene.isGameOver) return;
        this.enemies.children.iterate(child => {
            if (child.active && child.y > 0 && child.y < this.scene.scale.height * 0.75 && Math.random() < GameBalance.enemy.fireChance) {
                const b = this.enemyBullets.get(child.x, child.y);
                if (b) {
                    b.enableBody(true, child.x, child.y, true, true);
                    this.scene.physics.moveToObject(b, this.scene.player, GameBalance.enemy.bulletSpeed);
                }
            }
        });
    }

    handleHit(enemy, damage) {
        enemy.hp -= damage;

        // Flash white by clearing tint (shows white texture)
        enemy.clearTint();

        // Restore red tint after 100ms
        this.scene.time.delayedCall(100, () => {
            if (enemy.active) {
                enemy.setTint(0xff0000);
            }
        });

        if (enemy.hp <= 0) {
            // Create explosion effect
            this.createExplosion(enemy.x, enemy.y);

            // Random gold drop
            const dropGold = Math.random() < GameBalance.progression.goldDropChance;
            this.scene.onEnemyKilled(enemy.x, enemy.y, dropGold);
            enemy.disableBody(true, true);
            AudioEngine.play('explode');
        }
    }

    createExplosion(x, y) {
        // Create multiple expanding circles for explosion effect
        for (let i = 0; i < 3; i++) {
            const circle = this.scene.add.circle(x, y, 5, 0xff0000, 0.8).setDepth(50);

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
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const particle = this.scene.add.circle(x, y, 3, 0xffaa00, 1).setDepth(50);

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
        clean(this.enemyBullets);
    }
}
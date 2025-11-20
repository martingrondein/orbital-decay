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
            e.hp = GameBalance.enemy.baseHealth + Math.floor(
                this.scene.stats.level * GameBalance.enemy.healthScalingPerLevel
            );
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
        if (enemy.hp <= 0) {
            this.scene.onEnemyKilled(enemy.x, enemy.y);
            enemy.disableBody(true, true);
            AudioEngine.play('explode');
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
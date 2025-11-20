import { AudioEngine } from '../systems/AudioEngine.js';

export default class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = scene.physics.add.group({ defaultKey: 'enemy', maxSize: 30 });
        this.enemyBullets = scene.physics.add.group({ defaultKey: 'ebullet', maxSize: 100 });

        // Timers
        scene.time.addEvent({ delay: 800, callback: this.spawn, callbackScope: this, loop: true });
        scene.time.addEvent({ delay: 1500, callback: this.fireLogic, callbackScope: this, loop: true });
    }

    spawn() {
        if (this.scene.isGameOver) return;
        const x = Phaser.Math.Between(30, 420);
        const e = this.enemies.get(x, -50);
        if (e) {
            e.enableBody(true, x, -50, true, true);
            e.setVelocity(Phaser.Math.Between(-25, 25), Phaser.Math.Between(50, 100));
            e.hp = 2 + Math.floor(this.scene.stats.level * 0.5); // Scaling difficulty
        }
    }

    fireLogic() {
        if (this.scene.isGameOver) return;
        this.enemies.children.iterate(child => {
            if (child.active && child.y > 0 && child.y < 600 && Phaser.Math.Between(0, 100) > 80) {
                const b = this.enemyBullets.get(child.x, child.y);
                if (b) {
                    b.enableBody(true, child.x, child.y, true, true);
                    this.scene.physics.moveToObject(b, this.scene.player, 300);
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
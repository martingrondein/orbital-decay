import Phaser from 'phaser';
import Player from '../entities/Player.js';
import EnemyManager from '../managers/EnemyManager.js';
import PowerupManager from '../managers/PowerupManager.js';
import Background from '../systems/Background.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { AudioEngine } from '../systems/AudioEngine.js';
import Joystick from '../utils/Joystick.js';
import { GameBalance } from '../config/GameBalance.js';

export default class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    create() {
        // 1. Data Init
        this.stats = SaveSystem.load();
        this.enemiesDefeated = 0;
        this.score = 0;
        this.isGameOver = false;

        // Powerup tracking
        this.activePowerupType = null;
        this.activePowerupTimer = null;
        this.baseDamageMult = this.stats.damageMult;
        this.baseFireRateMs = this.stats.fireRateMs;

        // 2. Systems
        this.background = new Background(this);
        this.events.emit('startUI', this.stats); // Notify UIScene

        // 3. Groups
        this.bullets = this.physics.add.group({ defaultKey: 'bullet', maxSize: 50 });
        this.xpItems = this.physics.add.group({ defaultKey: 'xp', maxSize: 50 });

        // 4. Entities
        this.player = new Player(this, this.scale.width / 2, 710, this.stats);
        this.enemyManager = new EnemyManager(this);
        this.powerupManager = new PowerupManager(this);

        // 5. Inputs (Joystick)
        this.joystick = new Joystick(this, this.scale.width - 90, 710);

        // 6. Collisions
        this.physics.add.overlap(this.bullets, this.enemyManager.enemies,
            (b, e) => { b.disableBody(true,true); this.enemyManager.handleHit(e, this.stats.damageMult); });

        this.physics.add.overlap(this.player, this.xpItems,
            (p, xp) => this.collectXP(xp));

        this.physics.add.overlap(this.player, this.enemyManager.enemies,
            (p, e) => { e.disableBody(true,true); this.handlePlayerHit(5); });

        this.physics.add.overlap(this.player, this.enemyManager.enemyBullets,
            (p, b) => { b.disableBody(true,true); this.handlePlayerHit(5); });

        this.physics.add.overlap(this.player, this.powerupManager.powerups,
            (p, powerup) => this.collectPowerup(powerup));
    }

    update(time, delta) {
        if (this.isGameOver) return;

        this.background.update();
        this.player.update(time, this.joystick.getData());
        this.enemyManager.cleanup();
        this.powerupManager.cleanup();

        // Cleanup bullets/XP
        [this.bullets, this.xpItems].forEach(g => {
            g.children.iterate(c => {
                if(c.active && (c.y < -50 || c.y > this.scale.height + 50)) c.disableBody(true,true);
            });
        });
    }

    handlePlayerHit(dmg) {
        this.player.takeDamage(dmg);
        this.events.emit('updateHealth', this.player.currentHealth, this.stats.maxHealth);

        if (this.player.currentHealth <= 0) {
            this.isGameOver = true;
            this.physics.pause();
            SaveSystem.save(this.stats); // SAVE STATS ON DEATH
            this.scene.get('UIScene').showGameOver(this.score);
        }
    }

    onEnemyKilled(x, y) {
        this.enemiesDefeated++;
        this.score += GameBalance.progression.scorePerKill;
        this.events.emit('updateScore', this.score);

        // Drop XP
        const xp = this.xpItems.get(x, y);
        if (xp) {
            xp.enableBody(true, x, y, true, true);
            xp.setVelocityY(100);
        }
    }

    collectXP(xpItem) {
        xpItem.disableBody(true, true);
        this.stats.xp += (GameBalance.progression.xpPerPickup * this.stats.xpMult);
        AudioEngine.play('xp');

        if (this.stats.xp >= this.stats.reqXp) {
            this.levelUp();
        }
        this.events.emit('updateXP', this.stats.xp, this.stats.reqXp);
    }

    collectPowerup(powerup) {
        const type = powerup.powerupType;
        powerup.disableBody(true, true);

        // Clear any existing powerup
        if (this.activePowerupTimer) {
            this.activePowerupTimer.remove();
            this.clearPowerupEffect(this.activePowerupType);
        }

        // Apply new powerup
        this.activePowerupType = type;
        this.powerupManager.setActivePowerup(type);
        this.applyPowerupEffect(type);

        AudioEngine.play('xp'); // Reuse XP sound

        // Notify UI
        this.events.emit('powerupActivated', type);

        // Set timer to clear after 15 seconds
        this.activePowerupTimer = this.time.delayedCall(15000, () => {
            this.clearPowerupEffect(type);
            this.activePowerupType = null;
            this.activePowerupTimer = null;
            this.powerupManager.clearActivePowerup();
            this.events.emit('powerupExpired');
        });
    }

    applyPowerupEffect(type) {
        switch(type) {
            case 'spray':
                this.player.sprayShot = true;
                break;
            case 'damage':
                this.baseDamageMult = this.stats.damageMult;
                this.stats.damageMult *= 2;
                break;
            case 'firerate':
                this.baseFireRateMs = this.stats.fireRateMs;
                this.stats.fireRateMs = Math.max(50, Math.floor(this.stats.fireRateMs / 2));
                break;
        }
    }

    clearPowerupEffect(type) {
        switch(type) {
            case 'spray':
                this.player.sprayShot = false;
                break;
            case 'damage':
                this.stats.damageMult = this.baseDamageMult;
                break;
            case 'firerate':
                this.stats.fireRateMs = this.baseFireRateMs;
                break;
        }
    }

    levelUp() {
        AudioEngine.play('levelup');
        this.stats.level++;
        this.stats.xp = 0;
        this.stats.reqXp = Math.floor(this.stats.reqXp * GameBalance.levelUp.xpRequirementMultiplier);

        // Persistent Upgrades
        this.stats.maxHealth += GameBalance.levelUp.healthIncrease;
        this.player.currentHealth = this.stats.maxHealth;
        this.stats.moveSpeed += GameBalance.levelUp.speedIncrease;
        this.stats.fireRateMs = Math.max(
            GameBalance.levelUp.fireRateMin,
            this.stats.fireRateMs - GameBalance.levelUp.fireRateDecrease
        );
        this.stats.damageMult += GameBalance.levelUp.damageIncrease;

        // Update base values for powerup calculations
        this.baseDamageMult = this.stats.damageMult;
        this.baseFireRateMs = this.stats.fireRateMs;

        SaveSystem.save(this.stats); // Save progress immediately

        // Pause for UI
        this.scene.pause();
        this.scene.get('UIScene').showLevelUp(this.stats, () => {
            this.scene.resume();
        });
    }
}
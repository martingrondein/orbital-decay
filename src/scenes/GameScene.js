import Phaser from 'phaser';
import Player from '../entities/Player.js';
import EnemyManager from '../managers/EnemyManager.js';
import PowerupManager from '../managers/PowerupManager.js';
import Background from '../systems/Background.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { AudioEngine } from '../systems/AudioEngine.js';
import Joystick from '../utils/Joystick.js';
import { GameBalance } from '../config/GameBalance.js';
import { GameConstants } from '../config/GameConstants.js';
import { applyPowerup, clearPowerup } from '../config/PowerupConfig.js';
import { createCollectionEffect, createExplosionEffect } from '../utils/EffectsUtils.js';

export default class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    create() {
        // 1. Data Init
        this.stats = SaveSystem.load();
        this.enemiesDefeated = 0;
        this.score = 0;
        this.isGameOver = false;
        this.canMove = true; // Track if player can move
        this.fuel = GameBalance.fuel.startFuel;
        this.distance = 0; // Distance counter

        // Powerup tracking
        this.activePowerupType = null;
        this.activePowerupTimer = null;
        this.baseDamageMult = this.stats.damageMult;
        this.baseFireRateMs = this.stats.fireRateMs;
        this.baseXPMult = this.stats.xpMult;
        this.scoreMultiplier = 1; // For triple score powerup

        // 2. Systems
        this.background = new Background(this);
        this.events.emit('startUI', this.stats); // Notify UIScene
        this.events.emit('updateFuel', this.fuel); // Notify UIScene of initial fuel

        // Fuel depletion and distance tracking timer (1 per second)
        this.time.addEvent({
            delay: GameConstants.timing.gameTickInterval,
            callback: () => {
                if (!this.isGameOver) {
                    this.fuel = Math.max(0, this.fuel - GameBalance.fuel.depletionPerSecond);
                    this.events.emit('updateFuel', this.fuel);
                    if (this.fuel <= 0) {
                        this.canMove = false; // Stop player movement when out of fuel
                    }

                    // Increment distance
                    this.distance++;
                    this.events.emit('updateDistance', this.distance);
                }
            },
            loop: true
        });

        // 3. Groups
        this.bullets = this.physics.add.group({ defaultKey: 'bullet', maxSize: 50 });
        this.xpItems = this.physics.add.group({
            defaultKey: 'xp',
            maxSize: 50,
            bounceX: 1,
            bounceY: 0.8,
            collideWorldBounds: false
        });
        this.goldItems = this.physics.add.group({
            defaultKey: 'gold',
            maxSize: 30,
            bounceX: 1,
            bounceY: 0.8,
            collideWorldBounds: false
        });
        this.fuelItems = this.physics.add.group({
            defaultKey: 'fuel',
            maxSize: 30,
            bounceX: 1,
            bounceY: 0.8,
            collideWorldBounds: false
        });

        // 4. Entities - position based on screen height
        const playerY = Math.min(
            this.scale.height - GameConstants.player.paddingFromBottom,
            GameConstants.player.maxStartY
        );
        this.player = new Player(this, this.scale.width / 2, playerY, this.stats);
        this.enemyManager = new EnemyManager(this);
        this.powerupManager = new PowerupManager(this);

        // 5. Inputs (Dynamic Joystick - appears at touch location)
        this.joystick = new Joystick(this, 0, 0); // Initial position doesn't matter

        // 6. Collisions
        this.physics.add.overlap(this.bullets, this.enemyManager.enemies,
            (b, e) => { b.disableBody(true,true); this.enemyManager.handleHit(e, this.stats.damageMult); });

        this.physics.add.overlap(this.bullets, this.enemyManager.blueEnemies,
            (b, e) => { b.disableBody(true,true); this.enemyManager.handleHit(e, this.stats.damageMult); });

        this.physics.add.overlap(this.player, this.xpItems,
            (p, xp) => this.collectXP(xp));

        this.physics.add.overlap(this.player, this.goldItems,
            (p, gold) => this.collectGold(gold));

        this.physics.add.overlap(this.player, this.fuelItems,
            (p, fuel) => this.collectFuel(fuel));

        this.physics.add.overlap(this.player, this.enemyManager.enemies,
            (p, e) => { e.disableBody(true,true); this.handlePlayerHit(GameConstants.damage.collision); });

        this.physics.add.overlap(this.player, this.enemyManager.blueEnemies,
            (p, e) => { e.disableBody(true,true); this.handlePlayerHit(GameConstants.damage.collision); });

        this.physics.add.overlap(this.player, this.enemyManager.enemyBullets,
            (p, b) => { b.disableBody(true,true); this.handlePlayerHit(GameConstants.damage.collision); });

        this.physics.add.overlap(this.player, this.powerupManager.powerups,
            (p, powerup) => this.collectPowerup(powerup));

        // Item-to-item collisions (bounce off each other)
        this.physics.add.collider(this.xpItems, this.goldItems);
        this.physics.add.collider(this.xpItems, this.fuelItems);
        this.physics.add.collider(this.goldItems, this.fuelItems);
        this.physics.add.collider(this.xpItems, this.xpItems);
        this.physics.add.collider(this.goldItems, this.goldItems);
        this.physics.add.collider(this.fuelItems, this.fuelItems);
    }

    update(time, delta) {
        if (this.isGameOver) return;

        this.background.update();
        this.player.update(time, this.joystick.getData());
        this.enemyManager.cleanup();
        this.powerupManager.cleanup();

        // Update shield bubble position
        if (this.shieldBubble) {
            this.shieldBubble.setPosition(this.player.x, this.player.y);
        }

        // Magnetic attraction for collectibles
        this.applyMagneticAttraction();

        // Cleanup bullets/XP/Gold/Fuel
        [this.bullets, this.xpItems, this.goldItems, this.fuelItems].forEach(g => {
            g.children.iterate(c => {
                const boundary = GameConstants.spawn.cleanupBoundary;
                if(c.active && (c.y < -boundary || c.y > this.scale.height + boundary)) {
                    c.disableBody(true,true);
                }
            });
        });
    }

    applyMagneticAttraction() {
        const magneticRange = this.stats.magneticRange;
        const attractionStrength = 500; // Pixels per second - strong enough to override gravity and bounce

        // Apply to all collectible groups
        [this.xpItems, this.goldItems, this.fuelItems].forEach(group => {
            group.children.iterate(item => {
                if (!item.active) return;

                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    item.x, item.y
                );

                // If within magnetic range, pull towards player persistently
                if (distance <= magneticRange && distance > 0) {
                    // Mark item as magnetized for stronger tracking
                    if (!item.magnetized) {
                        item.magnetized = true;
                    }

                    // Apply strong attraction to ensure items follow player
                    this.physics.moveToObject(item, this.player, attractionStrength);
                } else if (item.magnetized) {
                    // Item left magnetic range, reset flag
                    item.magnetized = false;
                }
            });
        });
    }

    handlePlayerHit(dmg) {
        this.player.takeDamage(dmg);
        this.events.emit('updateHealth', this.player.currentHealth, this.stats.maxHealth);

        if (this.player.currentHealth <= 0) {
            // Check for revive
            if (this.stats.hasRevive) {
                this.revivePlayer();
            } else {
                this.isGameOver = true;
                this.physics.pause();
                SaveSystem.save(this.stats); // SAVE STATS ON DEATH

                // Check and save high score and best distance
                const isNewHighScore = SaveSystem.saveHighScore(this.score);
                SaveSystem.saveBestDistance(this.distance);
                this.scene.get('UIScene').showGameOver(this.score, isNewHighScore);
            }
        }
    }

    revivePlayer() {
        // Restore health to 50%
        this.player.currentHealth = Math.floor(this.stats.maxHealth * 0.5);
        this.events.emit('updateHealth', this.player.currentHealth, this.stats.maxHealth);

        // Consume revive
        this.stats.hasRevive = false;
        SaveSystem.save(this.stats);

        // Show revive message
        const w = this.scale.width;
        const h = this.scale.height;
        const reviveText = this.add.text(w/2, h/2, 'REVIVED!', {
            fontSize: GameConstants.revive.fontSize,
            color: '#00ff00',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: GameConstants.revive.strokeThickness
        }).setOrigin(0.5).setDepth(100);

        // Fade out and destroy
        this.tweens.add({
            targets: reviveText,
            alpha: 0,
            y: h/2 - GameConstants.revive.textOffset,
            duration: GameConstants.revive.duration,
            ease: 'Power2',
            onComplete: () => reviveText.destroy()
        });

        // Brief invulnerability
        this.player.isInvulnerable = true;
        this.player.setAlpha(0.5);
        this.time.delayedCall(GameConstants.timing.invulnerabilityDuration, () => {
            this.player.isInvulnerable = false;
            this.player.setAlpha(1);
        });
    }

    onEnemyKilled(x, y, dropGold = false, enemyType = 'red') {
        this.enemiesDefeated++;

        // Apply score multiplier for blue enemies
        const scoreMultiplier = enemyType === 'blue' ? GameBalance.blueEnemy.scoreMultiplier : 1;
        this.score += GameBalance.progression.scorePerKill * this.scoreMultiplier * scoreMultiplier;
        this.events.emit('updateScore', this.score);

        // Drop XP (more for blue enemies)
        const xpMultiplier = enemyType === 'blue' ? GameBalance.blueEnemy.xpMultiplier : 1;
        for (let i = 0; i < xpMultiplier; i++) {
            const xp = this.xpItems.get(x + (i * GameConstants.drops.horizontalSpacing), y);
            if (xp) {
                xp.enableBody(true, x + (i * GameConstants.drops.horizontalSpacing), y, true, true);
                xp.setVelocityY(GameConstants.drops.velocityY);
                xp.setVelocityX(Phaser.Math.Between(-50, 50));
            }
        }

        // Drop gold if applicable (more for blue enemies)
        if (dropGold) {
            const goldMultiplier = enemyType === 'blue' ? GameBalance.blueEnemy.goldMultiplier : 1;
            for (let i = 0; i < goldMultiplier; i++) {
                const gold = this.goldItems.get(x + (i * GameConstants.drops.horizontalSpacing), y);
                if (gold) {
                    gold.enableBody(true, x + (i * GameConstants.drops.horizontalSpacing), y, true, true);
                    gold.setVelocityY(GameConstants.drops.velocityY);
                    gold.setVelocityX(Phaser.Math.Between(-50, 50));
                }
            }
        }

        // Random fuel drop
        if (Math.random() < GameBalance.progression.fuelDropChance) {
            const fuel = this.fuelItems.get(x, y);
            if (fuel) {
                fuel.enableBody(true, x, y, true, true);
                fuel.setVelocityY(GameConstants.drops.velocityY);
                fuel.setVelocityX(Phaser.Math.Between(-50, 50));
            }
        }

        // Random powerup drop if no powerup is active
        if (!this.activePowerupType && Math.random() < GameConstants.spawn.powerupSpawnChance) {
            this.powerupManager.spawnAtPosition(x, y);
        }
    }

    collectXP(xpItem) {
        // Create collection effect before disabling
        createCollectionEffect(this, xpItem.x, xpItem.y, 0x00ffff);

        xpItem.disableBody(true, true);
        this.stats.xp += (GameBalance.progression.xpPerPickup * this.stats.xpMult);
        AudioEngine.play('xp');

        if (this.stats.xp >= this.stats.reqXp) {
            this.levelUp();
        }
        this.events.emit('updateXP', this.stats.xp, this.stats.reqXp);
    }

    collectGold(goldItem) {
        // Create collection effect before disabling
        createCollectionEffect(this, goldItem.x, goldItem.y, 0xffd700);

        goldItem.disableBody(true, true);
        this.stats.gold += (GameBalance.progression.goldPerDrop * this.stats.goldMultiplier);
        this.events.emit('updateGold', this.stats.gold);
        AudioEngine.play('xp'); // Reuse XP sound
    }

    collectFuel(fuelItem) {
        // Create collection effect before disabling
        createCollectionEffect(this, fuelItem.x, fuelItem.y, 0x9932cc);

        fuelItem.disableBody(true, true);
        this.fuel = Math.min(
            this.fuel + GameBalance.progression.fuelPerPickup,
            this.stats.maxFuel
        );
        this.events.emit('updateFuel', this.fuel);
        AudioEngine.play('xp'); // Reuse XP sound
    }

    collectPowerup(powerup) {
        const type = powerup.powerupType;
        powerup.disableBody(true, true);

        // Clear any existing powerup
        if (this.activePowerupTimer) {
            this.activePowerupTimer.remove();
            clearPowerup(this.activePowerupType, this);
        }

        // Apply new powerup
        this.activePowerupType = type;
        this.powerupManager.setActivePowerup(type);
        applyPowerup(type, this);

        AudioEngine.play('xp'); // Reuse XP sound

        // Notify UI
        this.events.emit('powerupActivated', type);

        // Set timer to clear after powerup duration
        this.activePowerupTimer = this.time.delayedCall(GameConstants.timing.powerupDuration, () => {
            clearPowerup(type, this);
            this.activePowerupType = null;
            this.activePowerupTimer = null;
            this.powerupManager.clearActivePowerup();
            this.events.emit('powerupExpired');
        });
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

        // Fuel bonus
        this.fuel = Math.min(
            this.fuel + GameBalance.levelUp.fuelBonus,
            this.stats.maxFuel
        );
        this.events.emit('updateFuel', this.fuel);

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
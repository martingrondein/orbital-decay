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
import { createCollectionEffect, createExplosionEffect, createCelebrationBurst, createRadialParticleBurst, createBulletTrail, createEnemyTail } from '../utils/EffectsUtils.js';

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

        // Wave tracking
        this.currentWave = 1;
        this.waveAnnounced = {
            1: false,
            2: false,
            3: false,
            4: false
        };
        this.baseFireRateMs = this.stats.fireRateMs;
        this.baseXPMult = this.stats.xpMult;
        this.scoreMultiplier = 1; // For triple score powerup

        // 2. Systems
        AudioEngine.init(this);
        this.background = new Background(this);

        // Start background music
        if (!this.sound.get('bgmusic')) {
            this.bgMusic = this.sound.add('bgmusic', { loop: true, volume: 0.4 });
            this.bgMusic.play();
        }

        this.events.emit('startUI', this.stats); // Notify UIScene
        this.events.emit('updateFuel', this.fuel); // Notify UIScene of initial fuel

        // Show Wave 1 announcement after a short delay
        this.time.delayedCall(500, () => {
            this.scene.get('UIScene').showWaveAnnouncement(1);
            this.waveAnnounced[1] = true;
        });

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

        this.physics.add.overlap(this.bullets, this.enemyManager.greenEnemies,
            (b, e) => { b.disableBody(true,true); this.enemyManager.handleHit(e, this.stats.damageMult); });

        this.physics.add.overlap(this.bullets, this.enemyManager.yellowEnemies,
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

        this.physics.add.overlap(this.player, this.enemyManager.greenEnemies,
            (p, e) => { e.disableBody(true,true); this.handlePlayerHit(GameConstants.damage.collision); });

        this.physics.add.overlap(this.player, this.enemyManager.yellowEnemies,
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

        // Check for wave transitions based on game time
        const elapsedTime = Date.now() - this.enemyManager.gameStartTime;

        if (elapsedTime >= GameBalance.blueEnemy.introductionTime && !this.waveAnnounced[2]) {
            this.currentWave = 2;
            this.scene.get('UIScene').showWaveAnnouncement(2);
            this.waveAnnounced[2] = true;
        } else if (elapsedTime >= GameBalance.greenEnemy.introductionTime && !this.waveAnnounced[3]) {
            this.currentWave = 3;
            this.scene.get('UIScene').showWaveAnnouncement(3);
            this.waveAnnounced[3] = true;
        } else if (elapsedTime >= GameBalance.yellowEnemy.introductionTime && !this.waveAnnounced[4]) {
            this.currentWave = 4;
            this.scene.get('UIScene').showWaveAnnouncement(4);
            this.waveAnnounced[4] = true;
        }

        this.background.update();
        this.player.update(time, this.joystick.getData());
        this.enemyManager.cleanup();
        this.powerupManager.cleanup();

        // Create wiggly tails for all enemies
        this.enemyManager.enemies.children.iterate(enemy => {
            if (enemy.active && enemy.body) {
                createEnemyTail(this, enemy.x, enemy.y, enemy.body.velocity.x, enemy.body.velocity.y, time, {
                    color: 0xff4444,
                    count: 3,
                    radius: 2.5,
                    alpha: 0.5,
                    spacing: 8,
                    wiggleAmount: 4,
                    duration: 250,
                    depth: 0
                });
            }
        });

        this.enemyManager.blueEnemies.children.iterate(enemy => {
            if (enemy.active && enemy.body) {
                createEnemyTail(this, enemy.x, enemy.y, enemy.body.velocity.x, enemy.body.velocity.y, time, {
                    color: 0x4444ff,
                    count: 3,
                    radius: 2.5,
                    alpha: 0.5,
                    spacing: 8,
                    wiggleAmount: 4,
                    duration: 250,
                    depth: 0
                });
            }
        });

        this.enemyManager.greenEnemies.children.iterate(enemy => {
            if (enemy.active && enemy.body) {
                createEnemyTail(this, enemy.x, enemy.y, enemy.body.velocity.x, enemy.body.velocity.y, time, {
                    color: 0x44ff44,
                    count: 3,
                    radius: 2.5,
                    alpha: 0.5,
                    spacing: 8,
                    wiggleAmount: 4,
                    duration: 250,
                    depth: 0
                });
            }
        });

        this.enemyManager.yellowEnemies.children.iterate(enemy => {
            if (enemy.active && enemy.body) {
                createEnemyTail(this, enemy.x, enemy.y, enemy.body.velocity.x, enemy.body.velocity.y, time, {
                    color: 0xffff44,
                    count: 3,
                    radius: 2.5,
                    alpha: 0.5,
                    spacing: 8,
                    wiggleAmount: 4,
                    duration: 250,
                    depth: 0
                });
            }
        });

        // Update shield bubble position
        if (this.shieldBubble) {
            this.shieldBubble.setPosition(this.player.x, this.player.y);
        }

        // Magnetic attraction for collectibles
        this.applyMagneticAttraction();

        // Create bullet trails and cleanup
        this.bullets.children.iterate(bullet => {
            if (bullet.active) {
                // Spawn light contrail effect
                createBulletTrail(this, bullet.x, bullet.y, {
                    count: 2,
                    radius: 1.5,
                    color: 0xaaffff,
                    alpha: 0.7,
                    duration: 150,
                    depth: 1
                });

                // Cleanup if out of bounds
                const boundary = GameConstants.spawn.cleanupBoundary;
                if (bullet.y < -boundary || bullet.y > this.scale.height + boundary) {
                    bullet.disableBody(true, true);
                }
            }
        });

        // Create enemy bullet trails
        this.enemyManager.enemyBullets.children.iterate(bullet => {
            if (bullet.active) {
                // Spawn red contrail effect
                createBulletTrail(this, bullet.x, bullet.y, {
                    count: 2,
                    radius: 1.5,
                    color: 0xff5555,
                    alpha: 0.7,
                    duration: 150,
                    depth: 1
                });
            }
        });

        // Update glow aura positions and cleanup XP/Gold/Fuel/Powerups
        [this.xpItems, this.goldItems, this.fuelItems, this.powerupManager.powerups].forEach(g => {
            g.children.iterate(c => {
                if (c.active) {
                    // Sync glow aura position with item
                    if (c.glowAura) {
                        c.glowAura.setPosition(c.x, c.y);
                    }

                    // Cleanup if out of bounds
                    const boundary = GameConstants.spawn.cleanupBoundary;
                    if (c.y < -boundary || c.y > this.scale.height + boundary) {
                        this.removeGlowEffect(c);
                        c.disableBody(true, true);
                    }
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
        AudioEngine.play('hit');
        this.events.emit('updateHealth', this.player.currentHealth, this.stats.maxHealth);

        if (this.player.currentHealth <= 0) {
            // Check for revive
            if (this.stats.hasRevive) {
                this.revivePlayer();
            } else {
                this.isGameOver = true;
                this.physics.pause();
                AudioEngine.play('gameover', 0.7);
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
            fontFamily: 'Silkscreen',
            fontSize: GameConstants.revive.fontSize,
            color: '#00ff00',
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
        AudioEngine.play('drop', 0.4);

        // Get multipliers based on enemy type
        const multipliers = {
            'red': { score: 1, xp: 1, gold: 1 },
            'blue': { score: GameBalance.blueEnemy.scoreMultiplier, xp: GameBalance.blueEnemy.xpMultiplier, gold: GameBalance.blueEnemy.goldMultiplier },
            'green': { score: GameBalance.greenEnemy.scoreMultiplier, xp: GameBalance.greenEnemy.xpMultiplier, gold: GameBalance.greenEnemy.goldMultiplier },
            'yellow': { score: GameBalance.yellowEnemy.scoreMultiplier, xp: GameBalance.yellowEnemy.xpMultiplier, gold: GameBalance.yellowEnemy.goldMultiplier }
        };
        const mult = multipliers[enemyType] || multipliers['red'];

        // Calculate score value
        const scoreValue = Math.floor(GameBalance.progression.scorePerKill * this.scoreMultiplier * mult.score);

        // Apply score
        this.score += scoreValue;
        this.events.emit('updateScore', this.score);

        // Display floating score popup
        this.showScorePopup(x, y, scoreValue);

        // Drop XP
        for (let i = 0; i < mult.xp; i++) {
            const xp = this.xpItems.get(x + (i * GameConstants.drops.horizontalSpacing), y);
            if (xp) {
                xp.enableBody(true, x + (i * GameConstants.drops.horizontalSpacing), y, true, true);
                xp.setVelocityY(GameConstants.drops.velocityY);
                xp.setVelocityX(Phaser.Math.Between(-50, 50));
                xp.setScale(1); // 16x16 sprite, no scaling needed
                xp.body.setCircle(6); // Circular hitbox with 6px radius (ignores transparent edges)
                this.addGlowEffect(xp);
            }
        }

        // Drop gold if applicable
        if (dropGold) {
            for (let i = 0; i < mult.gold; i++) {
                const gold = this.goldItems.get(x + (i * GameConstants.drops.horizontalSpacing), y);
                if (gold) {
                    gold.enableBody(true, x + (i * GameConstants.drops.horizontalSpacing), y, true, true);
                    gold.setVelocityY(GameConstants.drops.velocityY);
                    gold.setVelocityX(Phaser.Math.Between(-50, 50));
                    gold.setScale(1); // 16x16 sprite, no scaling needed
                    gold.body.setCircle(6); // Circular hitbox with 6px radius (ignores transparent edges)
                    this.addGlowEffect(gold);
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
                fuel.setScale(1); // 16x16 sprite, no scaling needed
                fuel.body.setCircle(6); // Circular hitbox with 6px radius (ignores transparent edges)
                this.addGlowEffect(fuel);
            }
        }

        // Random powerup drop if no powerup is active
        if (!this.activePowerupType && Math.random() < GameConstants.spawn.powerupSpawnChance) {
            this.powerupManager.spawnAtPosition(x, y);
        }
    }

    showScorePopup(x, y, scoreValue) {
        // Create floating score text
        const scoreText = this.add.text(x, y, `+${scoreValue}`, {
            fontFamily: 'Silkscreen',
            fontSize: '16px',
            color: '#ffff00',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(100);

        // Animate upward and fade out
        this.tweens.add({
            targets: scoreText,
            y: y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => scoreText.destroy()
        });
    }

    addGlowEffect(item) {
        // Add pulsing glow effect to collectible items
        if (!item.glowTween) {
            // Determine glow color based on item texture
            let glowColor = 0xffffff;
            if (item.texture) {
                const key = item.texture.key;
                if (key === 'xp') glowColor = 0x00ffff;
                else if (key === 'gold') glowColor = 0xffd700;
                else if (key === 'fuel') glowColor = 0x9932cc;
                else if (key.startsWith('powerup_')) glowColor = 0xff00ff;
            }

            // Create glow aura circle
            item.glowAura = this.add.circle(item.x, item.y, 12, glowColor, 0.3).setDepth(item.depth - 1);

            // Sync aura position with item
            item.glowAura.originalScale = 1;

            // Animate the glow aura
            item.glowAuraTween = this.tweens.add({
                targets: item.glowAura,
                alpha: 0.6,
                scale: 1.3,
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Animate the item itself
            item.glowTween = this.tweens.add({
                targets: item,
                alpha: 0.7,
                scale: item.scale * 1.1,
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    removeGlowEffect(item) {
        // Clean up glow tween when item is collected
        if (item.glowTween) {
            item.glowTween.remove();
            item.glowTween = null;
        }
        if (item.glowAuraTween) {
            item.glowAuraTween.remove();
            item.glowAuraTween = null;
        }
        if (item.glowAura) {
            item.glowAura.destroy();
            item.glowAura = null;
        }
    }

    collectXP(xpItem) {
        // Create collection effect before disabling
        createCollectionEffect(this, xpItem.x, xpItem.y, 0x00ffff);

        this.removeGlowEffect(xpItem);
        xpItem.disableBody(true, true);
        const xpGain = this.stats.xpGain || GameBalance.progression.xpPerPickup;
        this.stats.xp += (xpGain * this.stats.xpMult);
        AudioEngine.play('xp');

        if (this.stats.xp >= this.stats.reqXp) {
            this.levelUp();
        }
        this.events.emit('updateXP', this.stats.xp, this.stats.reqXp);
    }

    collectGold(goldItem) {
        // Create collection effect before disabling
        createCollectionEffect(this, goldItem.x, goldItem.y, 0xffd700);

        this.removeGlowEffect(goldItem);
        goldItem.disableBody(true, true);
        this.stats.gold += (GameBalance.progression.goldPerDrop * this.stats.goldMultiplier);
        this.events.emit('updateGold', this.stats.gold);
        AudioEngine.play('gold');
    }

    collectFuel(fuelItem) {
        // Create collection effect before disabling
        createCollectionEffect(this, fuelItem.x, fuelItem.y, 0x9932cc);

        this.removeGlowEffect(fuelItem);
        fuelItem.disableBody(true, true);
        this.fuel = Math.min(
            this.fuel + GameBalance.progression.fuelPerPickup,
            this.stats.maxFuel
        );
        this.events.emit('updateFuel', this.fuel);
        AudioEngine.play('drop');
    }

    collectPowerup(powerup) {
        const type = powerup.powerupType;
        const x = powerup.x;
        const y = powerup.y;
        this.removeGlowEffect(powerup);
        powerup.disableBody(true, true);

        // Powerup-specific visual effects
        const powerupColors = {
            'spray': 0x00ff00,
            'damage': 0xff0000,
            'firerate': 0xffaa00,
            'doublexp': 0x00ffff,
            'triplescore': 0xffff00,
            'shield': 0x00aaff
        };
        const color = powerupColors[type] || 0xffffff;

        // Create vibrant pickup effect
        createRadialParticleBurst(this, x, y, {
            count: 12,
            radius: 4,
            color: color,
            spread: 50,
            duration: 400,
            depth: 50
        });

        // Clear any existing powerup
        if (this.activePowerupTimer) {
            this.activePowerupTimer.remove();
            clearPowerup(this.activePowerupType, this);
        }

        // Apply new powerup
        this.activePowerupType = type;
        this.powerupManager.setActivePowerup(type);
        applyPowerup(type, this);

        AudioEngine.play('drop');

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

        // Celebration effect around player
        createCelebrationBurst(this, this.player.x, this.player.y, {
            count: 20,
            colors: [0xffd700, 0xffffff, 0xffaa00],
            spread: 70,
            duration: 600
        });

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

    shutdown() {
        // Stop background music when scene shuts down
        if (this.bgMusic) {
            this.bgMusic.stop();
            this.bgMusic.destroy();
            this.bgMusic = null;
        }
    }
}
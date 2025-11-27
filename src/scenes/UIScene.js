import Phaser from 'phaser';
import { GameBalance } from '../config/GameBalance.js';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: false });

        // Track previous fuel value for warning logic
        this.prevFuel = 0;
    }

    create() {
        this.createHUD();

        // Listen to GameScene events
        const game = this.scene.get('GameScene');

        // Remove any existing listeners to prevent duplicates
        game.events.off('startUI', this.initUI, this);
        game.events.off('updateHealth', this.updateHealth, this);
        game.events.off('updateXP', this.updateXP, this);
        game.events.off('updateFuel', this.updateFuel, this);
        game.events.off('powerupActivated', this.showPowerup, this);
        game.events.off('powerupExpired', this.hidePowerup, this);

        // Add event listeners
        game.events.on('startUI', this.initUI, this);
        game.events.on('updateHealth', this.updateHealth, this);
        game.events.on('updateXP', this.updateXP, this);
        game.events.on('updateFuel', this.updateFuel, this);
        game.events.on('updateDistance', (d) => this.distanceText.setText(`${d}m`), this);
        game.events.on('updateScore', (s) => this.scoreText.setText(`${s}`), this);
        game.events.on('updateGold', (g) => this.goldText.setText(`G: ${g}`), this);
        game.events.on('powerupActivated', this.showPowerup, this);
        game.events.on('powerupExpired', this.hidePowerup, this);
    }

    shutdown() {
        // Clean up timers
        if (this.powerupCountdownTimer) {
            this.powerupCountdownTimer.remove();
            this.powerupCountdownTimer = null;
        }
        if (this.powerupRainbowTimer) {
            this.powerupRainbowTimer.remove();
            this.powerupRainbowTimer = null;
        }
        if (this.fuelWarningTimer) {
            this.fuelWarningTimer.remove();
            this.fuelWarningTimer = null;
        }

        // Clean up event listeners when scene shuts down
        const game = this.scene.get('GameScene');
        if (game) {
            game.events.off('startUI', this.initUI, this);
            game.events.off('updateHealth', this.updateHealth, this);
            game.events.off('updateXP', this.updateXP, this);
            game.events.off('updateFuel', this.updateFuel, this);
            game.events.off('powerupActivated', this.showPowerup, this);
            game.events.off('powerupExpired', this.hidePowerup, this);
        }
    }

    createHUD() {
        const w = this.scale.width;
        const h = this.scale.height;

        this.scoreText = this.add.text(10, 10, '0', { fontFamily: 'Silkscreen', fontSize: '18px' }).setDepth(100);
        this.goldText = this.add.text(w-10, 10, 'G: 0', { fontFamily: 'Silkscreen', fontSize: '18px', color: '#ffd700' }).setOrigin(1,0).setDepth(100);
        this.distanceText = this.add.text(w/2, 10, '0m', { fontFamily: 'Silkscreen', fontSize: '18px' }).setOrigin(0.5,0).setDepth(100);
        this.lvlText = this.add.text(10, h-30, 'Lvl: 1', { fontFamily: 'Silkscreen', fontSize: '18px' }).setOrigin(0,1).setDepth(100);

        // Bar backgrounds for better visibility (moved to top)
        this.hpBarBg = this.add.rectangle(10, 40, w-20, 15, 0x333333).setOrigin(0).setDepth(99);
        this.xpBarBg = this.add.rectangle(10, 65, w-20, 15, 0x333333).setOrigin(0).setDepth(99);
        this.fuelBarBg = this.add.rectangle(10, 90, w-20, 15, 0x333333).setOrigin(0).setDepth(99);

        // Bar foregrounds (start with small width instead of 0 for Safari compatibility)
        this.hpBar = this.add.rectangle(10, 40, 1, 15, 0xff0000).setOrigin(0).setDepth(100);
        this.xpBar = this.add.rectangle(10, 65, 1, 15, 0x00aaff).setOrigin(0).setDepth(100);
        this.fuelBar = this.add.rectangle(10, 90, 1, 15, 0x9932cc).setOrigin(0).setDepth(100);

        // Bar text labels
        this.hpText = this.add.text(w/2, 47.5, '', {
            fontFamily: 'Silkscreen',
            fontSize: '12px',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(101);

        this.xpText = this.add.text(w/2, 72.5, '', {
            fontFamily: 'Silkscreen',
            fontSize: '12px',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(101);

        this.fuelText = this.add.text(w/2, 97.5, '', {
            fontFamily: 'Silkscreen',
            fontSize: '12px',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(101);

        // Fuel warning (flashing red text)
        this.fuelWarning = this.add.text(w/2, 35, 'OUT OF FUEL!', {
            fontFamily: 'Silkscreen',
            fontSize: '16px',
            color: '#ff0000',
            stroke: '#000',
            strokeThickness: 4,
            backgroundColor: '#000000aa',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setDepth(103).setVisible(false);

        // Powerup indicator (moved down to give space for bars)
        this.powerupText = this.add.text(w/2, 120, '', {
            fontFamily: 'Silkscreen',
            fontSize: '18px',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 4,
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(102).setVisible(false);
    }

    initUI(stats) {
        this.lvlText.setText(`Lvl: ${stats.level}`);
        this.goldText.setText(`G: ${stats.gold}`);

        // Initialize previous fuel value for warning logic
        this.prevFuel = GameBalance.fuel.startFuel;

        this.updateHealth(stats.maxHealth, stats.maxHealth);
        this.updateXP(stats.xp, stats.reqXp);
        // Initialize fuel bar (GameScene emits updateFuel separately but we need initial state)
        const maxFuel = GameBalance.fuel.startFuel;
        this.updateFuel(maxFuel);
    }

    updateHealth(curr, max) {
        const newWidth = (this.scale.width - 20) * Math.max(0, curr/max);
        this.hpBar.width = newWidth;
        this.hpText.setText(`HP: ${Math.floor(curr)}/${max}`);
    }

    updateXP(curr, req) {
        const newWidth = (this.scale.width - 20) * Math.max(0, curr/req);
        this.xpBar.width = newWidth;
        this.xpText.setText(`XP: ${Math.floor(curr)}/${req}`);
    }

    updateFuel(fuel) {
        const maxFuel = GameBalance.fuel.startFuel;
        const newWidth = (this.scale.width - 20) * Math.max(0, fuel/maxFuel);
        this.fuelBar.width = newWidth;
        this.fuelText.setText(`Fuel: ${Math.floor(fuel)}`);

        // Show/hide fuel warning
        if (fuel <= 0 && this.prevFuel > 0) {
            // Fuel just ran out, show warning
            this.showFuelWarning();
        } else if (fuel > 0 && this.prevFuel <= 0) {
            // Fuel restored, hide warning
            this.hideFuelWarning();
        }

        this.prevFuel = fuel;
    }

    showFuelWarning() {
        this.fuelWarning.setVisible(true);

        // Clear any existing timer
        if (this.fuelWarningTimer) {
            this.fuelWarningTimer.remove();
        }

        // Flash effect (alternating visibility)
        this.fuelWarningTimer = this.time.addEvent({
            delay: 500,
            callback: () => {
                this.fuelWarning.setVisible(!this.fuelWarning.visible);
            },
            loop: true
        });
    }

    hideFuelWarning() {
        if (this.fuelWarningTimer) {
            this.fuelWarningTimer.remove();
            this.fuelWarningTimer = null;
        }
        this.fuelWarning.setVisible(false);
    }

    showWaveAnnouncement(waveNumber) {
        const w = this.scale.width;
        const h = this.scale.height;

        // Create wave announcement text
        const waveText = this.add.text(w/2, h/2, `WAVE ${waveNumber}`, {
            fontFamily: 'Silkscreen',
            fontSize: '48px',
            color: '#ffff00',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(200).setAlpha(0).setScale(0.5);

        // Animate in
        this.tweens.add({
            targets: waveText,
            alpha: 1,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        // Hold for a moment, then fade out
        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: waveText,
                alpha: 0,
                scale: 1.2,
                duration: 500,
                ease: 'Power2',
                onComplete: () => waveText.destroy()
            });
        });
    }

    showPowerup(type) {
        const names = {
            'spray': 'SPRAY SHOT',
            'damage': 'DOUBLE DAMAGE',
            'firerate': 'RAPID FIRE',
            'doublexp': 'DOUBLE XP',
            'triplescore': 'TRIPLE SCORE',
            'shield': 'SHIELD'
        };

        this.powerupType = type;
        this.powerupName = names[type];
        this.powerupTimeLeft = 15;

        // Update text with countdown
        this.powerupText.setText(`${this.powerupName} (${this.powerupTimeLeft}s)`);
        this.powerupText.setVisible(true);

        // Clear any existing timers
        if (this.powerupCountdownTimer) {
            this.powerupCountdownTimer.remove();
        }
        if (this.powerupRainbowTimer) {
            this.powerupRainbowTimer.remove();
        }

        // Start countdown timer (updates every second)
        this.powerupCountdownTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updatePowerupCountdown,
            callbackScope: this,
            loop: true
        });

        // Start rainbow color effect (changes every 100ms)
        this.powerupRainbowTimer = this.time.addEvent({
            delay: 100,
            callback: this.updateRainbowColor,
            callbackScope: this,
            loop: true
        });
    }

    updateRainbowColor() {
        // Generate random rainbow color
        const rainbowColors = [
            '#ff0000', // Red
            '#ff7f00', // Orange
            '#ffff00', // Yellow
            '#00ff00', // Green
            '#0000ff', // Blue
            '#4b0082', // Indigo
            '#9400d3', // Violet
            '#ff1493', // Pink
            '#00ffff', // Cyan
            '#ff00ff'  // Magenta
        ];

        const randomColor = Phaser.Utils.Array.GetRandom(rainbowColors);
        this.powerupText.setColor(randomColor);
    }

    updatePowerupCountdown() {
        this.powerupTimeLeft--;

        if (this.powerupTimeLeft > 0) {
            this.powerupText.setText(`${this.powerupName} (${this.powerupTimeLeft}s)`);
        } else {
            // Time's up, this will be called right before hidePowerup
            this.powerupText.setText(`${this.powerupName} (0s)`);
        }
    }

    hidePowerup() {
        // Stop countdown timer
        if (this.powerupCountdownTimer) {
            this.powerupCountdownTimer.remove();
            this.powerupCountdownTimer = null;
        }

        // Stop rainbow timer
        if (this.powerupRainbowTimer) {
            this.powerupRainbowTimer.remove();
            this.powerupRainbowTimer = null;
        }

        this.powerupText.setVisible(false);
    }

    showLevelUp(stats, onResume) {
        const w = this.scale.width, h = this.scale.height;
        const con = this.add.container(0, 0).setDepth(200);

        // Background with fade-in effect
        const bg = this.add.rectangle(w/2, h/2, w, h, 0x000000, 0);
        con.add(bg);
        this.tweens.add({
            targets: bg,
            alpha: 0.95,
            duration: 300,
            ease: 'Power2'
        });

        // Animated particle burst
        this.createLevelUpParticles(w/2, h/2 - 150);

        // Title with scale animation
        const title = this.add.text(w/2, h/2-150, 'LEVEL UP!', {
            fontFamily: 'Silkscreen',
            fontSize: '48px',
            color: '#ffff00',
            stroke: '#ff8800',
            strokeThickness: 4
        }).setOrigin(0.5).setScale(0);
        con.add(title);

        this.tweens.add({
            targets: title,
            scale: 1,
            duration: 400,
            ease: 'Back.easeOut',
            delay: 100
        });

        // Pulsing glow effect on title
        this.tweens.add({
            targets: title,
            scale: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 500
        });

        // Level number with glow box
        const levelBox = this.add.rectangle(w/2, h/2-90, 200, 45, 0x1a1a3e).setStrokeStyle(3, 0x00ffff);
        const levelText = this.add.text(w/2, h/2-90, `LEVEL ${stats.level}`, {
            fontFamily: 'Silkscreen',
            fontSize: '28px',
            color: '#00ffff',
            stroke: '#003366',
            strokeThickness: 3
        }).setOrigin(0.5).setAlpha(0);
        con.add([levelBox, levelText]);

        this.tweens.add({
            targets: [levelBox, levelText],
            alpha: 1,
            duration: 300,
            delay: 300
        });

        // Stats container with border
        const statsBoxBg = this.add.rectangle(w/2, h/2+10, 360, 170, 0x0a0a1a).setStrokeStyle(2, 0x00ff88);
        con.add(statsBoxBg);

        // Stat increase items with staggered animation
        const statItems = [
            { label: 'HEALTH', value: stats.maxHealth, increase: GameBalance.levelUp.healthIncrease, color: '#ff4444', icon: '+' },
            { label: 'SPEED', value: stats.moveSpeed, increase: GameBalance.levelUp.speedIncrease, color: '#44ff44', icon: '+' },
            { label: 'FIRE RATE', value: `${stats.fireRateMs}ms`, increase: `-${GameBalance.levelUp.fireRateDecrease}ms`, color: '#ffaa00', icon: '' },
            { label: 'DAMAGE', value: `x${stats.damageMult.toFixed(2)}`, increase: `+${GameBalance.levelUp.damageIncrease}`, color: '#ff00ff', icon: '+' }
        ];

        statItems.forEach((stat, index) => {
            const yPos = h/2 - 50 + (index * 38);

            const statText = this.add.text(w/2 - 170, yPos, stat.label, {
                fontFamily: 'Silkscreen',
                fontSize: '16px',
                color: '#aaaaaa'
            }).setOrigin(0, 0.5).setAlpha(0);

            const valueText = this.add.text(w/2 + 20, yPos, `${stat.value}`, {
                fontFamily: 'Silkscreen',
                fontSize: '18px',
                color: stat.color
            }).setOrigin(0, 0.5).setAlpha(0);

            const increaseText = this.add.text(w/2 + 100, yPos, `(${stat.icon}${stat.increase})`, {
                fontFamily: 'Silkscreen',
                fontSize: '14px',
                color: '#00ff00'
            }).setOrigin(0, 0.5).setAlpha(0);

            con.add([statText, valueText, increaseText]);

            // Staggered fade-in
            this.tweens.add({
                targets: [statText, valueText, increaseText],
                alpha: 1,
                x: '+=10',
                duration: 300,
                delay: 500 + (index * 100),
                ease: 'Power2'
            });
        });

        // Continue button with hover effect
        const btn = this.add.rectangle(w/2, h/2+130, 220, 55, 0x00ff00).setInteractive().setAlpha(0);
        const btnTxt = this.add.text(w/2, h/2+130, 'CONTINUE', {
            fontFamily: 'Silkscreen',
            color: '#000000',
            fontSize: '22px'
        }).setOrigin(0.5).setAlpha(0);
        con.add([btn, btnTxt]);

        this.tweens.add({
            targets: [btn, btnTxt],
            alpha: 1,
            duration: 300,
            delay: 900
        });

        btn.on('pointerover', () => {
            this.tweens.add({ targets: btn, scaleX: 1.1, scaleY: 1.1, duration: 100 });
            btn.setFillStyle(0x00ff88);
        });

        btn.on('pointerout', () => {
            this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 });
            btn.setFillStyle(0x00ff00);
        });

        btn.on('pointerdown', () => {
            // Fade out animation
            this.tweens.add({
                targets: con,
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    con.destroy();
                    onResume();
                }
            });
        });

        // Save & Exit button
        const exitBtn = this.add.rectangle(w/2, h/2+200, 220, 55, 0xff9900).setInteractive().setAlpha(0);
        const exitTxt = this.add.text(w/2, h/2+200, 'SAVE & EXIT', {
            fontFamily: 'Silkscreen',
            color: '#000000',
            fontSize: '18px'
        }).setOrigin(0.5).setAlpha(0);
        con.add([exitBtn, exitTxt]);

        this.tweens.add({
            targets: [exitBtn, exitTxt],
            alpha: 1,
            duration: 300,
            delay: 1000
        });

        exitBtn.on('pointerover', () => {
            this.tweens.add({ targets: exitBtn, scaleX: 1.1, scaleY: 1.1, duration: 100 });
            exitBtn.setFillStyle(0xffaa00);
        });

        exitBtn.on('pointerout', () => {
            this.tweens.add({ targets: exitBtn, scaleX: 1, scaleY: 1, duration: 100 });
            exitBtn.setFillStyle(0xff9900);
        });

        exitBtn.on('pointerdown', () => {
            this.tweens.add({
                targets: con,
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    con.destroy();
                    this.scene.stop('UIScene');
                    this.scene.stop('GameScene');
                    this.scene.start('TitleScene');
                }
            });
        });
    }

    createLevelUpParticles(x, y) {
        // Create particle burst effect
        const colors = [0xffff00, 0xff8800, 0xff00ff, 0x00ffff, 0x00ff00];

        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 / 20) * i;
            const distance = 80;
            const particle = this.add.circle(x, y, 4, Phaser.Utils.Array.GetRandom(colors), 1).setDepth(201);

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0,
                duration: 600,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }

    showGameOver(finalScore, isNewHighScore = false) {
        const w = this.scale.width, h = this.scale.height;
        this.add.rectangle(w/2, h/2, w, h, 0x000000, 0.9);
        this.add.text(w/2, h/2-80, 'GAME OVER', { fontFamily: 'Silkscreen', fontSize: '40px', color: 'red' }).setOrigin(0.5);

        // Show "NEW HIGH SCORE!" if applicable
        if (isNewHighScore) {
            this.add.text(w/2, h/2-30, 'NEW HIGH SCORE!', { fontFamily: 'Silkscreen', fontSize: '28px', color: '#ffff00' }).setOrigin(0.5);
        }

        this.add.text(w/2, h/2+20, `${finalScore}`, { fontFamily: 'Silkscreen', fontSize: '24px' }).setOrigin(0.5);

        // Retry button
        const retryBtn = this.add.rectangle(w/2, h/2+100, 200, 50, 0x00ff00).setInteractive();
        const retryTxt = this.add.text(w/2, h/2+100, 'RETRY', { fontFamily: 'Silkscreen', color: 'black', fontSize: '20px' }).setOrigin(0.5);

        retryBtn.on('pointerdown', () => {
            this.scene.stop('UIScene');
            this.scene.stop('GameScene');
            this.scene.start('GameScene');
            this.scene.start('UIScene');
        });

        // Main menu button
        const menuBtn = this.add.rectangle(w/2, h/2+170, 200, 50, 0xffffff).setInteractive();
        const menuTxt = this.add.text(w/2, h/2+170, 'MAIN MENU', { fontFamily: 'Silkscreen', color: 'black', fontSize: '20px' }).setOrigin(0.5);

        menuBtn.on('pointerdown', () => {
            // Full page reload to cleanly reset all scenes and managers
            window.location.reload();
        });
    }
}
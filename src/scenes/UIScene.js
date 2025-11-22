import Phaser from 'phaser';
import { GameBalance } from '../config/GameBalance.js';

export default class UIScene extends Phaser.Scene {
    constructor() { super({ key: 'UIScene', active: false }); }

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
        this.updateHealth(stats.maxHealth, stats.maxHealth);
        this.updateXP(stats.xp, stats.reqXp);
        // Initialize fuel bar (GameScene emits updateFuel separately but we need initial state)
        const maxFuel = GameBalance.fuel.startFuel;
        this.updateFuel(maxFuel);
    }

    updateHealth(curr, max) {
        this.hpBar.width = (this.scale.width - 20) * Math.max(0, curr/max);
        this.hpText.setText(`HP: ${Math.floor(curr)}/${max}`);
    }

    updateXP(curr, req) {
        this.xpBar.width = (this.scale.width - 20) * Math.max(0, curr/req);
        this.xpText.setText(`XP: ${Math.floor(curr)}/${req}`);
    }

    updateFuel(fuel) {
        const maxFuel = GameBalance.fuel.startFuel;
        this.fuelBar.width = (this.scale.width - 20) * Math.max(0, fuel/maxFuel);
        this.fuelText.setText(`Fuel: ${Math.floor(fuel)}`);
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
        const colors = {
            'spray': '#00ff00',
            'damage': '#ff0000',
            'firerate': '#ffff00',
            'doublexp': '#00ffff',
            'triplescore': '#ff00ff',
            'shield': '#ffffff'
        };

        this.powerupType = type;
        this.powerupName = names[type];
        this.powerupColor = colors[type];
        this.powerupTimeLeft = 15;

        // Update text with countdown
        this.powerupText.setText(`${this.powerupName} (${this.powerupTimeLeft}s)`);
        this.powerupText.setColor(this.powerupColor);
        this.powerupText.setVisible(true);

        // Clear any existing countdown timer
        if (this.powerupCountdownTimer) {
            this.powerupCountdownTimer.remove();
        }

        // Start countdown timer (updates every second)
        this.powerupCountdownTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updatePowerupCountdown,
            callbackScope: this,
            loop: true
        });
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

        this.powerupText.setVisible(false);
    }

    showLevelUp(stats, onResume) {
        const w = this.scale.width, h = this.scale.height;
        const con = this.add.container(0,0);

        const bg = this.add.rectangle(w/2, h/2, w, h, 0x000000, 0.9);
        const title = this.add.text(w/2, h/2-150, 'LEVEL UP!', { fontFamily: 'Silkscreen', fontSize: '40px', color: '#ff0' }).setOrigin(0.5);

        const levelText = this.add.text(w/2, h/2-90, `Level ${stats.level}`, { fontFamily: 'Silkscreen', fontSize: '24px', color: '#0ff' }).setOrigin(0.5);

        const info = this.add.text(w/2, h/2-20,
            `Stats Increased:\n` +
            `Health: ${stats.maxHealth} (+${GameBalance.levelUp.healthIncrease})\n` +
            `Speed: ${stats.moveSpeed} (+${GameBalance.levelUp.speedIncrease})\n` +
            `Fire Rate: ${stats.fireRateMs}ms (-${GameBalance.levelUp.fireRateDecrease}ms)\n` +
            `Damage: x${stats.damageMult.toFixed(2)} (+${GameBalance.levelUp.damageIncrease})`,
            { fontFamily: 'Silkscreen', fontSize: '20px', align: 'center', lineSpacing: 5, color: '#0f0' }
        ).setOrigin(0.5);

        const btn = this.add.rectangle(w/2, h/2+130, 200, 50, 0x00ff00).setInteractive();
        const btnTxt = this.add.text(w/2, h/2+130, 'CONTINUE', { fontFamily: 'Silkscreen', color: 'black', fontSize: '20px' }).setOrigin(0.5);

        btn.on('pointerdown', () => {
            con.destroy();
            onResume();
        });

        // Save & Exit button
        const exitBtn = this.add.rectangle(w/2, h/2+200, 200, 50, 0xff9900).setInteractive();
        const exitTxt = this.add.text(w/2, h/2+200, 'SAVE & EXIT RUN', { fontFamily: 'Silkscreen', color: 'black', fontSize: '18px' }).setOrigin(0.5);

        exitBtn.on('pointerdown', () => {
            con.destroy();
            // Stats already saved in levelUp(), just exit to title
            this.scene.stop('UIScene');
            this.scene.stop('GameScene');
            this.scene.start('TitleScene');
        });

        con.add([bg, title, levelText, info, btn, btnTxt, exitBtn, exitTxt]);
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
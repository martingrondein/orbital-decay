import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem.js';
import { GameBalance } from '../config/GameBalance.js';

export default class ShopScene extends Phaser.Scene {
    constructor() { super({ key: 'ShopScene' }); }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Load player stats
        this.stats = SaveSystem.load();

        // Title
        this.add.text(w/2, 40, 'SHOP', {
            fontFamily: 'PixelifySans',
            fontSize: '36px',
            color: '#ffd700',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Display current gold
        this.goldText = this.add.text(w/2, 90, `Gold: ${this.stats.gold}`, {
            fontFamily: 'PixelifySans',
            fontSize: '24px',
            color: '#ffd700'
        }).setOrigin(0.5);

        // Create shop items
        const startY = 140;
        const itemSpacing = 90;

        // 1. Gold Value Upgrade
        this.createShopItem(w/2, startY,
            'Gold Value +1',
            `Cost: ${GameBalance.shop.goldValueUpgrade}g`,
            `Current: x${this.stats.goldMultiplier}`,
            () => this.purchaseGoldValue()
        );

        // 2. Health Upgrade
        this.createShopItem(w/2, startY + itemSpacing,
            `+${GameBalance.shop.healthUpgradeAmount} Max Health`,
            `Cost: ${GameBalance.shop.healthUpgrade}g`,
            `Current: ${this.stats.maxHealth}`,
            () => this.purchaseHealth()
        );

        // 3. Fire Rate Upgrade
        this.createShopItem(w/2, startY + itemSpacing * 2,
            `+${GameBalance.shop.fireRateUpgradeAmount} Faster Firing`,
            `Cost: ${GameBalance.shop.fireRateUpgrade}g`,
            `Current: ${this.stats.fireRateMs}ms`,
            () => this.purchaseFireRate()
        );

        // 4. Fuel Upgrade
        this.createShopItem(w/2, startY + itemSpacing * 3,
            `+${GameBalance.shop.fuelUpgradeAmount} Max Fuel`,
            `Cost: ${GameBalance.shop.fuelUpgrade}g`,
            `Current: ${this.stats.maxFuel}`,
            () => this.purchaseFuel()
        );

        // 5. Magnetic Range Upgrade
        this.createShopItem(w/2, startY + itemSpacing * 4,
            `+${GameBalance.shop.magneticUpgradeAmount} Magnetic Range`,
            `Cost: ${GameBalance.shop.magneticUpgrade}g`,
            `Current: ${this.stats.magneticRange}`,
            () => this.purchaseMagnetic()
        );

        // 6. Extra Shooter
        const extraShooterStatus = this.stats.hasExtraShooter ? 'OWNED' : 'Not owned';
        this.createShopItem(w/2, startY + itemSpacing * 5,
            'Extra Shooter',
            `Cost: ${GameBalance.shop.extraShooter}g`,
            extraShooterStatus,
            () => this.purchaseExtraShooter(),
            this.stats.hasExtraShooter
        );

        // 7. Revive
        const reviveStatus = this.stats.hasRevive ? 'OWNED' : 'Not owned';
        this.createShopItem(w/2, startY + itemSpacing * 6,
            'Revive (Once per run)',
            `Cost: ${GameBalance.shop.revive}g`,
            reviveStatus,
            () => this.purchaseRevive(),
            this.stats.hasRevive
        );

        // Back button
        const backBtn = this.add.rectangle(w/2, h - 60, 200, 50, 0xff3333).setInteractive();
        const backTxt = this.add.text(w/2, h - 60, 'BACK', {
            fontFamily: 'PixelifySans',
            fontSize: '24px',
            color: 'black'
        }).setOrigin(0.5);

        backBtn.on('pointerdown', () => {
            this.scene.start('TitleScene');
        });
    }

    createShopItem(x, y, name, cost, status, onPurchase, isOwned = false) {
        // Container background
        const bg = this.add.rectangle(x, y, 350, 75, 0x222222).setStrokeStyle(2, 0x444444);

        // Item name
        this.add.text(x - 165, y - 25, name, {
            fontFamily: 'PixelifySans',
            fontSize: '18px',
            color: '#ffffff'
        });

        // Cost
        this.add.text(x - 165, y, cost, {
            fontFamily: 'PixelifySans',
            fontSize: '16px',
            color: '#ffd700'
        });

        // Status/Current value
        this.add.text(x - 165, y + 22, status, {
            fontFamily: 'PixelifySans',
            fontSize: '14px',
            color: '#aaaaaa'
        });

        // Buy button
        if (!isOwned) {
            const buyBtn = this.add.rectangle(x + 130, y, 70, 50, 0x00ff00).setInteractive();
            const buyTxt = this.add.text(x + 130, y, 'BUY', {
                fontFamily: 'PixelifySans',
                fontSize: '18px',
                color: 'black'
            }).setOrigin(0.5);

            buyBtn.on('pointerdown', () => {
                onPurchase();
            });
        } else {
            // Show owned badge
            this.add.rectangle(x + 130, y, 70, 50, 0x666666);
            this.add.text(x + 130, y, 'OWNED', {
                fontFamily: 'PixelifySans',
                fontSize: '14px',
                color: 'white'
            }).setOrigin(0.5);
        }
    }

    purchaseGoldValue() {
        if (this.stats.gold >= GameBalance.shop.goldValueUpgrade) {
            this.stats.gold -= GameBalance.shop.goldValueUpgrade;
            this.stats.goldMultiplier += 1;
            SaveSystem.save(this.stats);
            this.scene.restart();
        } else {
            this.showInsufficientFunds();
        }
    }

    purchaseHealth() {
        if (this.stats.gold >= GameBalance.shop.healthUpgrade) {
            this.stats.gold -= GameBalance.shop.healthUpgrade;
            this.stats.maxHealth += GameBalance.shop.healthUpgradeAmount;
            SaveSystem.save(this.stats);
            this.scene.restart();
        } else {
            this.showInsufficientFunds();
        }
    }

    purchaseFireRate() {
        if (this.stats.gold >= GameBalance.shop.fireRateUpgrade) {
            if (this.stats.fireRateMs <= GameBalance.levelUp.fireRateMin) {
                this.showMessage('Fire rate already at minimum!');
                return;
            }
            this.stats.gold -= GameBalance.shop.fireRateUpgrade;
            this.stats.fireRateMs = Math.max(
                GameBalance.levelUp.fireRateMin,
                this.stats.fireRateMs - GameBalance.shop.fireRateUpgradeAmount
            );
            SaveSystem.save(this.stats);
            this.scene.restart();
        } else {
            this.showInsufficientFunds();
        }
    }

    purchaseFuel() {
        if (this.stats.gold >= GameBalance.shop.fuelUpgrade) {
            this.stats.gold -= GameBalance.shop.fuelUpgrade;
            this.stats.maxFuel += GameBalance.shop.fuelUpgradeAmount;
            SaveSystem.save(this.stats);
            this.scene.restart();
        } else {
            this.showInsufficientFunds();
        }
    }

    purchaseMagnetic() {
        if (this.stats.gold >= GameBalance.shop.magneticUpgrade) {
            this.stats.gold -= GameBalance.shop.magneticUpgrade;
            this.stats.magneticRange += GameBalance.shop.magneticUpgradeAmount;
            SaveSystem.save(this.stats);
            this.scene.restart();
        } else {
            this.showInsufficientFunds();
        }
    }

    purchaseExtraShooter() {
        if (this.stats.hasExtraShooter) {
            this.showMessage('Already owned!');
            return;
        }
        if (this.stats.gold >= GameBalance.shop.extraShooter) {
            this.stats.gold -= GameBalance.shop.extraShooter;
            this.stats.hasExtraShooter = true;
            SaveSystem.save(this.stats);
            this.scene.restart();
        } else {
            this.showInsufficientFunds();
        }
    }

    purchaseRevive() {
        if (this.stats.hasRevive) {
            this.showMessage('Already owned!');
            return;
        }
        if (this.stats.gold >= GameBalance.shop.revive) {
            this.stats.gold -= GameBalance.shop.revive;
            this.stats.hasRevive = true;
            SaveSystem.save(this.stats);
            this.scene.restart();
        } else {
            this.showInsufficientFunds();
        }
    }

    showInsufficientFunds() {
        this.showMessage('Insufficient gold!');
    }

    showMessage(text) {
        const w = this.scale.width;
        const msg = this.add.text(w/2, 100, text, {
            fontFamily: 'PixelifySans',
            fontSize: '20px',
            color: '#ff0000',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => msg.destroy());
    }
}

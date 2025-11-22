import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem.js';
import { GameBalance } from '../config/GameBalance.js';
import { AudioEngine } from '../systems/AudioEngine.js';

export default class ShopScene extends Phaser.Scene {
    constructor() { super({ key: 'ShopScene' }); }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Initialize audio
        AudioEngine.init(this);

        // Load player stats
        this.stats = SaveSystem.load();

        // Title
        this.add.text(w/2, 40, 'SHOP', {
            fontFamily: 'Silkscreen',
            fontSize: '36px',
            color: '#ffd700',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Display current gold
        this.goldText = this.add.text(w/2, 90, `Gold: ${this.stats.gold}`, {
            fontFamily: 'Silkscreen',
            fontSize: '24px',
            color: '#ffd700'
        }).setOrigin(0.5);

        // Create scrollable container for shop items
        this.scrollContainer = this.add.container(0, 0);

        // Scroll parameters
        this.scrollY = 0;
        this.maxScrollY = 0;
        this.scrollSpeed = 30;

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

        // 6. XP Gain Upgrade
        this.createShopItem(w/2, startY + itemSpacing * 5,
            `+${GameBalance.shop.xpGainUpgradeAmount} XP per Pickup`,
            `Cost: ${GameBalance.shop.xpGainUpgrade}g`,
            `Current: ${this.stats.xpGain || GameBalance.progression.xpPerPickup}`,
            () => this.purchaseXPGain()
        );

        // 7. Damage Upgrade
        this.createShopItem(w/2, startY + itemSpacing * 6,
            `+${GameBalance.shop.damageUpgradeAmount.toFixed(1)} Damage`,
            `Cost: ${GameBalance.shop.damageUpgrade}g`,
            `Current: x${this.stats.damageMult.toFixed(2)}`,
            () => this.purchaseDamage()
        );

        // 8. Extra Shooter
        const extraShooterStatus = this.stats.hasExtraShooter ? 'OWNED' : 'Not owned';
        this.createShopItem(w/2, startY + itemSpacing * 7,
            'Extra Shooter',
            `Cost: ${GameBalance.shop.extraShooter}g`,
            extraShooterStatus,
            () => this.purchaseExtraShooter(),
            this.stats.hasExtraShooter
        );

        // 9. Revive
        const reviveStatus = this.stats.hasRevive ? 'OWNED' : 'Not owned';
        this.createShopItem(w/2, startY + itemSpacing * 8,
            'Revive (Once per run)',
            `Cost: ${GameBalance.shop.revive}g`,
            reviveStatus,
            () => this.purchaseRevive(),
            this.stats.hasRevive
        );

        // Calculate max scroll based on content
        const totalContentHeight = startY + (itemSpacing * 9);
        const visibleHeight = h - 140 - 80; // Space between header and back button
        this.maxScrollY = Math.max(0, totalContentHeight - visibleHeight - startY);

        // Create mask for scrollable area
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(0, 120, w, visibleHeight + 20);
        const mask = maskShape.createGeometryMask();
        this.scrollContainer.setMask(mask);

        // Mouse wheel scrolling
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            this.scroll(deltaY > 0 ? 1 : -1);
        });

        // Touch/drag scrolling
        this.isDragging = false;
        this.lastPointerY = 0;

        this.input.on('pointerdown', (pointer) => {
            if (pointer.y > 120 && pointer.y < h - 80) {
                this.isDragging = true;
                this.lastPointerY = pointer.y;
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                const deltaY = pointer.y - this.lastPointerY;
                this.scroll(deltaY > 0 ? -1 : 1, Math.abs(deltaY) * 0.5);
                this.lastPointerY = pointer.y;
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        // Draw scroll bar background
        this.scrollBarBg = this.add.rectangle(w - 10, 140, 8, visibleHeight, 0x333333).setOrigin(0.5, 0);

        // Draw scroll bar handle
        const scrollBarHeight = Math.max(30, (visibleHeight / (totalContentHeight - startY)) * visibleHeight);
        this.scrollBarHandle = this.add.rectangle(w - 10, 140, 8, scrollBarHeight, 0x00ff00).setOrigin(0.5, 0);

        // Back button
        const backBtn = this.add.rectangle(w/2, h - 60, 200, 50, 0xff3333).setInteractive();
        const backTxt = this.add.text(w/2, h - 60, 'BACK', {
            fontFamily: 'Silkscreen',
            fontSize: '24px',
            color: 'black'
        }).setOrigin(0.5);

        backBtn.on('pointerdown', () => {
            this.scene.start('TitleScene');
        });
    }

    scroll(direction, amount = this.scrollSpeed) {
        this.scrollY += direction * amount;
        this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, this.maxScrollY);

        // Update container position
        this.scrollContainer.y = -this.scrollY;

        // Update scroll bar handle position
        if (this.maxScrollY > 0) {
            const scrollPercent = this.scrollY / this.maxScrollY;
            const maxHandleY = this.scrollBarBg.height - this.scrollBarHandle.height;
            this.scrollBarHandle.y = 140 + (scrollPercent * maxHandleY);
        }
    }

    createShopItem(x, y, name, cost, status, onPurchase, isOwned = false) {
        // Container background
        const bg = this.add.rectangle(x, y, 350, 75, 0x222222).setStrokeStyle(2, 0x444444);
        this.scrollContainer.add(bg);

        // Item name
        const nameText = this.add.text(x - 165, y - 25, name, {
            fontFamily: 'Silkscreen',
            fontSize: '18px',
            color: '#ffffff'
        });
        this.scrollContainer.add(nameText);

        // Cost
        const costText = this.add.text(x - 165, y, cost, {
            fontFamily: 'Silkscreen',
            fontSize: '16px',
            color: '#ffd700'
        });
        this.scrollContainer.add(costText);

        // Status/Current value
        const statusText = this.add.text(x - 165, y + 22, status, {
            fontFamily: 'Silkscreen',
            fontSize: '14px',
            color: '#aaaaaa'
        });
        this.scrollContainer.add(statusText);

        // Buy button
        if (!isOwned) {
            const buyBtn = this.add.rectangle(x + 130, y, 70, 50, 0x00ff00).setInteractive();
            const buyTxt = this.add.text(x + 130, y, 'BUY', {
                fontFamily: 'Silkscreen',
                fontSize: '18px',
                color: 'black'
            }).setOrigin(0.5);

            this.scrollContainer.add(buyBtn);
            this.scrollContainer.add(buyTxt);

            buyBtn.on('pointerdown', () => {
                onPurchase();
            });
        } else {
            // Show owned badge
            const ownedBg = this.add.rectangle(x + 130, y, 70, 50, 0x666666);
            const ownedText = this.add.text(x + 130, y, 'OWNED', {
                fontFamily: 'Silkscreen',
                fontSize: '14px',
                color: 'white'
            }).setOrigin(0.5);

            this.scrollContainer.add(ownedBg);
            this.scrollContainer.add(ownedText);
        }
    }

    purchaseGoldValue() {
        if (this.stats.gold >= GameBalance.shop.goldValueUpgrade) {
            AudioEngine.play('spend');
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
            AudioEngine.play('spend');
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
            AudioEngine.play('spend');
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
            AudioEngine.play('spend');
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
            AudioEngine.play('spend');
            this.stats.gold -= GameBalance.shop.magneticUpgrade;
            this.stats.magneticRange += GameBalance.shop.magneticUpgradeAmount;
            SaveSystem.save(this.stats);
            this.scene.restart();
        } else {
            this.showInsufficientFunds();
        }
    }

    purchaseXPGain() {
        if (this.stats.gold >= GameBalance.shop.xpGainUpgrade) {
            AudioEngine.play('spend');
            this.stats.gold -= GameBalance.shop.xpGainUpgrade;
            this.stats.xpGain = (this.stats.xpGain || GameBalance.progression.xpPerPickup) + GameBalance.shop.xpGainUpgradeAmount;
            SaveSystem.save(this.stats);
            this.scene.restart();
        } else {
            this.showInsufficientFunds();
        }
    }

    purchaseDamage() {
        if (this.stats.gold >= GameBalance.shop.damageUpgrade) {
            AudioEngine.play('spend');
            this.stats.gold -= GameBalance.shop.damageUpgrade;
            this.stats.damageMult += GameBalance.shop.damageUpgradeAmount;
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
            AudioEngine.play('spend');
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
            AudioEngine.play('spend');
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
            fontFamily: 'Silkscreen',
            fontSize: '20px',
            color: '#ff0000',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => msg.destroy());
    }
}

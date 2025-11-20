import { GameBalance } from '../config/GameBalance.js';

export default class UIScene extends Phaser.Scene {
    constructor() { super({ key: 'UIScene', active: false }); }

    create() {
        // Listen to GameScene events
        const game = this.scene.get('GameScene');
        game.events.on('startUI', this.initUI, this);
        game.events.on('updateHealth', this.updateHealth, this);
        game.events.on('updateXP', this.updateXP, this);
        game.events.on('updateScore', (s) => this.scoreText.setText(`Score: ${s}`), this);

        this.createHUD();
    }

    createHUD() {
        const w = this.scale.width;
        const h = this.scale.height;
        this.hpBar = this.add.rectangle(10, h - 62, w-20, 15, 0xff0000).setOrigin(0);
        this.xpBar = this.add.rectangle(10, h - 37, 0, 15, 0x00aaff).setOrigin(0);
        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px' });
        this.lvlText = this.add.text(w-10, 10, 'Lvl: 1', { fontSize: '20px' }).setOrigin(1,0);
    }

    initUI(stats) {
        this.lvlText.setText(`Lvl: ${stats.level}`);
        this.updateHealth(stats.maxHealth, stats.maxHealth);
        this.updateXP(stats.xp, stats.reqXp);
    }

    updateHealth(curr, max) {
        this.hpBar.width = (this.scale.width - 20) * Math.max(0, curr/max);
    }

    updateXP(curr, req) {
        this.xpBar.width = (this.scale.width - 20) * Math.max(0, curr/req);
    }

    showLevelUp(stats, onResume) {
        const w = this.scale.width, h = this.scale.height;
        const con = this.add.container(0,0);

        const bg = this.add.rectangle(w/2, h/2, w, h, 0x000000, 0.9);
        const title = this.add.text(w/2, h/2-150, 'LEVEL UP!', { fontSize: '40px', color: '#ff0' }).setOrigin(0.5);

        const levelText = this.add.text(w/2, h/2-90, `Level ${stats.level}`, { fontSize: '24px', color: '#0ff' }).setOrigin(0.5);

        const info = this.add.text(w/2, h/2-20,
            `Stats Increased:\n` +
            `Health: ${stats.maxHealth} (+${GameBalance.levelUp.healthIncrease})\n` +
            `Speed: ${stats.moveSpeed} (+${GameBalance.levelUp.speedIncrease})\n` +
            `Fire Rate: ${stats.fireRateMs}ms (-${GameBalance.levelUp.fireRateDecrease}ms)\n` +
            `Damage: x${stats.damageMult.toFixed(1)} (+${GameBalance.levelUp.damageIncrease})`,
            { fontSize: '20px', align: 'center', lineSpacing: 5, color: '#0f0' }
        ).setOrigin(0.5);

        const btn = this.add.rectangle(w/2, h/2+130, 200, 50, 0x00ff00).setInteractive();
        const btnTxt = this.add.text(w/2, h/2+130, 'CONTINUE', { color: 'black', fontSize: '20px' }).setOrigin(0.5);

        btn.on('pointerdown', () => {
            con.destroy();
            onResume();
        });

        con.add([bg, title, levelText, info, btn, btnTxt]);
    }

    showGameOver(finalScore) {
        const w = this.scale.width, h = this.scale.height;
        this.add.rectangle(w/2, h/2, w, h, 0x000000, 0.9);
        this.add.text(w/2, h/2-50, 'GAME OVER', { fontSize: '40px', color: 'red' }).setOrigin(0.5);
        this.add.text(w/2, h/2+20, `Score: ${finalScore}`, { fontSize: '24px' }).setOrigin(0.5);

        // Retry button
        const retryBtn = this.add.rectangle(w/2, h/2+100, 200, 50, 0x00ff00).setInteractive();
        const retryTxt = this.add.text(w/2, h/2+100, 'RETRY', { color: 'black', fontSize: '20px' }).setOrigin(0.5);

        retryBtn.on('pointerdown', () => {
            this.scene.stop('UIScene');
            this.scene.stop('GameScene');
            this.scene.start('GameScene');
            this.scene.start('UIScene');
        });

        // Main menu button
        const menuBtn = this.add.rectangle(w/2, h/2+170, 200, 50, 0xffffff).setInteractive();
        const menuTxt = this.add.text(w/2, h/2+170, 'MAIN MENU', { color: 'black', fontSize: '20px' }).setOrigin(0.5);

        menuBtn.on('pointerdown', () => {
            // Full page reload to cleanly reset all scenes and managers
            window.location.reload();
        });
    }
}
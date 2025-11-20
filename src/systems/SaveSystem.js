import { GameBalance } from '../config/GameBalance.js';

const KEY = 'SHMUP_SAVE_V1';

const defaultStats = {
    level: GameBalance.player.startLevel,
    xp: GameBalance.player.startXP,
    reqXp: GameBalance.player.startReqXP,
    moveSpeed: GameBalance.player.startMoveSpeed,
    fireRateMs: GameBalance.player.startFireRateMs,
    maxHealth: GameBalance.player.startMaxHealth,
    damageMult: GameBalance.player.startDamageMult,
    xpMult: GameBalance.player.startXPMult
};

export const SaveSystem = {
    load() {
        const data = localStorage.getItem(KEY);
        return data ? JSON.parse(data) : { ...defaultStats };
    },

    save(stats) {
        // Clean transient data before saving
        const toSave = {
            level: stats.level,
            xp: stats.xp,
            reqXp: stats.reqXp,
            moveSpeed: stats.moveSpeed,
            fireRateMs: stats.fireRateMs,
            maxHealth: stats.maxHealth,
            damageMult: stats.damageMult,
            xpMult: stats.xpMult
        };
        localStorage.setItem(KEY, JSON.stringify(toSave));
    },

    reset() {
        localStorage.removeItem(KEY);
        return { ...defaultStats };
    }
};
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
    },

    // Calculate stats for a given level
    calculateStatsForLevel(targetLevel) {
        if (targetLevel <= 1) return { ...defaultStats };

        const levelsToGain = targetLevel - 1;
        const stats = { ...defaultStats };

        stats.level = targetLevel;
        stats.xp = 0;
        stats.maxHealth += levelsToGain * GameBalance.levelUp.healthIncrease;
        stats.moveSpeed += levelsToGain * GameBalance.levelUp.speedIncrease;
        stats.fireRateMs = Math.max(
            GameBalance.levelUp.fireRateMin,
            stats.fireRateMs - (levelsToGain * GameBalance.levelUp.fireRateDecrease)
        );
        stats.damageMult += levelsToGain * GameBalance.levelUp.damageIncrease;

        // Calculate required XP for next level
        for (let i = 0; i < levelsToGain; i++) {
            stats.reqXp = Math.floor(stats.reqXp * GameBalance.levelUp.xpRequirementMultiplier);
        }

        return stats;
    }
};
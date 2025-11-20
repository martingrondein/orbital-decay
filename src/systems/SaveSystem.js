const KEY = 'SHMUP_SAVE_V1';

const defaultStats = {
    level: 1,
    xp: 0,
    reqXp: 50,
    moveSpeed: 400,
    fireRateMs: 200,
    maxHealth: 100,
    damageMult: 1,
    xpMult: 1
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
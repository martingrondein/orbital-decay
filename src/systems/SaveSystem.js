import { GameBalance } from '../config/GameBalance.js';

const KEY = 'SHMUP_SAVE_V1';
const HIGH_SCORE_KEY = 'SHMUP_HIGH_SCORE';
const BEST_DISTANCE_KEY = 'SHMUP_BEST_DISTANCE';

// Secret salt for checksum (obfuscated - will be in compiled code but harder to find)
const SALT = 'OrbitalDecay_8f3a9c2e1b4d7f6a';

// Simple hash function for data integrity verification
function computeHash(data) {
    const str = JSON.stringify(data) + SALT;
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36); // Base36 encoding for shorter string
}

// Verify data integrity
function verifyData(stored) {
    if (!stored || typeof stored !== 'object' || !stored.data || !stored.checksum) {
        return null; // Invalid format
    }
    const expectedHash = computeHash(stored.data);
    if (expectedHash !== stored.checksum) {
        console.warn('Data integrity check failed - data may have been tampered with');
        return null; // Checksum mismatch - data was tampered
    }
    return stored.data;
}

// Wrap data with checksum
function wrapData(data) {
    return {
        data: data,
        checksum: computeHash(data)
    };
}

const defaultStats = {
    level: GameBalance.player.startLevel,
    xp: GameBalance.player.startXP,
    reqXp: GameBalance.player.startReqXP,
    moveSpeed: GameBalance.player.startMoveSpeed,
    fireRateMs: GameBalance.player.startFireRateMs,
    maxHealth: GameBalance.player.startMaxHealth,
    damageMult: GameBalance.player.startDamageMult,
    xpMult: GameBalance.player.startXPMult,
    gold: 0,
    goldMultiplier: 1,
    maxFuel: GameBalance.fuel.startFuel,
    magneticRange: GameBalance.player.startMagneticRange,
    hasExtraShooter: false,
    hasRevive: false
};

export const SaveSystem = {
    load() {
        try {
            const stored = localStorage.getItem(KEY);
            if (!stored) return { ...defaultStats };

            const parsed = JSON.parse(stored);
            const verified = verifyData(parsed);

            if (verified === null) {
                // Data was tampered with - reset to defaults
                console.warn('Save data corrupted or tampered - resetting to defaults');
                this.reset();
                return { ...defaultStats };
            }

            return verified;
        } catch (e) {
            console.error('Failed to load save data:', e);
            return { ...defaultStats };
        }
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
            xpMult: stats.xpMult,
            gold: stats.gold,
            goldMultiplier: stats.goldMultiplier,
            maxFuel: stats.maxFuel,
            magneticRange: stats.magneticRange,
            hasExtraShooter: stats.hasExtraShooter,
            hasRevive: stats.hasRevive
        };

        // Wrap with checksum
        const wrapped = wrapData(toSave);
        localStorage.setItem(KEY, JSON.stringify(wrapped));
    },

    reset() {
        localStorage.removeItem(KEY);
        return { ...defaultStats };
    },

    loadHighScore() {
        try {
            const stored = localStorage.getItem(HIGH_SCORE_KEY);
            if (!stored) return 0;

            const parsed = JSON.parse(stored);
            const verified = verifyData(parsed);

            if (verified === null) {
                console.warn('High score data tampered - resetting');
                this.resetHighScore();
                return 0;
            }

            return verified;
        } catch (e) {
            return 0;
        }
    },

    saveHighScore(score) {
        const currentHighScore = this.loadHighScore();
        if (score > currentHighScore) {
            const wrapped = wrapData(score);
            localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(wrapped));
            return true; // New high score!
        }
        return false;
    },

    resetHighScore() {
        localStorage.removeItem(HIGH_SCORE_KEY);
    },

    loadBestDistance() {
        try {
            const stored = localStorage.getItem(BEST_DISTANCE_KEY);
            if (!stored) return 0;

            const parsed = JSON.parse(stored);
            const verified = verifyData(parsed);

            if (verified === null) {
                console.warn('Best distance data tampered - resetting');
                this.resetBestDistance();
                return 0;
            }

            return verified;
        } catch (e) {
            return 0;
        }
    },

    saveBestDistance(distance) {
        const currentBestDistance = this.loadBestDistance();
        if (distance > currentBestDistance) {
            const wrapped = wrapData(distance);
            localStorage.setItem(BEST_DISTANCE_KEY, JSON.stringify(wrapped));
            return true; // New best distance!
        }
        return false;
    },

    resetBestDistance() {
        localStorage.removeItem(BEST_DISTANCE_KEY);
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
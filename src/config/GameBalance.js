// Centralized game balance configuration
// All gameplay stats and progression values in one place

export const GameBalance = {
    // Starting player stats
    player: {
        startLevel: 1,
        startXP: 0,
        startReqXP: 50,
        startMoveSpeed: 200,
        startFireRateMs: 1000,
        startMaxHealth: 10,
        startDamageMult: 1,
        startXPMult: 1
    },

    // Level up increments
    levelUp: {
        healthIncrease: 10,
        speedIncrease: 10,
        fireRateDecrease: 10,
        fireRateMin: 50,
        damageIncrease: 0.1,
        xpRequirementMultiplier: 1.5
    },

    // Enemy stats
    enemy: {
        spawnDelayMs: 800,
        fireDelayMs: 1500,
        fireChance: 0.2, // 20% chance to fire each check
        maxPoolSize: 30,

        // Movement
        velocityX: { min: -25, max: 25 },
        velocityY: { min: 50, max: 100 },

        // Health scaling
        baseHealth: 2,
        healthScalingPerLevel: 0.5,

        // Bullets
        bulletSpeed: 300,
        bulletPoolSize: 100
    },

    // XP and scoring
    progression: {
        xpPerPickup: 10,
        scorePerKill: 100
    }
};

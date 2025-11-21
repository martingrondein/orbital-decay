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
        startXPMult: 1,
        startMagneticRange: 10
    },

    // Level up increments
    levelUp: {
        healthIncrease: 10,
        speedIncrease: 10,
        fireRateDecrease: 10,
        fireRateMin: 50,
        damageIncrease: 0.1,
        xpRequirementMultiplier: 1.5,
        fuelBonus: 100
    },

    // Enemy stats
    enemy: {
        spawnDelayMs: 800,
        fireDelayMs: 1500,
        fireChance: 0.1, // 10% chance to fire each check
        maxPoolSize: 30,

        // Movement
        velocityX: { min: -25, max: 25 },
        velocityY: { min: 50, max: 100 },

        // Health (static, no scaling)
        baseHealth: 2,

        // Bullets
        bulletSpeed: 150,
        bulletPoolSize: 100
    },

    // Blue enemy stats (harder variant introduced after 45 seconds)
    blueEnemy: {
        introductionTime: 45000, // 45 seconds in milliseconds
        spawnChance: 0.3, // 30% chance to spawn blue instead of red
        maxPoolSize: 20,

        // Movement (faster and more aggressive)
        velocityX: { min: -40, max: 40 },
        velocityY: { min: 80, max: 120 },

        // Health (requires more hits)
        baseHealth: 5,

        // Rewards (better drops)
        xpMultiplier: 2,
        goldMultiplier: 2,
        scoreMultiplier: 2
    },

    // XP and scoring
    progression: {
        xpPerPickup: 10,
        scorePerKill: 100,
        goldDropChance: 0.5, // 50% chance to drop gold on enemy death
        goldPerDrop: 1,
        fuelDropChance: 0.3, // 30% chance to drop fuel on enemy death
        fuelPerPickup: 100
    },

    // Fuel system
    fuel: {
        startFuel: 10000,
        depletionPerSecond: 1,
        depletionPerMovement: 2
    },

    // Shop prices
    shop: {
        goldValueUpgrade: 50,
        healthUpgrade: 50,
        fireRateUpgrade: 50,
        fuelUpgrade: 50,
        magneticUpgrade: 100,
        extraShooter: 400,
        revive: 2000,
        healthUpgradeAmount: 10,
        fireRateUpgradeAmount: 10,
        fuelUpgradeAmount: 100,
        magneticUpgradeAmount: 10
    }
};

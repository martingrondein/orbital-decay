// Centralized game balance configuration
// All gameplay stats and progression values in one place

export const GameBalance = {
    // Starting player stats
    player: {
        startLevel: 1,
        startXP: 0,
        startReqXP: 100,
        startMoveSpeed: 200,
        startFireRateMs: 1000,
        startMaxHealth: 10,
        startDamageMult: 1,
        startXPMult: 1,
        startMagneticRange: 80
    },

    // Level up increments
    levelUp: {
        healthIncrease: 10,
        speedIncrease: 10,
        fireRateDecrease: 10,
        fireRateMin: 50,
        damageIncrease: 0.1,
        xpRequirementMultiplier: 1.25,
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
        maxPoolSize: 40,

        // Movement (faster and more aggressive)
        velocityX: { min: -40, max: 40 },
        velocityY: { min: 80, max: 120 },

        // Health (requires more hits)
        baseHealth: 4,

        // Rewards (better drops)
        xpMultiplier: 2,
        goldMultiplier: 2,
        scoreMultiplier: 2
    },

    // Green enemy stats (fast and aggressive variant introduced after 90 seconds)
    greenEnemy: {
        introductionTime: 90000, // 90 seconds in milliseconds
        spawnChance: 0.2, // 20% chance to spawn green
        maxPoolSize: 30,

        // Movement (very fast and aggressive)
        velocityX: { min: -60, max: 60 },
        velocityY: { min: 120, max: 160 },

        // Health (tough enemy)
        baseHealth: 6,

        // Rewards (excellent drops)
        xpMultiplier: 3,
        goldMultiplier: 3,
        scoreMultiplier: 3
    },

    // Yellow enemy stats (elite variant introduced after 120 seconds)
    yellowEnemy: {
        introductionTime: 120000, // 120 seconds in milliseconds
        spawnChance: 0.15, // 15% chance to spawn yellow
        maxPoolSize: 20,

        // Movement (extremely fast and aggressive)
        velocityX: { min: -80, max: 80 },
        velocityY: { min: 150, max: 200 },

        // Health (very tough enemy)
        baseHealth: 8,

        // Rewards (best drops)
        xpMultiplier: 4,
        goldMultiplier: 4,
        scoreMultiplier: 4
    },

    // Purple enemy stats (legendary variant introduced after 150 seconds)
    purpleEnemy: {
        introductionTime: 150000, // 150 seconds in milliseconds
        spawnChance: 0.1, // 10% chance to spawn purple
        maxPoolSize: 15,

        // Movement (insanely fast and aggressive)
        velocityX: { min: -100, max: 100 },
        velocityY: { min: 180, max: 240 },

        // Health (legendary enemy)
        baseHealth: 10,

        // Rewards (legendary drops)
        xpMultiplier: 5,
        goldMultiplier: 5,
        scoreMultiplier: 5
    },

    // Wave system (infinite waves with color cycling)
    waves: {
        // Wave duration in milliseconds
        waveDuration: 30000, // 30 seconds per wave

        // Difficulty scaling per wave (exponential)
        healthMultiplier: 1.15, // 15% more health per wave
        velocityMultiplier: 1.1, // 10% faster per wave

        // Color cycle order (repeats infinitely)
        colorCycle: ['red', 'blue', 'green', 'yellow', 'purple'],

        // Tail count increases after each complete cycle
        baseTailCount: 3,
        tailsPerCycle: 1
    },

    // XP and scoring
    progression: {
        xpPerPickup: 25,
        scorePerKill: 100,
        goldDropChance: 0.6, // 60% chance to drop gold on enemy death
        goldPerDrop: 1,
        fuelDropChance: 0.2, // 20% chance to drop fuel on enemy death
        fuelPerPickup: 500
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
        xpGainUpgrade: 50,
        damageUpgrade: 100,
        extraShooter: 400,
        revive: 2000,
        healthUpgradeAmount: 10,
        fireRateUpgradeAmount: 10,
        fuelUpgradeAmount: 100,
        magneticUpgradeAmount: 10,
        xpGainUpgradeAmount: 10,
        damageUpgradeAmount: 0.5
    }
};

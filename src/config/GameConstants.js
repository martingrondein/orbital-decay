/**
 * Game constants
 * Magic numbers and configuration values used throughout the game
 */

export const GameConstants = {
    // Player positioning
    player: {
        paddingFromBottom: 90,
        maxStartY: 710
    },

    // Game timing
    timing: {
        gameTickInterval: 1000, // 1 second in ms
        powerupDuration: 15000, // 15 seconds in ms
        invulnerabilityDuration: 3000, // 3 seconds in ms
        hitFlashDuration: 100, // 0.1 seconds in ms
        powerupCountdownInterval: 1000 // 1 second in ms
    },

    // Damage values
    damage: {
        collision: 5,
        damageMultiplier: 2,
        scoreMultiplier: 3
    },

    // Spawn configuration
    spawn: {
        padding: 30, // Distance from screen edges
        fireBoundaryRatio: 0.75, // 75% of screen height
        cleanupBoundary: 60, // Pixels beyond screen
        powerupSpawnChance: 0.1 // 10% chance
    },

    // Visual effects - Collection
    collection: {
        particleCount: 6,
        particleRadius: 4,
        particleSpread: 30,
        effectDuration: 300,
        circleRadius: 8,
        circleDuration: 250
    },

    // Visual effects - Explosion
    explosion: {
        circleCount: 3,
        baseRadius: 40,
        radiusIncrement: 10,
        baseDuration: 300,
        durationIncrement: 100,
        particleCount: 8,
        particleRadius: 3,
        particleSpread: 50,
        particleDuration: 400
    },

    // Shield powerup
    shield: {
        bubbleRadius: 30,
        opacity: 0.7
    },

    // Revive feature
    revive: {
        fontSize: '48px',
        strokeThickness: 6,
        textOffset: 50,
        duration: 2000
    },

    // Item drops
    drops: {
        velocityY: 100,
        horizontalSpacing: 5
    }
};

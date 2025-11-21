/**
 * Powerup configuration
 * Centralized powerup behavior definitions
 * Each powerup has apply and clear functions that modify game state
 */

export const PowerupConfig = {
    spray: {
        name: 'Spray Shot',
        /**
         * Enables spray shot firing pattern
         * @param {GameScene} scene - The game scene
         */
        apply(scene) {
            scene.player.sprayShot = true;
        },
        /**
         * Disables spray shot firing pattern
         * @param {GameScene} scene - The game scene
         */
        clear(scene) {
            scene.player.sprayShot = false;
        }
    },

    damage: {
        name: 'Double Damage',
        /**
         * Doubles player damage output
         * @param {GameScene} scene - The game scene
         */
        apply(scene) {
            scene.baseDamageMult = scene.stats.damageMult;
            scene.stats.damageMult *= 2;
        },
        /**
         * Restores original damage
         * @param {GameScene} scene - The game scene
         */
        clear(scene) {
            scene.stats.damageMult = scene.baseDamageMult;
        }
    },

    firerate: {
        name: 'Rapid Fire',
        /**
         * Doubles fire rate (halves fire delay)
         * @param {GameScene} scene - The game scene
         */
        apply(scene) {
            scene.baseFireRateMs = scene.stats.fireRateMs;
            scene.stats.fireRateMs = Math.max(50, Math.floor(scene.stats.fireRateMs / 2));
        },
        /**
         * Restores original fire rate
         * @param {GameScene} scene - The game scene
         */
        clear(scene) {
            scene.stats.fireRateMs = scene.baseFireRateMs;
        }
    },

    doublexp: {
        name: 'Double XP',
        /**
         * Doubles XP gain from pickups
         * @param {GameScene} scene - The game scene
         */
        apply(scene) {
            scene.baseXPMult = scene.stats.xpMult;
            scene.stats.xpMult *= 2;
        },
        /**
         * Restores original XP multiplier
         * @param {GameScene} scene - The game scene
         */
        clear(scene) {
            scene.stats.xpMult = scene.baseXPMult;
        }
    },

    triplescore: {
        name: 'Triple Score',
        /**
         * Triples score gain from kills
         * @param {GameScene} scene - The game scene
         */
        apply(scene) {
            scene.scoreMultiplier = 3;
        },
        /**
         * Restores normal score multiplier
         * @param {GameScene} scene - The game scene
         */
        clear(scene) {
            scene.scoreMultiplier = 1;
        }
    },

    shield: {
        name: 'Shield',
        /**
         * Grants invulnerability and creates visual shield bubble
         * @param {GameScene} scene - The game scene
         */
        apply(scene) {
            scene.player.isInvulnerable = true;
            scene.player.setAlpha(0.7);
            // Create shield bubble
            scene.shieldBubble = scene.add.circle(
                scene.player.x,
                scene.player.y,
                30,
                0x00aaff,
                0.4
            ).setDepth(2);
        },
        /**
         * Removes invulnerability and destroys shield bubble
         * @param {GameScene} scene - The game scene
         */
        clear(scene) {
            scene.player.isInvulnerable = false;
            scene.player.setAlpha(1);
            // Destroy shield bubble
            if (scene.shieldBubble) {
                scene.shieldBubble.destroy();
                scene.shieldBubble = null;
            }
        }
    }
};

/**
 * Get powerup configuration by type
 * @param {string} type - Powerup type identifier
 * @returns {Object|null} Powerup config or null if not found
 */
export function getPowerupConfig(type) {
    return PowerupConfig[type] || null;
}

/**
 * Apply a powerup effect
 * @param {string} type - Powerup type identifier
 * @param {GameScene} scene - The game scene
 * @returns {boolean} True if powerup was applied, false otherwise
 */
export function applyPowerup(type, scene) {
    const config = getPowerupConfig(type);
    if (config) {
        config.apply(scene);
        return true;
    }
    return false;
}

/**
 * Clear a powerup effect
 * @param {string} type - Powerup type identifier
 * @param {GameScene} scene - The game scene
 * @returns {boolean} True if powerup was cleared, false otherwise
 */
export function clearPowerup(type, scene) {
    const config = getPowerupConfig(type);
    if (config) {
        config.clear(scene);
        return true;
    }
    return false;
}

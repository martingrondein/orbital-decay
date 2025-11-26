/**
 * Visual effects utilities
 * Reusable functions for creating visual feedback effects
 */

/**
 * Creates a radial particle burst effect
 * @param {Phaser.Scene} scene - The scene to create effects in
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} config - Effect configuration
 * @param {number} config.count - Number of particles (default: 8)
 * @param {number} config.radius - Particle radius (default: 3)
 * @param {number} config.color - Particle color hex (default: 0xffaa00)
 * @param {number} config.alpha - Particle opacity (default: 1)
 * @param {number} config.spread - Distance particles travel (default: 50)
 * @param {number} config.duration - Animation duration in ms (default: 400)
 * @param {number} config.depth - Z-depth for rendering (default: 50)
 */
export function createRadialParticleBurst(scene, x, y, config = {}) {
    const {
        count = 8,
        radius = 3,
        color = 0xffaa00,
        alpha = 1,
        spread = 50,
        duration = 400,
        depth = 50
    } = config;

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const particle = scene.add.circle(x, y, radius, color, alpha).setDepth(depth);

        scene.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * spread,
            y: y + Math.sin(angle) * spread,
            alpha: 0,
            duration: duration,
            ease: 'Power2',
            onComplete: () => particle.destroy()
        });
    }
}

/**
 * Creates an expanding circle effect (single circle)
 * @param {Phaser.Scene} scene - The scene to create effect in
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} config - Effect configuration
 * @param {number} config.startRadius - Starting radius (default: 5)
 * @param {number} config.endRadius - Ending radius (default: 40)
 * @param {number} config.color - Circle color hex (default: 0xff0000)
 * @param {number} config.alpha - Starting opacity (default: 0.8)
 * @param {number} config.duration - Animation duration in ms (default: 300)
 * @param {number} config.depth - Z-depth for rendering (default: 50)
 */
export function createExpandingCircle(scene, x, y, config = {}) {
    const {
        startRadius = 5,
        endRadius = 40,
        color = 0xff0000,
        alpha = 0.8,
        duration = 300,
        depth = 50
    } = config;

    const circle = scene.add.circle(x, y, startRadius, color, alpha).setDepth(depth);

    scene.tweens.add({
        targets: circle,
        radius: endRadius,
        alpha: 0,
        duration: duration,
        ease: 'Power2',
        onComplete: () => circle.destroy()
    });
}

/**
 * Creates multiple expanding circles for explosion effect
 * @param {Phaser.Scene} scene - The scene to create effect in
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} config - Effect configuration
 * @param {number} config.count - Number of circles (default: 3)
 * @param {number} config.startRadius - Starting radius (default: 5)
 * @param {number} config.baseEndRadius - Base ending radius (default: 40)
 * @param {number} config.radiusIncrement - Additional radius per circle (default: 10)
 * @param {number} config.color - Circle color hex (default: 0xff0000)
 * @param {number} config.alpha - Starting opacity (default: 0.8)
 * @param {number} config.baseDuration - Base duration in ms (default: 300)
 * @param {number} config.durationIncrement - Additional duration per circle (default: 100)
 * @param {number} config.depth - Z-depth for rendering (default: 50)
 */
export function createExplosionCircles(scene, x, y, config = {}) {
    const {
        count = 3,
        startRadius = 5,
        baseEndRadius = 40,
        radiusIncrement = 10,
        color = 0xff0000,
        alpha = 0.8,
        baseDuration = 300,
        durationIncrement = 100,
        depth = 50
    } = config;

    for (let i = 0; i < count; i++) {
        createExpandingCircle(scene, x, y, {
            startRadius,
            endRadius: baseEndRadius + (i * radiusIncrement),
            color,
            alpha,
            duration: baseDuration + (i * durationIncrement),
            depth
        });
    }
}

/**
 * Creates a collection effect with particles and expanding circle
 * @param {Phaser.Scene} scene - The scene to create effect in
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} color - Effect color hex (default: 0x00ffff)
 * @param {Object} config - Optional effect configuration overrides
 */
export function createCollectionEffect(scene, x, y, color = 0x00ffff, config = {}) {
    // Particle burst
    createRadialParticleBurst(scene, x, y, {
        count: 6,
        radius: 4,
        color: color,
        alpha: 1,
        spread: 30,
        duration: 300,
        depth: 50,
        ...config.particles
    });

    // Expanding circle
    createExpandingCircle(scene, x, y, {
        startRadius: 8,
        endRadius: 20,
        color: color,
        alpha: 0.6,
        duration: 250,
        depth: 50,
        ...config.circle
    });
}

/**
 * Creates a full explosion effect with particles and circles
 * @param {Phaser.Scene} scene - The scene to create effect in
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} color - Explosion color hex (default: 0xff0000)
 * @param {Object} config - Optional effect configuration overrides
 */
export function createExplosionEffect(scene, x, y, color = 0xff0000, config = {}) {
    // Expanding circles
    createExplosionCircles(scene, x, y, {
        count: 3,
        color: color,
        ...config.circles
    });

    // Particle burst
    const particleColor = color === 0x0000ff ? 0x00aaff : 0xffaa00;
    createRadialParticleBurst(scene, x, y, {
        count: 8,
        radius: 3,
        color: particleColor,
        alpha: 1,
        spread: 50,
        duration: 400,
        depth: 50,
        ...config.particles
    });
}

/**
 * Creates exhaust trail particles for ship movement
 * @param {Phaser.Scene} scene - The scene to create effect in
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} config - Effect configuration
 * @param {number} config.count - Number of particles (default: 3)
 * @param {number} config.radius - Particle radius (default: 2)
 * @param {number} config.color - Particle color hex (default: 0x00ffff)
 * @param {number} config.alpha - Starting opacity (default: 0.8)
 * @param {number} config.spread - Distance particles travel (default: 15)
 * @param {number} config.duration - Animation duration in ms (default: 200)
 * @param {number} config.depth - Z-depth for rendering (default: 0)
 */
export function createExhaustEffect(scene, x, y, config = {}) {
    const {
        count = 3,
        radius = 2,
        color = 0x00ffff,
        alpha = 0.8,
        spread = 15,
        duration = 200,
        depth = 0
    } = config;

    for (let i = 0; i < count; i++) {
        // Randomize particle position slightly for organic feel
        const offsetX = (Math.random() - 0.5) * 4;
        const offsetY = (Math.random() - 0.5) * 4;

        const particle = scene.add.circle(
            x + offsetX,
            y + offsetY,
            radius,
            color,
            alpha
        ).setDepth(depth);

        // Particles fade downward and shrink
        scene.tweens.add({
            targets: particle,
            y: y + spread + (Math.random() * 10),
            radius: 0.5,
            alpha: 0,
            duration: duration + (Math.random() * 100),
            ease: 'Power2',
            onComplete: () => particle.destroy()
        });
    }
}

/**
 * Creates a muzzle flash effect for weapon fire
 * @param {Phaser.Scene} scene - The scene to create effect in
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} config - Effect configuration
 * @param {number} config.direction - Direction angle in radians (default: -Math.PI/2 for upward)
 * @param {number} config.color - Flash color hex (default: 0xffffff)
 * @param {number} config.count - Number of particles (default: 4)
 * @param {number} config.spread - Cone spread in radians (default: Math.PI/4)
 * @param {number} config.distance - Distance particles travel (default: 20)
 * @param {number} config.duration - Animation duration in ms (default: 100)
 */
export function createMuzzleFlash(scene, x, y, config = {}) {
    const {
        direction = -Math.PI / 2,
        color = 0xffffff,
        count = 4,
        spread = Math.PI / 4,
        distance = 20,
        duration = 100
    } = config;

    for (let i = 0; i < count; i++) {
        const angle = direction + (Math.random() - 0.5) * spread;
        const dist = distance * (0.5 + Math.random() * 0.5);

        const particle = scene.add.circle(x, y, 2, color, 0.9).setDepth(50);

        scene.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * dist,
            y: y + Math.sin(angle) * dist,
            radius: 0.5,
            alpha: 0,
            duration: duration,
            ease: 'Power2',
            onComplete: () => particle.destroy()
        });
    }
}

/**
 * Creates a directional particle burst (for impacts, hits)
 * @param {Phaser.Scene} scene - The scene to create effect in
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} direction - Direction angle in radians
 * @param {Object} config - Effect configuration
 */
export function createDirectionalBurst(scene, x, y, direction, config = {}) {
    const {
        count = 6,
        radius = 3,
        color = 0xffffff,
        alpha = 1,
        spread = 30,
        duration = 200,
        depth = 50
    } = config;

    for (let i = 0; i < count; i++) {
        const angle = direction + (Math.random() - 0.5) * Math.PI / 2;
        const particle = scene.add.circle(x, y, radius, color, alpha).setDepth(depth);

        scene.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * spread,
            y: y + Math.sin(angle) * spread,
            alpha: 0,
            radius: 0.5,
            duration: duration,
            ease: 'Power2',
            onComplete: () => particle.destroy()
        });
    }
}

/**
 * Creates a spawn effect with inward-collapsing particles
 * @param {Phaser.Scene} scene - The scene to create effect in
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} color - Effect color hex
 * @param {Object} config - Optional configuration
 */
export function createSpawnEffect(scene, x, y, color = 0xff0000, config = {}) {
    const {
        count = 8,
        radius = 3,
        alpha = 0.8,
        distance = 40,
        duration = 300
    } = config;

    // Expanding circle
    createExpandingCircle(scene, x, y, {
        startRadius: 5,
        endRadius: 30,
        color: color,
        alpha: 0.5,
        duration: 250,
        depth: 50
    });

    // Particles that collapse inward
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const startX = x + Math.cos(angle) * distance;
        const startY = y + Math.sin(angle) * distance;

        const particle = scene.add.circle(startX, startY, radius, color, alpha).setDepth(50);

        scene.tweens.add({
            targets: particle,
            x: x,
            y: y,
            alpha: 0,
            radius: 0.5,
            duration: duration,
            ease: 'Power2',
            onComplete: () => particle.destroy()
        });
    }
}

/**
 * Creates a celebratory burst effect (for level ups, achievements)
 * @param {Phaser.Scene} scene - The scene to create effect in
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} config - Effect configuration
 */
export function createCelebrationBurst(scene, x, y, config = {}) {
    const {
        count = 16,
        colors = [0xffd700, 0xffffff, 0xffaa00],
        spread = 60,
        duration = 500
    } = config;

    // Large expanding circle
    createExpandingCircle(scene, x, y, {
        startRadius: 10,
        endRadius: 80,
        color: 0xffd700,
        alpha: 0.6,
        duration: 400,
        depth: 50
    });

    // Colorful particles
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const color = colors[i % colors.length];
        const particle = scene.add.circle(x, y, 4, color, 1).setDepth(50);

        scene.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * spread,
            y: y + Math.sin(angle) * spread,
            alpha: 0,
            radius: 1,
            duration: duration,
            ease: 'Power2',
            onComplete: () => particle.destroy()
        });
    }
}

/**
 * Creates a light contrail effect for bullets
 * @param {Phaser.Scene} scene - The scene to create effect in
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} config - Effect configuration
 * @param {number} config.count - Number of particles (default: 2)
 * @param {number} config.radius - Particle radius (default: 1.5)
 * @param {number} config.color - Particle color hex (default: 0xaaffff)
 * @param {number} config.alpha - Starting opacity (default: 0.7)
 * @param {number} config.duration - Animation duration in ms (default: 150)
 * @param {number} config.depth - Z-depth for rendering (default: 1)
 */
export function createBulletTrail(scene, x, y, config = {}) {
    const {
        count = 2,
        radius = 1.5,
        color = 0xaaffff,
        alpha = 0.7,
        duration = 150,
        depth = 1
    } = config;

    for (let i = 0; i < count; i++) {
        // Slight randomization for organic feel
        const offsetX = (Math.random() - 0.5) * 3;
        const offsetY = (Math.random() - 0.5) * 3;

        const particle = scene.add.circle(
            x + offsetX,
            y + offsetY,
            radius,
            color,
            alpha
        ).setDepth(depth);

        // Particles fade and shrink quickly
        scene.tweens.add({
            targets: particle,
            radius: 0.3,
            alpha: 0,
            duration: duration + (Math.random() * 50),
            ease: 'Power2',
            onComplete: () => particle.destroy()
        });
    }
}

/**
 * Creates particle effects for UI bar changes (health, XP, fuel)
 * @param {Phaser.Scene} scene - The scene to create effect in
 * @param {number} x - X position (bar position)
 * @param {number} y - Y position (bar position)
 * @param {number} width - Width of the bar
 * @param {Object} config - Effect configuration
 * @param {number} config.color - Particle color hex (default: 0xffffff)
 * @param {string} config.type - Type of change: 'increase' or 'decrease' (default: 'increase')
 * @param {number} config.count - Number of particles (default: 5)
 * @param {number} config.radius - Particle radius (default: 3)
 * @param {number} config.alpha - Starting opacity (default: 0.8)
 * @param {number} config.duration - Animation duration in ms (default: 400)
 * @param {number} config.depth - Z-depth for rendering (default: 102)
 */
export function createBarParticleEffect(scene, x, y, width, config = {}) {
    const {
        color = 0xffffff,
        type = 'increase',
        count = 5,
        radius = 3,
        alpha = 0.8,
        duration = 400,
        depth = 102
    } = config;

    // Spawn particles along the bar
    for (let i = 0; i < count; i++) {
        // Random position along the visible bar width
        const offsetX = Math.random() * Math.max(width, 20);
        const offsetY = (Math.random() - 0.5) * 8;

        const particle = scene.add.circle(
            x + offsetX,
            y + offsetY,
            radius,
            color,
            alpha
        ).setDepth(depth);

        if (type === 'increase') {
            // Particles burst upward for increases
            scene.tweens.add({
                targets: particle,
                y: y - 20 - (Math.random() * 10),
                x: particle.x + (Math.random() - 0.5) * 15,
                radius: 0.5,
                alpha: 0,
                duration: duration + (Math.random() * 100),
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        } else {
            // Particles fall downward for decreases
            scene.tweens.add({
                targets: particle,
                y: y + 15 + (Math.random() * 10),
                x: particle.x + (Math.random() - 0.5) * 10,
                radius: 1,
                alpha: 0,
                duration: duration + (Math.random() * 100),
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }
}

/**
 * Creates a wiggly alien-like tail effect for enemies
 * @param {Phaser.Scene} scene - The scene to create effect in
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} time - Current game time for wave animation
 * @param {Object} config - Effect configuration
 * @param {number} config.color - Tail color hex (default: 0xff0000)
 * @param {number} config.count - Number of tail segments (default: 3)
 * @param {number} config.radius - Particle radius (default: 2)
 * @param {number} config.alpha - Opacity (default: 0.6)
 * @param {number} config.spacing - Spacing between segments (default: 8)
 * @param {number} config.wiggleAmount - How much to wiggle (default: 3)
 * @param {number} config.duration - Fade duration in ms (default: 200)
 * @param {number} config.depth - Z-depth for rendering (default: 0)
 */
export function createEnemyTail(scene, x, y, time, config = {}) {
    const {
        color = 0xff0000,
        count = 3,
        radius = 2,
        alpha = 0.6,
        spacing = 8,
        wiggleAmount = 3,
        duration = 200,
        depth = 0
    } = config;

    for (let i = 0; i < count; i++) {
        // Calculate wiggle offset using sine wave for organic movement
        const wiggleOffset = Math.sin((time * 0.005) + (i * 0.8)) * wiggleAmount;

        // Position segments behind the enemy with decreasing size
        const segmentY = y + (i * spacing);
        const segmentRadius = radius * (1 - (i * 0.2));
        const segmentAlpha = alpha * (1 - (i * 0.25));

        const particle = scene.add.circle(
            x + wiggleOffset,
            segmentY,
            segmentRadius,
            color,
            segmentAlpha
        ).setDepth(depth);

        // Fade out quickly
        scene.tweens.add({
            targets: particle,
            alpha: 0,
            radius: segmentRadius * 0.5,
            duration: duration,
            ease: 'Power2',
            onComplete: () => particle.destroy()
        });
    }
}

/**
 * UI configuration constants
 * Centralized styling and layout values for consistent UI appearance
 */

export const UIConfig = {
    // Layout
    padding: 10,
    topOffset: 10,

    // Bars
    bars: {
        health: { y: 40, color: 0xff0000, bgColor: 0x333333 },
        xp: { y: 65, color: 0x00aaff, bgColor: 0x333333 },
        fuel: { y: 90, color: 0x9932cc, bgColor: 0x333333 },
        height: 15,
        labelFontSize: '12px',
        labelStroke: 3
    },

    // Text
    text: {
        score: { fontSize: '18px', color: '#ffffff' },
        distance: { fontSize: '18px', color: '#ffffff' },
        level: { fontSize: '18px', color: '#ffffff' }
    },

    // Powerup indicator
    powerup: {
        y: 120,
        fontSize: '18px',
        color: '#fff',
        stroke: 4,
        backgroundColor: '#000000aa',
        padding: { x: 10, y: 5 }
    },

    // Powerup display names and colors
    powerups: {
        spray: { name: 'SPRAY SHOT', color: 0x00ff00 },
        damage: { name: 'DOUBLE DAMAGE', color: 0xff0000 },
        firerate: { name: 'RAPID FIRE', color: 0xffaa00 },
        doublexp: { name: 'DOUBLE XP', color: 0x00ffff },
        triplescore: { name: 'TRIPLE SCORE', color: 0xffff00 },
        shield: { name: 'SHIELD', color: 0x00aaff }
    },

    // Modals
    modal: {
        background: { color: 0x000000, alpha: 0.8 },
        title: {
            fontSize: '40px',
            color: '#ffff00',
            stroke: 4
        },
        text: {
            fontSize: '24px',
            color: '#ffffff',
            stroke: 3
        },
        info: {
            fontSize: '20px',
            color: '#aaaaaa'
        },
        button: {
            fontSize: '20px',
            smallFontSize: '18px',
            color: 'black'
        }
    },

    // Game Over
    gameOver: {
        highlightFontSize: '28px',
        highlightColor: '#00ff00'
    }
};

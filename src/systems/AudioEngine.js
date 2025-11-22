export const AudioEngine = {
    scene: null,

    init(scene) {
        this.scene = scene;
    },

    play(type, volume = 0.5) {
        if (!this.scene) return;

        // Map old sound names to new audio files
        const soundMap = {
            'xp': 'collect-xp',
            'coin': 'collect-coin',
            'gold': 'collect-coin',
            'explode': 'enemy-explode',
            'enemyhit': 'enemy-hit',
            'levelup': 'level-up',
            'gameover': 'game-over',
            'hit': 'player-hit',
            'enemyshoot': 'enemy-shoot',
            'drop': 'collectible-drop',
            'spend': 'spend-gold'
        };

        const soundKey = soundMap[type] || type;

        try {
            this.scene.sound.play(soundKey, { volume });
        } catch (e) {
            console.warn(`Failed to play sound: ${soundKey}`, e);
        }
    }
};
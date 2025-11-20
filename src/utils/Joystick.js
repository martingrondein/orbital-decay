export default class Joystick {
    constructor(scene, x, y, radius = 50) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.radius = radius;

        // State
        this.valX = 0;
        this.valY = 0;
        this.active = false;

        this.createVisuals();
        this.setupEvents();
    }

    createVisuals() {
        this.base = this.scene.add.circle(this.x, this.y, this.radius, 0x888888, 0.5).setDepth(100);
        this.knob = this.scene.add.circle(this.x, this.y, this.radius * 0.5, 0xffffff, 0.8).setDepth(100);
    }

    setupEvents() {
        // Touch zone logic (optional: restrict to specific area)
        this.scene.input.on('pointerdown', (pointer) => {
            if (this.isHit(pointer)) {
                this.active = true;
                this.updateKnob(pointer);
            }
        });

        this.scene.input.on('pointermove', (pointer) => {
            if (this.active) {
                this.updateKnob(pointer);
            }
        });

        this.scene.input.on('pointerup', () => {
            this.reset();
        });
    }

    isHit(pointer) {
        // Simple distance check to see if user touched near the joystick base
        const dx = pointer.x - this.x;
        const dy = pointer.y - this.y;
        return (dx * dx + dy * dy) < (this.radius * 2) ** 2;
    }

    updateKnob(pointer) {
        let dx = pointer.x - this.x;
        let dy = pointer.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Clamp knob to radius
        if (dist > this.radius) {
            dx = (dx / dist) * this.radius;
            dy = (dy / dist) * this.radius;
        }

        this.knob.setPosition(this.x + dx, this.y + dy);

        // Normalize output (-1 to 1)
        this.valX = dx / this.radius;
        this.valY = dy / this.radius;
    }

    reset() {
        this.active = false;
        this.valX = 0;
        this.valY = 0;
        this.knob.setPosition(this.x, this.y);
    }

    // Getter for the update loop
    getData() {
        return {
            active: this.active,
            x: this.valX,
            y: this.valY
        };
    }
}
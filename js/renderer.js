export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.colors = {
            black: '#000000',
            cyan: '#55ffff',
            magenta: '#ff55ff',
            white: '#ffffff',
            grid: '#003333'
        };

        // Pre-render pilot faces to avoiding recreating them every frame
        this.pilotFaces = {};
        this.createPilotFaces();
    }

    clear() {
        this.ctx.fillStyle = this.colors.black;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawGrid(speedOffset) {
        // Pseudo 3D floor grid effect
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        // Horizon line
        const horizonY = this.height * 0.3;

        // Vertical lines (perspective)
        for (let i = -10; i <= 10; i++) {
            const x = this.width / 2 + i * 40;
            this.ctx.moveTo(this.width / 2 + i * 5, horizonY);
            this.ctx.lineTo(x * 3, this.height);
        }

        // Horizontal lines (moving)
        // Adjust spacing to simulate depth
        for (let i = 0; i < 10; i++) {
            const y = horizonY + Math.pow(i, 2) * 5 + (speedOffset % 20);
            if (y > this.height) continue;
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
        }

        this.ctx.stroke();
    }

    drawPlayer(player) {
        this.ctx.fillStyle = this.colors.cyan;
        const { x, y, width, height } = player;

        // Main body
        this.ctx.fillRect(x - width / 2, y - height / 2, width, height);
        // Wings
        this.ctx.fillRect(x - width - 5, y, 10, 4);
        this.ctx.fillRect(x + width / 2 + 5, y, 10, 4);
        // Thruster glow
        this.ctx.fillStyle = Math.random() > 0.5 ? this.colors.magenta : this.colors.white;
        this.ctx.fillRect(x - 2, y + height / 2, 4, 4);
    }

    drawEnemy(enemy) {
        // Scaling for perspective
        const scale = enemy.scale;
        const w = enemy.width * scale;
        const h = enemy.height * scale;
        const x = enemy.x;
        const y = enemy.y;

        this.ctx.fillStyle = this.colors.white;
        this.ctx.fillRect(x - w / 2, y - h / 2, w, h);

        // Enemy detail
        this.ctx.fillStyle = this.colors.magenta;
        this.ctx.fillRect(x - w / 4, y - h / 4, w / 2, h / 2);
    }

    drawBullet(bullet) {
        this.ctx.fillStyle = this.colors.magenta;
        this.ctx.fillRect(bullet.x - 2, bullet.y, 4, 10);
    }

    drawParticles(particles) {
        this.ctx.fillStyle = this.colors.white;
        for (const p of particles) {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
            this.ctx.globalAlpha = 1.0;
        }
    }

    createPilotFaces() {
        // Similar to original but cleaner code
        const sizes = { w: 16, h: 16 };

        // Neutral
        const c1 = this.createOffscreenCanvas(sizes.w, sizes.h);
        const ctx1 = c1.getContext('2d');
        ctx1.fillStyle = this.colors.cyan;
        ctx1.fillRect(0, 0, 16, 16);
        ctx1.fillStyle = this.colors.black;
        ctx1.fillRect(4, 4, 2, 2); ctx1.fillRect(10, 4, 2, 2); // eyes
        ctx1.fillRect(6, 11, 4, 1); // mouth
        this.pilotFaces.neutral = c1;

        // Angry
        const c2 = this.createOffscreenCanvas(sizes.w, sizes.h);
        const ctx2 = c2.getContext('2d');
        ctx2.fillStyle = this.colors.magenta;
        ctx2.fillRect(0, 0, 16, 16);
        ctx2.fillStyle = this.colors.black;
        ctx2.fillRect(3, 4, 3, 2); ctx2.fillRect(10, 4, 3, 2); // angry eyes
        ctx2.fillRect(6, 12, 4, 1); // mouth
        this.pilotFaces.angry = c2;
    }

    createOffscreenCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        return c;
    }

    getPilotFace(state) {
        return this.pilotFaces[state] || this.pilotFaces.neutral;
    }
}

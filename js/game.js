export class Game {
    constructor(renderer, audio, width, height) {
        this.renderer = renderer;
        this.audio = audio;
        this.width = width;
        this.height = height;

        this.player = {
            x: width / 2,
            y: height - 60,
            width: 32, // Increased size
            height: 16,
            speed: 8
        };

        this.bullets = [];
        this.enemies = [];
        this.particles = [];

        this.score = 0;
        this.gameOver = false;

        this.inputs = { left: false, right: false, fire: false };
        this.lastShotTime = 0;

        this.pilotState = 'neutral';
        this.pilotTimer = null;

        this.frameCount = 0;
    }

    handleInput(key, isPressed) {
        if (key === 'ArrowLeft') this.inputs.left = isPressed;
        if (key === 'ArrowRight') this.inputs.right = isPressed;
        if (key === ' ') this.inputs.fire = isPressed;
    }

    update(dt) {
        if (this.gameOver) return;
        this.frameCount++;

        // Player Movement
        if (this.inputs.left) this.player.x -= this.player.speed;
        if (this.inputs.right) this.player.x += this.player.speed;

        // Clamp player
        this.player.x = Math.max(30, Math.min(this.width - 30, this.player.x));

        // Shooting
        if (this.inputs.fire) {
            const now = Date.now();
            if (now - this.lastShotTime > 250) {
                this.bullets.push({ x: this.player.x, y: this.player.y - 20 });
                this.audio.playShoot();
                this.setPilotState('angry');
                this.lastShotTime = now;
            }
        }

        // Update Bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].y -= 12;
            if (this.bullets[i].y < 0) this.bullets.splice(i, 1);
        }

        // Spawn Enemies
        if (this.enemies.length < 5 && Math.random() < 0.02) {
            this.enemies.push({
                x: Math.random() * (this.width * 0.8) + (this.width * 0.1),
                y: -50,
                z: 0, // Depth
                width: 40,
                height: 20,
                speed: 2 + Math.random() * 2,
                scale: 0.1
            });
        }

        // Update Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.y += e.speed;

            // Simple depth simulation
            e.scale = 0.5 + (e.y / this.height) * 1.5;

            // Wobbly movement
            e.x += Math.sin(e.y * 0.05 + this.frameCount * 0.1) * 2;

            if (e.y > this.height + 50) {
                this.enemies.splice(i, 1);
                // Penalty?
            }
        }

        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        this.checkCollisions();
    }

    checkCollisions() {
        // Bullet vs Enemy
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let e = this.enemies[i];
            let ew = e.width * e.scale;
            let eh = e.height * e.scale;

            for (let j = this.bullets.length - 1; j >= 0; j--) {
                let b = this.bullets[j];

                // Simple AABB
                if (b.x > e.x - ew / 2 && b.x < e.x + ew / 2 &&
                    b.y > e.y - eh / 2 && b.y < e.y + eh / 2) {

                    this.createExplosion(e.x, e.y);
                    this.enemies.splice(i, 1);
                    this.bullets.splice(j, 1);
                    this.score += 100;
                    this.audio.playExplosion();
                    this.setPilotState('neutral');
                    break;
                }
            }
        }
    }

    createExplosion(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                size: Math.random() * 4 + 2
            });
        }
    }

    setPilotState(state) {
        this.pilotState = state;
        if (this.pilotTimer) clearTimeout(this.pilotTimer);
        this.pilotTimer = setTimeout(() => {
            if (this.pilotState === 'angry') this.pilotState = 'neutral';
        }, 500);
    }

    draw() {
        this.renderer.clear();
        this.renderer.drawGrid(this.frameCount * 4); // Scrolling speed

        // Draw entities
        this.enemies.forEach(e => this.renderer.drawEnemy(e));
        this.bullets.forEach(b => this.renderer.drawBullet(b));
        this.renderer.drawPlayer(this.player);
        this.renderer.drawParticles(this.particles);
    }
}

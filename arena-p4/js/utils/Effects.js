
export class Fireworks {
    constructor(canvasId, audioManager) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.audioManager = audioManager;
        this.resize();
        this.running = false;
        
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start() {
        this.running = true;
        this.animate();
        this.launchInterval = setInterval(() => this.launchRocket(), 800);
    }

    stop() {
        this.running = false;
        clearInterval(this.launchInterval);
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    launchRocket() {
        const x = Math.random() * this.canvas.width;
        const y = this.canvas.height;
        const targetY = Math.random() * (this.canvas.height * 0.5);
        const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        
        // Simple explosion at random point for MVP
        this.explode(x, targetY, color);
    }

    explode(x, y, color) {
        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 * i) / 50;
            const velocity = Math.random() * 5 + 2;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                alpha: 1,
                color: color,
                decay: Math.random() * 0.02 + 0.01
            });
        }
    }

    animate() {
        if (!this.running) return;
        
        // Trail effect
        this.ctx.fillStyle = 'rgba(5, 4, 10, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // Gravity
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.alpha;
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

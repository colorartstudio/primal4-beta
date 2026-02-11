export default class EffectsManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.effects = [];
    }

    createEffect(type, x, y, size = 50, color = null) {
        const effect = {
            type,
            x,
            y,
            size,
            life: 1.0,
            color: color || this.getEffectColor(type),
            velocity: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 }
        };
        this.effects.push(effect);
    }

    getEffectColor(type) {
        const colors = {
            'fire': '#ff4500',
            'water': '#00bfff',
            'earth': '#32cd32',
            'air': '#feca57',
            'hit': '#ffffff',
            'heal': '#00ff00'
        };
        return colors[type] || '#ffffff';
    }

    update() {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.life -= 0.05; // Fade out
            
            // Movimento simples
            effect.x += effect.velocity.x;
            effect.y += effect.velocity.y;

            if (effect.life <= 0) {
                this.effects.splice(i, 1);
            }
        }
    }

    draw() {
        this.ctx.save();
        this.effects.forEach(effect => {
            this.ctx.globalAlpha = effect.life;
            this.ctx.fillStyle = effect.color;
            this.ctx.strokeStyle = effect.color;

            switch (effect.type) {
                case 'fire':
                case 'hit':
                    // Partículas redondas
                    this.ctx.beginPath();
                    this.ctx.arc(effect.x, effect.y, effect.size * effect.life, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
                case 'water':
                    // Onda (anel)
                    this.ctx.beginPath();
                    this.ctx.lineWidth = 3;
                    this.ctx.arc(effect.x, effect.y, effect.size * (2 - effect.life), 0, Math.PI * 2);
                    this.ctx.stroke();
                    break;
                case 'earth':
                    // Blocos
                    const s = effect.size * effect.life;
                    this.ctx.fillRect(effect.x - s/2, effect.y - s/2, s, s);
                    break;
                case 'air':
                    // Espiral simples (representada por arco)
                    this.ctx.beginPath();
                    this.ctx.lineWidth = 2;
                    this.ctx.arc(effect.x, effect.y, effect.size * effect.life, 0, Math.PI * 1.5);
                    this.ctx.stroke();
                    break;
            }
        });
        this.ctx.restore();
    }
}
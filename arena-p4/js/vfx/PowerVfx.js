// Apresentação dos especiais. O combate continua em PowerFrames.js.
// Cada poder desenha carga → concentração → liberação → impacto → consequência.

export default class PowerVfx {
    constructor() {
        this.particles = [];
        this.max = 480;
        this.time = 0;
    }

    update() {
        this.time += 1;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= 1;
            p.x += p.vx || 0;
            p.y += p.vy || 0;
            p.vy = (p.vy || 0) + (p.gravity || 0);
            p.vx = (p.vx || 0) * (p.drag == null ? 1 : p.drag);
            p.vy = (p.vy || 0) * (p.drag == null ? 1 : p.drag);
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    emit(partial) {
        const p = {
            vx: 0,
            vy: 0,
            gravity: 0,
            drag: 1,
            layer: 'front',
            size: 3,
            rot: 0,
            ...partial
        };
        p.max = p.life;
        this.particles.push(p);
        if (this.particles.length > this.max) {
            this.particles.splice(0, this.particles.length - this.max);
        }
    }

    emitCast(player, spec, frame) {
        const cx = player.x + player.width / 2;
        const cy = player.y + player.height * 0.46;
        const feet = player.y + player.height;
        const dir = player.cast.facing;
        if (player.element === 'ignis') return this.emitIgnis(cx, cy, feet, frame, spec);
        if (player.element === 'marina') return this.emitMarina(cx, cy, frame, dir);
        if (player.element === 'terra') return this.emitTerra(cx, cy, feet, frame, spec);
        if (player.element === 'zephyr') return this.emitZephyr(player, cx, cy, feet, frame, dir, spec);
        return 0;
    }

    emitAura(player) {
        const power = player.activePower;
        if (!power || power.duration <= 0) return;
        const cx = player.x + player.width / 2;
        const cy = player.y + player.height * 0.5;
        const shown = player.cast ? player.cast.frame - 1 : 99;

        if (power.type === 'shield' && this.time % 10 === 0) {
            const amp = this.terraAmp(power.duration);
            this.emit({
                kind: 'stone',
                x: cx + (Math.random() - 0.5) * 36,
                y: cy + 10,
                vx: (Math.random() - 0.5) * 0.4,
                vy: -0.35 - Math.random() * 0.4,
                life: 28,
                size: 4 + Math.random() * 3,
                rot: Math.random() * 6,
                color: '#9aa392',
                color2: '#3dde6a',
                layer: 'front',
                gravity: 0.01
            });
            if (amp > 0.4 && Math.random() < amp) {
                this.emit({
                    kind: 'spark',
                    x: cx + (Math.random() - 0.5) * 20,
                    y: cy,
                    vy: -0.6,
                    life: 16,
                    size: 2,
                    color: '#d8ffc2',
                    layer: 'front'
                });
            }
        }

        if (power.type === 'tornado' && shown >= 16 && this.time % 4 === 0) {
            const stage = this.windStage(power.duration);
            const count = stage === 2 ? 3 : stage === 1 ? 2 : 1;
            for (let i = 0; i < count; i++) {
                const dir = player.facingRight ? 1 : -1;
                this.emit({
                    kind: 'speed',
                    x: cx + (Math.random() - 0.5) * 24,
                    y: cy + (Math.random() - 0.5) * 40,
                    vx: dir * (0.6 + stage),
                    life: 8 + stage * 2,
                    size: 8 + stage * 8,
                    color: stage === 0 ? 'rgba(255, 246, 208, 0.45)' : '#ffd454',
                    layer: 'front'
                });
            }
        }
    }

    emitFoam(wave) {
        if (wave.frame % 2 !== 0) return;
        this.emit({
            kind: 'drop',
            x: wave.x - wave.dir * wave.w * 0.15,
            y: wave.y - wave.h * 0.28,
            vx: -wave.dir * (0.3 + Math.random()),
            vy: -1.4 - Math.random() * 1.2,
            life: 14,
            size: 2 + Math.random() * 2,
            color: Math.random() < 0.5 ? '#e8fbff' : '#1ec8ff',
            gravity: 0.12,
            layer: 'front'
        });
    }

    impact(element, defender, dir) {
        const x = defender.x + defender.width / 2;
        const y = defender.y + defender.height * 0.45;
        if (element === 'ignis') this.impactFire(x, y);
        if (element === 'marina') this.impactWater(x, y, dir);
        if (element === 'terra') this.impactEarth(x, defender.y + defender.height);
        if (element === 'zephyr') this.impactWind(x, y, dir);
    }

    emitIgnis(cx, cy, feet, frame, spec) {
        if (frame <= 2) {
            for (let i = 0; i < 4; i++) {
                this.emit({
                    kind: 'spark',
                    x: cx + (Math.random() - 0.5) * 22,
                    y: cy + (Math.random() - 0.5) * 28,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: -0.8 - Math.random(),
                    life: 12,
                    size: 2,
                    color: i % 2 ? '#ffd27a' : '#ff6a1a',
                    layer: 'front'
                });
            }
            this.emit({
                kind: 'smoke',
                x: cx + (Math.random() - 0.5) * 10,
                y: cy - 8,
                vy: -0.7,
                life: 22,
                size: 10 + Math.random() * 6,
                color: 'rgba(90, 40, 20, 0.7)',
                layer: 'back'
            });
            this.emit({
                kind: 'dust',
                x: cx + (Math.random() - 0.5) * 16,
                y: feet - 8,
                vy: -0.3,
                life: 16,
                size: 3,
                color: 'rgba(40, 18, 12, 0.9)',
                layer: 'back',
                gravity: -0.01
            });
            return 0.6;
        }
        if (frame <= 5) return 2.2;
        if (frame <= 7) {
            for (let i = 0; i < 6; i++) {
                const a = Math.random() * Math.PI * 2;
                const dist = 30 + Math.random() * 16;
                const x = cx + Math.cos(a) * dist;
                const y = cy + Math.sin(a) * dist * 0.65;
                this.emit({
                    kind: 'spark',
                    x,
                    y,
                    vx: (cx - x) * 0.22,
                    vy: (cy - y) * 0.22,
                    life: 8,
                    size: 2.4,
                    color: '#ff6a1a',
                    layer: 'front'
                });
            }
            return 1.4;
        }
        if (frame === spec.frames.release) {
            this.emit({
                kind: 'flash',
                x: cx,
                y: cy,
                life: 4,
                size: 86,
                color: '#fff1c9',
                layer: 'front'
            });
            this.emit({
                kind: 'ring',
                x: cx,
                y: cy + 8,
                life: 10,
                size: spec.radius,
                grow: 3,
                color: '#ff6a1a',
                layer: 'front'
            });
            this.emit({
                kind: 'groundRing',
                x: cx,
                y: feet,
                life: 12,
                size: 18,
                grow: spec.radius / 8,
                color: 'rgba(255, 170, 70, 0.9)',
                layer: 'back'
            });
            for (let i = 0; i < 18; i++) {
                const a = (Math.PI * 2 * i) / 18;
                const speed = 2.2 + Math.random() * 3.4;
                this.emit({
                    kind: i % 3 === 0 ? 'smoke' : 'spark',
                    x: cx,
                    y: cy,
                    vx: Math.cos(a) * speed,
                    vy: Math.sin(a) * speed * 0.72,
                    life: 16 + Math.random() * 10,
                    size: i % 3 === 0 ? 12 : 3,
                    color: i % 2 ? '#ffd27a' : '#ff3b00',
                    gravity: i % 3 === 0 ? -0.02 : 0.04,
                    drag: 0.98,
                    layer: i % 3 === 0 ? 'back' : 'front'
                });
            }
            return spec.shake;
        }
        if (frame > spec.frames.release && frame <= spec.frames.visualEnd && frame % 2 === 0) {
            const spread = spec.radius * 0.85;
            this.emit({
                kind: 'flame',
                x: cx + (Math.random() - 0.5) * spread,
                y: feet,
                vy: -0.25,
                life: 18,
                size: 10 + Math.random() * 10,
                rot: (Math.random() - 0.5) * 0.4,
                color: '#ff6a1a',
                color2: '#ffd27a',
                layer: 'back'
            });
            this.emit({
                kind: 'spark',
                x: cx + (Math.random() - 0.5) * spread,
                y: feet - 4,
                vx: (Math.random() - 0.5) * 0.6,
                vy: -1.1 - Math.random(),
                life: 20,
                size: 2,
                color: '#ffb15a',
                gravity: -0.015,
                layer: 'front'
            });
        }
        return 0;
    }

    emitMarina(cx, cy, frame, dir) {
        if (frame <= 2) {
            for (let i = 0; i < 5; i++) {
                const a = this.time * 0.4 + i;
                this.emit({
                    kind: 'drop',
                    x: cx + Math.cos(a) * 20,
                    y: cy + Math.sin(a) * 16,
                    vy: -0.2,
                    life: 10,
                    size: 3,
                    color: i % 2 ? '#1ec8ff' : '#e8fbff',
                    layer: 'front'
                });
            }
        } else if (frame <= 5) {
            const gather = 1 - (frame - 3) / 4;
            for (let i = 0; i < 4; i++) {
                const a = frame + i * 1.4;
                this.emit({
                    kind: 'drop',
                    x: cx + Math.cos(a) * 22 * gather + dir * (8 + frame),
                    y: cy + Math.sin(a) * 12 * gather,
                    vx: dir * 0.8,
                    life: 8,
                    size: 3.2,
                    color: '#7ee7ff',
                    layer: 'front'
                });
            }
        }
        return frame === 8 ? 3 : 0;
    }

    emitTerra(cx, cy, feet, frame, spec) {
        if (frame >= 3 && frame <= 5) {
            this.emit({
                kind: 'stone',
                x: cx + (Math.random() - 0.5) * 40,
                y: feet,
                vy: -1.1 - Math.random(),
                life: 14,
                size: 5,
                rot: Math.random() * 4,
                color: '#8d8678',
                layer: 'front',
                gravity: 0.08
            });
        }
        if (frame === spec.frames.release) {
            this.emit({
                kind: 'groundRing',
                x: cx,
                y: feet,
                life: 10,
                size: 12,
                grow: spec.radius / 7,
                color: '#3dde6a',
                layer: 'back'
            });
            this.emit({
                kind: 'flash',
                x: cx,
                y: cy,
                life: 3,
                size: 48,
                color: '#d8ffc2',
                layer: 'front'
            });
            for (let i = 0; i < 12; i++) {
                this.emit({
                    kind: i % 2 ? 'dust' : 'stone',
                    x: cx + (Math.random() - 0.5) * 30,
                    y: feet - 4,
                    vx: (Math.random() - 0.5) * 2.4,
                    vy: -1.5 - Math.random() * 2,
                    life: 16,
                    size: i % 2 ? 7 : 5,
                    rot: Math.random() * 5,
                    color: i % 2 ? 'rgba(120, 100, 70, 0.8)' : '#6e675c',
                    gravity: 0.12,
                    layer: 'front'
                });
            }
            return spec.shake;
        }
        if (frame >= 6 && frame <= 7) return 1.6;
        return 0;
    }

    emitZephyr(player, cx, cy, feet, frame, dir, spec) {
        if (frame >= 3 && frame < spec.dashStart) {
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 26 + Math.random() * 22;
                const x = cx + Math.cos(angle) * dist;
                const y = cy + Math.sin(angle) * dist * 0.7;
                this.emit({
                    kind: 'dust',
                    x,
                    y,
                    vx: (cx - x) * 0.2,
                    vy: (cy - y) * 0.2,
                    life: 8,
                    size: 3,
                    color: 'rgba(255, 226, 150, 0.85)',
                    layer: 'front'
                });
            }
        }
        if (frame >= spec.dashStart && frame < spec.dashEnd) {
            this.emit({
                kind: 'ghost',
                x: cx,
                y: player.y + player.height / 2,
                w: player.width,
                h: player.height,
                life: 8,
                color: 'rgba(255, 246, 208, 0.85)',
                layer: 'back'
            });
            for (let i = 0; i < 3; i++) {
                this.emit({
                    kind: 'speed',
                    x: cx - dir * (8 + Math.random() * 36),
                    y: cy + (Math.random() - 0.5) * 46,
                    vx: -dir * (5 + Math.random() * 3),
                    life: 6,
                    size: 16 + Math.random() * 18,
                    color: 'rgba(255,255,255,0.75)',
                    layer: 'front'
                });
            }
            this.emit({
                kind: 'dust',
                x: cx - dir * 16,
                y: feet,
                vx: -dir * 1.2,
                vy: -0.4,
                life: 12,
                size: 8,
                color: 'rgba(220, 210, 170, 0.7)',
                layer: 'back',
                gravity: 0.02
            });
            return frame === spec.dashStart ? spec.shake : 1.3;
        }
        return 0;
    }

    impactFire(x, y) {
        this.emit({ kind: 'flash', x, y, life: 3, size: 36, color: '#ffd27a', layer: 'front' });
        for (let i = 0; i < 8; i++) {
            const a = Math.random() * Math.PI * 2;
            this.emit({
                kind: 'spark',
                x,
                y,
                vx: Math.cos(a) * 2,
                vy: Math.sin(a) * 2,
                life: 12,
                size: 2.5,
                color: '#ff6a1a',
                layer: 'front'
            });
        }
    }

    impactWater(x, y, dir) {
        this.emit({ kind: 'flash', x, y, life: 4, size: 42, color: '#e8fbff', layer: 'front' });
        for (let i = 0; i < 14; i++) {
            const side = i % 2 === 0 ? 1 : -1;
            this.emit({
                kind: i % 4 === 0 ? 'foam' : 'drop',
                x,
                y,
                vx: side * (1.5 + Math.random() * 3.5) - dir * 0.4,
                vy: -2.2 - Math.random() * 2.4,
                life: 16,
                size: 3 + Math.random() * 2,
                color: i % 2 ? '#e8fbff' : '#1ec8ff',
                gravity: 0.16,
                layer: 'front'
            });
        }
    }

    impactEarth(x, feet) {
        this.emit({
            kind: 'groundRing',
            x,
            y: feet,
            life: 8,
            size: 8,
            grow: 4,
            color: '#d8ffc2',
            layer: 'back'
        });
        for (let i = 0; i < 8; i++) {
            this.emit({
                kind: 'dust',
                x: x + (Math.random() - 0.5) * 16,
                y: feet,
                vx: (Math.random() - 0.5) * 2,
                vy: -1 - Math.random() * 1.5,
                life: 14,
                size: 6,
                color: 'rgba(140, 120, 80, 0.75)',
                gravity: 0.1,
                layer: 'front'
            });
        }
    }

    impactWind(x, y, dir) {
        this.emit({ kind: 'flash', x, y, life: 3, size: 30, color: '#fff6d0', layer: 'front' });
        for (let i = 0; i < 7; i++) {
            this.emit({
                kind: 'speed',
                x: x - dir * 6,
                y: y + (i - 3) * 7,
                vx: dir * (4 + Math.random() * 2),
                life: 8,
                size: 18 + Math.random() * 10,
                color: '#ffd454',
                layer: 'front'
            });
        }
        this.emit({
            kind: 'dust',
            x,
            y: y + 20,
            vx: dir * 1.5,
            vy: -0.5,
            life: 12,
            size: 8,
            color: 'rgba(230, 220, 180, 0.7)',
            layer: 'back'
        });
    }

    drawLayer(ctx, layer) {
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            if (p.layer !== layer) continue;
            ctx.save();
            this.drawParticle(ctx, p);
            ctx.restore();
        }
    }

    drawParticle(ctx, p) {
        const alpha = Math.max(0, p.life / p.max);
        ctx.globalAlpha = alpha;
        if (p.kind === 'spark' || p.kind === 'flame' || p.kind === 'flash') {
            ctx.globalCompositeOperation = 'lighter';
        }
        if (p.kind === 'spark') {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        if (p.kind === 'smoke' || p.kind === 'dust' || p.kind === 'flash') {
            const radius = p.kind === 'flash' ? p.size * (0.55 + (1 - alpha) * 0.5) : p.size;
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
            g.addColorStop(0, p.color);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        if (p.kind === 'flame') {
            this.flame(ctx, p.x, p.y, p.size * (0.7 + alpha), p.rot || 0, p.size * 0.35, p.color, p.color2);
            return;
        }
        if (p.kind === 'drop' || p.kind === 'foam') {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, p.size, p.size * (p.kind === 'foam' ? 0.6 : 1.3), 0, 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        if (p.kind === 'stone') {
            ctx.fillStyle = p.color;
            this.stone(ctx, p.x, p.y, p.size, p.rot + this.time * 0.05);
            ctx.fill();
            if (p.color2) {
                ctx.globalAlpha = alpha * 0.45;
                ctx.strokeStyle = p.color2;
                ctx.lineWidth = 1;
                this.stone(ctx, p.x, p.y, p.size + 1, p.rot + this.time * 0.05);
                ctx.stroke();
            }
            return;
        }
        if (p.kind === 'ring' || p.kind === 'groundRing') {
            const radius = p.size + (p.max - p.life) * (p.grow || 0);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.kind === 'ring' ? 4 * alpha : 2;
            ctx.beginPath();
            if (p.kind === 'groundRing') ctx.ellipse(p.x, p.y, radius, radius * 0.28, 0, 0, Math.PI * 2);
            else ctx.arc(p.x, p.y, Math.max(2, radius), 0, Math.PI * 2);
            ctx.stroke();
            return;
        }
        if (p.kind === 'speed') {
            const sign = Math.sign(p.vx || 1);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + sign * p.size, p.y);
            ctx.stroke();
            return;
        }
        if (p.kind === 'ghost') {
            ctx.globalAlpha = alpha * 0.28;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, p.w * 0.42, p.h * 0.48, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawCastBack(ctx, player, spec, frame) {
        const cx = player.x + player.width / 2;
        const cy = player.y + player.height * 0.46;
        const feet = player.y + player.height;
        const dir = player.cast.facing;
        if (player.element === 'ignis') this.drawIgnisBack(ctx, cx, cy, frame, spec);
        if (player.element === 'marina') this.drawMarinaBack(ctx, cx, cy, frame, dir, spec);
        if (player.element === 'terra') this.drawTerraBack(ctx, cx, feet, frame, spec);
        if (player.element === 'zephyr') this.drawZephyrBack(ctx, cx, cy, frame, dir, spec);
    }

    drawCastFront(ctx, player, spec, frame) {
        const cx = player.x + player.width / 2;
        const cy = player.y + player.height * 0.46;
        const feet = player.y + player.height;
        const dir = player.cast.facing;
        if (player.element === 'ignis') this.drawIgnisFront(ctx, cx, cy, frame, spec);
        if (player.element === 'marina') this.drawMarinaFront(ctx, cx, cy, feet, frame, dir, spec);
        if (player.element === 'terra') this.drawTerraFront(ctx, cx, cy, frame, spec);
        if (player.element === 'zephyr') this.drawZephyrFront(ctx, cx, cy, frame, dir, spec);
    }

    drawStatus(ctx, player, layer) {
        const power = player.activePower;
        if (player.slowFrames > 0 && layer === 'front') this.drawSlow(ctx, player);
        if (!power || power.duration <= 0) return;
        if (power.type === 'shield') this.drawShield(ctx, player, power.duration, layer);
        if (power.type === 'tornado') {
            const shown = player.cast ? player.cast.frame - 1 : 99;
            if (shown >= 16) this.drawWindBuff(ctx, player, power.duration, layer);
        }
    }

    drawIgnisBack(ctx, cx, cy, frame, spec) {
        if (frame > spec.frames.release + 4) return;
        ctx.save();
        const hot = frame === spec.frames.release ? 0.7 : frame >= 6 ? 0.22 : 0.38;
        ctx.globalAlpha = hot;
        ctx.strokeStyle = 'rgba(255, 140, 40, 0.8)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const radius = 18 + i * 8 + (frame < 6 ? frame : 6);
            for (let a = 0; a <= Math.PI * 2; a += 0.35) {
                const wob = Math.sin(a * 4 + frame * 0.9 + i) * 3;
                const x = cx + Math.cos(a) * (radius + wob);
                const y = cy + Math.sin(a) * (radius * 0.62 + wob);
                if (a === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        ctx.restore();
    }

    drawIgnisFront(ctx, cx, cy, frame, spec) {
        ctx.save();
        if (frame <= 7) {
            const hot = frame >= 6 ? 0.85 : 0.4 + frame * 0.08;
            const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 40);
            glow.addColorStop(0, `rgba(255, 210, 120, ${hot})`);
            glow.addColorStop(0.5, `rgba(255, 70, 10, ${hot * 0.45})`);
            glow.addColorStop(1, 'rgba(255, 40, 0, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 26, 42, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        if (frame >= 3 && frame <= 7) {
            const count = 6;
            const pull = frame >= 6 ? (frame - 5) * 12 : 0;
            for (let i = 0; i < count; i++) {
                const a = frame * 0.7 + (i / count) * Math.PI * 2;
                const radius = Math.max(8, 36 - pull);
                const x = cx + Math.cos(a) * radius;
                const y = cy + Math.sin(a) * radius * 0.62;
                const rot = frame >= 6 ? a - Math.PI / 2 : a + Math.PI / 2;
                this.flame(ctx, x, y, 16 - pull * 0.3, rot, 5, i % 2 ? '#ff6a1a' : '#ffd27a', '#fff1c2');
            }
        }
        if (frame >= spec.frames.release && frame <= spec.frames.release + 8) {
            const k = (frame - spec.frames.release) / 8;
            ctx.globalAlpha = 1 - k;
            ctx.strokeStyle = '#ffd27a';
            ctx.lineWidth = 5 - k * 3;
            ctx.beginPath();
            ctx.arc(cx, cy + 6, spec.radius * (1 + k * 0.16), 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = '#ff6a1a';
            ctx.lineWidth = 2;
            const tongues = 8;
            for (let i = 0; i < tongues; i++) {
                const a = (Math.PI * 2 * i) / tongues + frame * 0.08;
                const len = 16 + k * (spec.radius * 0.45);
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len * 0.7);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    drawMarinaBack(ctx, cx, cy, frame, dir, spec) {
        if (frame >= spec.frames.release) return;
        ctx.save();
        const gather = frame <= 2 ? 1 : Math.max(0.15, 1 - (frame - 2) / 5);
        for (let i = 0; i < 6; i++) {
            const a = frame * 0.55 + i;
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = i % 2 ? '#1ec8ff' : '#e8fbff';
            ctx.beginPath();
            ctx.ellipse(
                cx + Math.cos(a) * 18 * gather + dir * frame * 1.5,
                cy + Math.sin(a) * 14 * gather,
                4,
                6,
                a,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        ctx.restore();
    }

    drawMarinaFront(ctx, cx, cy, feet, frame, dir, spec) {
        if (frame < 6 || frame >= spec.frames.release) return;
        const grow = (frame - 5) / 2;
        ctx.save();
        ctx.globalAlpha = 0.82;
        const mass = ctx.createLinearGradient(0, cy - 50, 0, feet);
        mass.addColorStop(0, 'rgba(232, 251, 255, 0.2)');
        mass.addColorStop(0.4, 'rgba(30, 200, 255, 0.72)');
        mass.addColorStop(1, 'rgba(10, 80, 130, 0.45)');
        ctx.fillStyle = mass;
        const baseX = cx - dir * 26;
        for (let row = 0; row < 4; row++) {
            ctx.beginPath();
            ctx.ellipse(baseX, feet - 16 - row * 18 * grow, (34 + row * 12) * grow, 12, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.ellipse(baseX + dir * 10, feet - 58 * grow, 18 * grow, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawTerraBack(ctx, cx, feet, frame, spec) {
        ctx.save();
        ctx.translate(cx, feet);
        if (frame <= 7) {
            ctx.strokeStyle = '#d8ffc2';
            ctx.globalAlpha = 0.8;
            ctx.lineWidth = 2;
            const reach = 18 + frame * 6;
            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.moveTo(i * 14, 0);
                ctx.lineTo(i * 14 + (i === 0 ? 4 : i * 3), -6 - Math.abs(i));
                ctx.lineTo(i * 16 + 8, 2);
                ctx.stroke();
            }
            ctx.globalAlpha = 0.35;
            ctx.beginPath();
            ctx.ellipse(0, 2, reach, 8, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (frame >= 3 && frame <= 7) {
            ctx.fillStyle = '#8a8478';
            const lift = (frame - 2) * 7;
            for (let i = -2; i <= 2; i++) {
                if (frame >= 6) {
                    const a = frame * 0.8 + i;
                    this.stone(ctx, Math.cos(a) * 24, -28 + Math.sin(a) * 10, 6, a);
                } else {
                    this.stone(ctx, i * 14, -lift - Math.abs(i) * 2, 6, i);
                }
                ctx.fill();
            }
        }
        if (frame >= spec.frames.release && frame <= spec.frames.release + 6) {
            const k = (frame - spec.frames.release) / 6;
            ctx.globalAlpha = 0.7 * (1 - k);
            ctx.strokeStyle = '#3dde6a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(0, 0, spec.radius * (0.4 + k * 0.7), 10 + k * 6, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawTerraFront(ctx, cx, cy, frame, spec) {
        if (frame < spec.frames.release || frame > spec.frames.release + 8) return;
        const k = Math.min(1, (frame - spec.frames.release) / 3);
        ctx.save();
        ctx.globalAlpha = 0.9 * (1 - (frame - spec.frames.release) / 9);
        ctx.fillStyle = '#6d675c';
        ctx.strokeStyle = '#d8ffc2';
        ctx.lineWidth = 2;
        const plates = 3;
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < plates; i++) {
                const open = (1 - k) * 28;
                const x = cx + side * (16 + i * 8 + open);
                const y = cy - 10 + i * 16;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + side * 14, y + 6);
                ctx.lineTo(x + side * 10, y + 28);
                ctx.lineTo(x - side * 2, y + 22);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    drawZephyrBack(ctx, cx, cy, frame, dir, spec) {
        if (frame > 5) return;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 246, 208, 0.8)';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7;
        const n = frame <= 2 ? 4 : 7;
        for (let i = 0; i < n; i++) {
            const y = cy + (i - n / 2) * 8;
            const pull = frame >= 3 ? (frame - 2) * 6 : 0;
            ctx.beginPath();
            ctx.moveTo(cx + dir * (18 + i * 3), y);
            ctx.quadraticCurveTo(cx, y + Math.sin(frame + i) * 4, cx - dir * (10 + pull), cy);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawZephyrFront(ctx, cx, cy, frame, dir, spec) {
        if (frame < spec.dashStart || frame >= spec.dashEnd) return;
        ctx.save();
        ctx.strokeStyle = '#ffd454';
        ctx.fillStyle = 'rgba(255, 246, 208, 0.25)';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.9;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const radius = 16 + i * 12;
            const a0 = this.time * 0.45 + i;
            ctx.arc(cx - dir * 4, cy, radius, a0, a0 + Math.PI * 1.35);
            ctx.stroke();
        }
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(cx, cy, spec.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawShield(ctx, player, duration, layer) {
        const amp = this.terraAmp(duration);
        const cx = player.x + player.width / 2;
        const cy = player.y + player.height * 0.5;
        const feet = player.y + player.height;
        ctx.save();
        if (layer === 'back') {
            ctx.globalAlpha = 0.28 * amp;
            const glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, 48);
            glow.addColorStop(0, 'rgba(61, 222, 106, 0.9)');
            glow.addColorStop(1, 'rgba(61, 222, 106, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 32 + amp * 8, 48 + amp * 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 0.55 * amp;
            ctx.strokeStyle = '#d8ffc2';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - 18, feet);
            ctx.lineTo(cx - 8, feet - 8);
            ctx.lineTo(cx, feet - 2);
            ctx.moveTo(cx + 6, feet);
            ctx.lineTo(cx + 16, feet - 7);
            ctx.stroke();
        } else {
            const count = amp > 0.75 ? 6 : amp > 0.45 ? 4 : 2;
            ctx.fillStyle = '#8d877b';
            for (let i = 0; i < count; i++) {
                const a = this.time * (0.07 + amp * 0.04) + (i / count) * Math.PI * 2;
                const radius = 30 + amp * 8;
                ctx.globalAlpha = 0.9 * amp;
                this.stone(ctx, cx + Math.cos(a) * radius, cy + Math.sin(a) * radius * 0.55, 5, a);
                ctx.fill();
            }
            ctx.globalAlpha = 0.7 * amp;
            ctx.fillStyle = '#d8ffc2';
            for (let i = 0; i < count; i++) {
                const a = -this.time * 0.09 + i;
                ctx.beginPath();
                ctx.arc(cx + Math.cos(a) * 18, cy + Math.sin(a) * 22, 1.6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }

    drawWindBuff(ctx, player, duration, layer) {
        const stage = this.windStage(duration);
        const cx = player.x + player.width / 2;
        const cy = player.y + player.height * 0.48;
        const alpha = [0.55, 0.75, 0.92][stage];
        const lines = [3, 5, 8][stage];
        const len = [18, 32, 46][stage];
        const reach = [28, 40, 54][stage];
        ctx.save();
        if (layer === 'back') {
            ctx.globalAlpha = [0.28, 0.4, 0.55][stage];
            ctx.fillStyle = '#ffd454';
            ctx.beginPath();
            ctx.ellipse(cx, cy, reach * 0.7, reach, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.globalAlpha = alpha * 0.55;
            ctx.strokeStyle = '#ffd454';
            ctx.lineWidth = [2, 3, 4][stage];
            ctx.beginPath();
            ctx.ellipse(cx, cy, reach, reach * 1.15, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = stage === 0 ? 'rgba(255,246,208,0.9)' : '#fff1b0';
            ctx.lineWidth = [2, 3, 4][stage];
            for (let i = 0; i < lines; i++) {
                const y = cy + (i - (lines - 1) / 2) * (10 + stage * 2);
                const sway = Math.sin(this.time * 0.3 + i) * (3 + stage);
                ctx.beginPath();
                ctx.moveTo(cx - len, y + sway);
                ctx.quadraticCurveTo(cx, y - sway, cx + len, y + sway * 0.4);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    drawSlow(ctx, player) {
        const cx = player.x + player.width / 2;
        const fade = Math.min(1, player.slowFrames / 20);
        ctx.save();
        ctx.globalAlpha = 0.75 * fade;
        ctx.fillStyle = '#7ee7ff';
        for (let i = 0; i < 3; i++) {
            const y = player.y + 16 + ((this.time * 2 + i * 18) % (player.height - 10));
            ctx.beginPath();
            ctx.ellipse(cx + (i - 1) * 10, y, 2.2, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawWave(ctx, wave) {
        const k = Math.max(0.25, 1 - wave.frame / wave.life);
        const dir = wave.dir;
        const crest = Math.sin(wave.frame * 0.7) * 8;
        ctx.save();
        ctx.translate(wave.x, wave.y);

        ctx.globalAlpha = 0.28 * k;
        ctx.strokeStyle = '#7ee7ff';
        ctx.lineWidth = 2;
        for (let s = 1; s <= 2; s++) {
            ctx.beginPath();
            ctx.ellipse(-dir * (16 + s * 18), 10, wave.w * 0.22, 7, 0, Math.PI, 0);
            ctx.stroke();
        }

        const body = ctx.createLinearGradient(0, -wave.h / 2, 0, wave.h / 2);
        body.addColorStop(0, 'rgba(232, 251, 255, 0.05)');
        body.addColorStop(0.42, 'rgba(30, 200, 255, 0.62)');
        body.addColorStop(1, 'rgba(6, 60, 110, 0.28)');
        ctx.globalAlpha = k;
        ctx.fillStyle = body;
        ctx.strokeStyle = '#e8fbff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-wave.w / 2, 8);
        ctx.quadraticCurveTo(-wave.w * 0.15, -wave.h / 2 + crest, wave.w * 0.05 * dir, -wave.h / 3);
        ctx.quadraticCurveTo(wave.w * 0.35 * dir, crest, wave.w / 2 * dir, 10);
        ctx.quadraticCurveTo(0, wave.h / 3, -wave.w / 2, 8);
        ctx.fill();
        ctx.stroke();

        ctx.globalAlpha = 0.9 * k;
        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        ctx.beginPath();
        ctx.ellipse(wave.w * 0.18 * dir, -wave.h * 0.28 + crest * 0.25, 14, 6, dir * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e8fbff';
        for (let i = 0; i < 5; i++) {
            ctx.globalAlpha = k * 0.85;
            ctx.beginPath();
            ctx.arc(dir * (i * 9 - 12), -12 - ((wave.frame * 3 + i * 5) % 18), 2.3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    terraAmp(duration) {
        if (duration > 60) return 1;
        if (duration > 30) return 0.75;
        if (duration > 10) return 0.48;
        return Math.max(0.12, duration / 10 * 0.32);
    }

    windStage(duration) {
        if (duration >= 50) return 2;
        if (duration >= 25) return 1;
        return 0;
    }

    flame(ctx, x, y, len, rot, width, color, core) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(width, -len * 0.45, 0, -len);
        ctx.quadraticCurveTo(-width, -len * 0.45, 0, 0);
        ctx.fill();
        if (core) {
            ctx.fillStyle = core;
            ctx.beginPath();
            ctx.moveTo(0, -len * 0.15);
            ctx.quadraticCurveTo(width * 0.4, -len * 0.5, 0, -len * 0.75);
            ctx.quadraticCurveTo(-width * 0.4, -len * 0.5, 0, -len * 0.15);
            ctx.fill();
        }
        ctx.restore();
    }

    stone(ctx, x, y, radius, rot) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const a = rot + (i / 5) * Math.PI * 2;
            const r = radius * (i % 2 ? 0.72 : 1);
            const px = x + Math.cos(a) * r;
            const py = y + Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
    }
}

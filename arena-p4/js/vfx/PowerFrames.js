// Sequência de frames da liberação de cada poder.
// frame 0 = carga. releaseAt = o frame em que o golpe existe.
// castLength = último frame desenhado no corpo.

export const POWER_CASTS = {
    ignis: {
        name: 'FIRESTORM',
        color: '#ff6a1a',
        core: '#ffd27a',
        castLength: 30,
        releaseAt: 8,
        cooldown: 180,
        damage: 28,
        knockback: 9,
        lift: -7,
        hitLock: 16,
        radius: 118,
        shake: 8
    },
    marina: {
        name: 'TSUNAMI',
        color: '#1ec8ff',
        core: '#e8fbff',
        castLength: 24,
        releaseAt: 8,
        cooldown: 180,
        damage: 16,
        knockback: 18,
        lift: -4,
        hitLock: 16,
        slowFrames: 50,
        waveLife: 26,
        waveSpeed: 11,
        waveW: 78,
        waveH: 96,
        shake: 6
    },
    terra: {
        name: 'MANTO',
        color: '#3dde6a',
        core: '#d8ffc2',
        castLength: 26,
        releaseAt: 8,
        cooldown: 320,
        damage: 10,
        knockback: 8,
        lift: -4,
        hitLock: 16,
        radius: 72,
        shieldDuration: 90,
        damageReduction: 0.45,
        knockbackKeep: 0.5,
        shake: 7
    },
    zephyr: {
        name: 'TORNADO',
        color: '#ffd454',
        core: '#fff6d0',
        castLength: 28,
        releaseAt: 6,
        dashStart: 6,
        dashEnd: 16,
        cooldown: 160,
        damage: 14,
        knockback: 8,
        lift: -3,
        hitLock: 14,
        radius: 52,
        boostFrames: 70,
        speedBoost: 1.65,
        shake: 5
    }
};

export default class PowerShow {
    constructor() {
        this.waves = [];
        this.callout = null;
    }

    onCast(player) {
        const spec = POWER_CASTS[player.element];
        if (!spec) return;
        this.callout = { name: spec.name, color: spec.color, life: 42, element: player.element };
    }

    applyMotion(player) {
        const spec = POWER_CASTS[player.element];
        if (!player.cast || !spec) return;
        const f = player.cast.frame;
        const dir = player.cast.facing;

        if (player.element === 'zephyr' && f >= spec.dashStart && f < spec.dashEnd) {
            player.velocityX = dir * 13;
            player.velocityY *= 0.35;
            return;
        }
        if (f < spec.releaseAt) {
            player.velocityX *= 0.2;
        }
    }

    // Roda depois da física. Devolve os golpes que nasceram neste frame.
    resolve(players) {
        const hits = [];

        players.forEach((player) => {
            if (!player.cast) return;
            const spec = POWER_CASTS[player.element];
            if (!spec) return;
            const foe = players.find((p) => p !== player);
            const f = player.cast.frame;

            if (f === spec.releaseAt && foe) {
                if (player.element === 'marina') {
                    this.waves.push(this.makeWave(player, spec));
                } else if (player.element === 'ignis' || player.element === 'terra') {
                    if (this.circleHits(player, foe, spec.radius)) {
                        hits.push({ attacker: player, defender: foe, spec });
                    }
                } else if (player.element === 'zephyr') {
                    player.cast.dashed = false;
                }

                if (player.element === 'terra') {
                    player.activePower = { type: 'shield', duration: spec.shieldDuration };
                    player.damageReduction = spec.damageReduction;
                }
                if (player.element === 'zephyr') {
                    player.activePower = { type: 'tornado', duration: spec.boostFrames };
                }
            }

            if (player.element === 'zephyr' && foe && f >= spec.dashStart && f < spec.dashEnd && !player.cast.dashed) {
                if (this.circleHits(player, foe, spec.radius)) {
                    player.cast.dashed = true;
                    hits.push({ attacker: player, defender: foe, spec });
                }
            }

            player.cast.frame += 1;
            if (player.cast.frame >= spec.castLength) {
                player.cast = null;
            }
        });

        for (let i = this.waves.length - 1; i >= 0; i--) {
            const wave = this.waves[i];
            wave.x += wave.vx;
            wave.frame += 1;
            const foe = players.find((p) => p !== wave.owner);
            if (foe && !wave.hit && this.rectHits(wave, foe)) {
                wave.hit = true;
                hits.push({ attacker: wave.owner, defender: foe, spec: wave.spec });
            }
            if (wave.frame >= wave.life) this.waves.splice(i, 1);
        }

        if (this.callout) {
            this.callout.life -= 1;
            if (this.callout.life <= 0) this.callout = null;
        }

        return hits;
    }

    makeWave(player, spec) {
        const dir = player.cast.facing;
        return {
            owner: player,
            spec,
            x: player.x + player.width / 2 + dir * 36,
            y: player.y + player.height * 0.55,
            w: spec.waveW,
            h: spec.waveH,
            vx: dir * spec.waveSpeed,
            frame: 0,
            life: spec.waveLife,
            hit: false,
            dir
        };
    }

    circleHits(attacker, defender, radius) {
        const ax = attacker.x + attacker.width / 2;
        const ay = attacker.y + attacker.height / 2;
        const dx = (defender.x + defender.width / 2) - ax;
        const dy = (defender.y + defender.height / 2) - ay;
        const reach = radius + Math.min(defender.width, defender.height) * 0.35;
        return dx * dx + dy * dy <= reach * reach;
    }

    rectHits(wave, defender) {
        const left = wave.x - wave.w / 2;
        const top = wave.y - wave.h / 2;
        return left < defender.x + defender.width &&
            left + wave.w > defender.x &&
            top < defender.y + defender.height &&
            top + wave.h > defender.y;
    }

    drawBehind(ctx, player) {
        if (!player.cast) return;
        const spec = POWER_CASTS[player.element];
        if (!spec) return;
        const f = player.cast.frame;
        if (f >= spec.releaseAt) return;
        const cx = player.x + player.width / 2;
        const cy = player.y + player.height / 2;
        const t = f / spec.releaseAt;
        ctx.save();
        ctx.globalAlpha = 0.35 + t * 0.4;
        ctx.strokeStyle = spec.color;
        ctx.fillStyle = spec.core;
        ctx.lineWidth = 2;
        const rings = 3;
        for (let i = 0; i < rings; i++) {
            const wobble = Math.sin(f * 0.8 + i) * 4;
            const r = 10 + i * 8 + t * 18 + wobble;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawFront(ctx, player) {
        if (!player.cast) return;
        const spec = POWER_CASTS[player.element];
        if (!spec) return;
        const f = player.cast.frame;
        const cx = player.x + player.width / 2;
        const cy = player.y + player.height * 0.45;
        const dir = player.cast.facing;

        ctx.save();
        if (player.element === 'ignis') this.drawIgnis(ctx, cx, cy, f, dir, spec);
        if (player.element === 'marina') this.drawMarinaCharge(ctx, cx, cy, f, dir, spec);
        if (player.element === 'terra') this.drawTerra(ctx, cx, player.y + player.height, f, spec);
        if (player.element === 'zephyr') this.drawZephyr(ctx, cx, cy, f, dir, spec);
        ctx.restore();

        if (f < 18) {
            ctx.save();
            ctx.globalAlpha = 1 - f / 18;
            ctx.fillStyle = spec.core;
            ctx.font = 'bold 13px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(spec.name, cx, player.y - 28);
            ctx.restore();
        }
    }

    drawIgnis(ctx, cx, cy, frame, dir, spec) {
        const pose = Math.min(7, Math.floor(frame / 3));
        ctx.translate(cx, cy);
        if (pose < 3) {
            ctx.globalAlpha = 0.85;
            for (let i = 0; i < 6; i++) {
                const a = (frame * 0.45 + i) * 0.9;
                const r = 8 + pose * 6;
                ctx.fillStyle = i % 2 ? spec.color : spec.core;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * r, Math.sin(a) * r * 0.65, 3 + pose, 0, Math.PI * 2);
                ctx.fill();
            }
            return;
        }
        const boom = (pose - 2) / 5;
        ctx.globalAlpha = 1 - boom * 0.75;
        ctx.strokeStyle = spec.color;
        ctx.fillStyle = spec.core;
        ctx.lineWidth = 4 - boom * 2;
        ctx.beginPath();
        ctx.arc(dir * 10, 6, 18 + boom * spec.radius, 0, Math.PI * 2);
        ctx.stroke();
        const tongues = 8;
        for (let i = 0; i < tongues; i++) {
            const a = (Math.PI * 2 * i) / tongues + frame * 0.05;
            const len = 20 + boom * (spec.radius - 10);
            ctx.beginPath();
            ctx.moveTo(dir * 10, 6);
            ctx.lineTo(dir * 10 + Math.cos(a) * len, 6 + Math.sin(a) * len * 0.72);
            ctx.stroke();
        }
    }

    drawMarinaCharge(ctx, cx, cy, frame, dir, spec) {
        if (frame >= spec.releaseAt) return;
        ctx.translate(cx, cy);
        ctx.globalAlpha = 0.9;
        for (let i = 0; i < 5; i++) {
            const gather = 1 - frame / spec.releaseAt;
            const a = frame * 0.5 + i;
            ctx.fillStyle = i % 2 ? spec.color : spec.core;
            ctx.beginPath();
            ctx.ellipse(
                Math.cos(a) * 16 * gather + dir * 8,
                Math.sin(a) * 10,
                5,
                3,
                a,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }

    drawTerra(ctx, cx, feet, frame, spec) {
        const pose = Math.min(6, Math.floor(frame / 3));
        ctx.translate(cx, feet);
        if (pose < 3) {
            ctx.fillStyle = spec.color;
            ctx.globalAlpha = 0.9;
            for (let i = -2; i <= 2; i++) {
                const h = 6 + pose * 8 + Math.abs(i);
                ctx.fillRect(i * 14 - 5, -h, 10, h);
            }
            return;
        }
        const open = (pose - 2) / 4;
        ctx.globalAlpha = 0.85 - open * 0.4;
        ctx.strokeStyle = spec.color;
        ctx.fillStyle = 'rgba(61, 222, 106, 0.18)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, -28, 28 + open * 54, 36 + open * 20, 0, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -28, 16 + open * 40, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawZephyr(ctx, cx, cy, frame, dir, spec) {
        const pose = Math.min(8, Math.floor(frame / 3));
        ctx.translate(cx, cy);
        ctx.strokeStyle = spec.color;
        ctx.fillStyle = spec.core;
        ctx.lineWidth = 2;
        ctx.globalAlpha = pose < 2 ? 0.7 : 0.9;
        const turns = pose < 2 ? 1 : 2 + (pose - 2);
        for (let i = 0; i < turns; i++) {
            ctx.beginPath();
            ctx.arc(dir * pose * 2, 0, 12 + i * 10, frame * 0.4, frame * 0.4 + Math.PI * 1.4);
            ctx.stroke();
        }
        if (pose >= 2) {
            ctx.globalAlpha = 0.8;
            for (let i = 0; i < 4; i++) {
                const tail = -dir * (16 + i * 14 + pose * 3);
                ctx.beginPath();
                ctx.ellipse(tail, (i - 1.5) * 8, 10 + pose, 3, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawWaves(ctx) {
        this.waves.forEach((wave) => {
            const k = 1 - wave.frame / wave.life;
            ctx.save();
            ctx.translate(wave.x, wave.y);
            ctx.globalAlpha = Math.max(0.25, k);
            ctx.fillStyle = 'rgba(30, 200, 255, 0.35)';
            ctx.strokeStyle = '#e8fbff';
            ctx.lineWidth = 2;
            const crest = Math.sin(wave.frame * 0.7) * 8;
            ctx.beginPath();
            ctx.moveTo(-wave.w / 2, 8);
            ctx.quadraticCurveTo(-wave.w * 0.15, -wave.h / 2 + crest, wave.w * 0.05 * wave.dir, -wave.h / 3);
            ctx.quadraticCurveTo(wave.w * 0.35 * wave.dir, crest, wave.w / 2 * wave.dir, 10);
            ctx.quadraticCurveTo(0, wave.h / 3, -wave.w / 2, 8);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#e8fbff';
            for (let i = 0; i < 4; i++) {
                ctx.globalAlpha = k * 0.8;
                ctx.beginPath();
                ctx.arc(wave.dir * (i * 10 - 10), -10 - (wave.frame + i * 3) % 18, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
    }

    drawCallout(ctx, width) {
        if (!this.callout) return;
        const life = this.callout.life;
        const alpha = life > 30 ? (42 - life) / 12 : Math.min(1, life / 18);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fillStyle = 'rgba(6, 4, 16, 0.72)';
        const boxW = 220;
        const x = width / 2 - boxW / 2;
        ctx.fillRect(x, 18, boxW, 28);
        ctx.strokeStyle = this.callout.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, 18, boxW, 28);
        ctx.fillStyle = this.callout.color;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.callout.name, width / 2, 38);
        ctx.restore();
    }

    drawMeter(ctx, player) {
        const spec = POWER_CASTS[player.element];
        if (!spec) return;
        const ready = player.specialCooldown <= 0 && !player.cast;
        const ratio = ready ? 1 : 1 - player.specialCooldown / spec.cooldown;
        const x = player.x;
        const y = player.y + player.height + 6;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(x, y, player.width, 4);
        ctx.fillStyle = ready ? spec.core : spec.color;
        ctx.globalAlpha = ready ? 0.95 : 0.8;
        ctx.fillRect(x, y, player.width * Math.max(0, Math.min(1, ratio)), 4);
        ctx.restore();
    }
}

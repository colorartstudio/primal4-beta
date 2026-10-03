// Fonte de verdade do momento do poder. A aparência mora em PowerVfx.js.
// frame 0 = carga. releaseAt = o frame em que o golpe existe.
// castLength = último frame da apresentação (visualEnd = castLength - 1).

import PowerVfx from './PowerVfx.js';

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
        shake: 8,
        frames: { chargeStart: 0, focus: 3, tension: 6, release: 8, visualEnd: 29 },
        vfx: { charge: 'fire_charge', release: 'fire_explosion', aftermath: 'fire_embers' }
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
        shake: 6,
        frames: { chargeStart: 0, focus: 3, mass: 6, release: 8, visualEnd: 23 },
        vfx: { charge: 'water_charge', release: 'water_wave', aftermath: 'water_trail' }
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
        shake: 7,
        frames: { chargeStart: 0, focus: 3, orbit: 6, release: 8, visualEnd: 25 },
        vfx: { charge: 'earth_charge', release: 'earth_armor', aftermath: 'earth_shield' }
    },
    zephyr: {
        name: 'TORNADO',
        color: '#ffd454',
        core: '#fff6d0',
        castLength: 28,
        releaseAt: 6,
        dashStart: 6,
        dashEnd: 16,
        dashSpeed: 13,
        cooldown: 160,
        damage: 14,
        knockback: 8,
        lift: -3,
        hitLock: 14,
        radius: 52,
        boostFrames: 70,
        speedBoost: 1.65,
        shake: 5,
        frames: { chargeStart: 0, focus: 3, release: 6, dashLast: 15, visualEnd: 27 },
        vfx: { charge: 'wind_charge', release: 'wind_dash', aftermath: 'wind_buff' }
    }
};

export default class PowerShow {
    constructor() {
        this.waves = [];
        this.callout = null;
        this.vfx = new PowerVfx();
        this.shakeRequest = 0;
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
            player.velocityX = dir * spec.dashSpeed;
            player.velocityY *= 0.35;
            return;
        }
        if (f < spec.releaseAt) {
            player.velocityX *= 0.2;
        }
    }

    noteShake(amount) {
        if (amount > this.shakeRequest) this.shakeRequest = amount;
    }

    consumeShake() {
        const amount = this.shakeRequest;
        this.shakeRequest = 0;
        return amount;
    }

    // Roda depois da física. Devolve os golpes que nasceram neste frame.
    resolve(players) {
        const hits = [];
        this.shakeRequest = 0;

        players.forEach((player) => {
            if (!player.cast) return;
            const spec = POWER_CASTS[player.element];
            if (!spec) return;
            const foe = players.find((p) => p !== player);
            const f = player.cast.frame;
            this.noteShake(this.vfx.emitCast(player, spec, f));

            if (f === spec.frames.release && foe) {
                if (player.element === 'marina') {
                    this.waves.push(this.makeWave(player, spec));
                } else if (player.element === 'ignis' || player.element === 'terra') {
                    if (this.circleHits(player, foe, spec.radius)) {
                        hits.push({ attacker: player, defender: foe, spec });
                        this.vfx.impact(player.element, foe, player.cast.facing);
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
                    this.vfx.impact(player.element, foe, player.cast.facing);
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
            this.vfx.emitFoam(wave);
            const foe = players.find((p) => p !== wave.owner);
            if (foe && !wave.hit && this.rectHits(wave, foe)) {
                wave.hit = true;
                hits.push({ attacker: wave.owner, defender: foe, spec: wave.spec });
                this.vfx.impact('marina', foe, wave.dir);
            }
            if (wave.frame >= wave.life) this.waves.splice(i, 1);
        }

        players.forEach((player) => this.vfx.emitAura(player));
        this.vfx.update();

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

    shownFrame(player) {
        if (!player.cast) return null;
        const frame = player.cast.frame - 1;
        return frame < 0 ? null : frame;
    }

    drawBehind(ctx, player) {
        this.vfx.drawStatus(ctx, player, 'back');
        const frame = this.shownFrame(player);
        if (frame == null) return;
        const spec = POWER_CASTS[player.element];
        if (!spec) return;
        this.vfx.drawCastBack(ctx, player, spec, frame);
    }

    drawFront(ctx, player) {
        this.vfx.drawStatus(ctx, player, 'front');
        const frame = this.shownFrame(player);
        if (frame == null) return;
        const spec = POWER_CASTS[player.element];
        if (!spec) return;
        this.vfx.drawCastFront(ctx, player, spec, frame);

        if (frame < 18) {
            const cx = player.x + player.width / 2;
            ctx.save();
            ctx.globalAlpha = 1 - frame / 18;
            ctx.fillStyle = spec.core;
            ctx.font = 'bold 13px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(spec.name, cx, player.y - 28);
            ctx.restore();
        }
    }

    drawWorldBack(ctx) {
        this.vfx.drawLayer(ctx, 'back');
    }

    drawWorldFront(ctx) {
        this.vfx.drawLayer(ctx, 'front');
    }

    drawWaves(ctx) {
        this.waves.forEach((wave) => this.vfx.drawWave(ctx, wave));
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

import Fighter from '../entities/Fighter.js';
import InputManager from './InputManager.js';
import EffectsManager from './EffectsManager.js';
import PowerShow, { POWER_CASTS } from '../vfx/PowerFrames.js';
import { CONSTANTS, CHARACTERS } from '../utils/Constants.js';

export default class GameEngine {
    constructor(canvas, ctx, playerCharacter, mode, sprites, audioManager) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.playerCharacter = playerCharacter;
        this.mode = mode; // 'solo' ou 'versus'
        this.sprites = sprites;
        this.audioManager = audioManager;
        
        // Configurações do jogo
        this.gravity = CONSTANTS.GRAVITY;
        this.friction = CONSTANTS.FRICTION;
        this.platforms = [];
        this.players = [];
        this.gameTime = CONSTANTS.GAME_TIME;
        this.timer = null;
        this.isPaused = false;
        this.gameOver = false;
        
        // Managers
        this.inputManager = new InputManager();
        this.effectsManager = new EffectsManager(canvas, ctx);
        this.powerShow = new PowerShow();
        this.shake = 0;
        
        // Pote da partida
        this.potAmount = 200;
        
        // Inicializar elementos do jogo
        this.initializeGameElements();
        
        // Escutar pausa
        window.addEventListener('game-pause', () => this.togglePause());
    }
    
    initializeGameElements() {
        this.createPlatformLayout();
        this.createPlayers();
        
        // Atualizar HUD
        this.updateHUD();
        
        // Iniciar timer
        this.startTimer();

        // Tocar música de início
        if (this.audioManager && this.audioManager.play) {
             this.audioManager.play('start');
        }
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Recriar layout de plataformas para o novo tamanho
        this.createPlatformLayout();
        
        // Reposicionar jogadores proporcionalmente (se já existirem)
        if (this.players.length > 0) {
            // Jogador 1 (Esquerda)
            this.players[0].x = Math.min(this.players[0].x, width - 50);
            this.players[0].y = Math.min(this.players[0].y, height - 100); // Garante que não caia no limbo
            
            // Jogador 2 (Direita)
            if (this.players[1]) {
                this.players[1].x = Math.min(this.players[1].x, width - 50);
                this.players[1].y = Math.min(this.players[1].y, height - 100);
            }
        }
    }

    createPlatformLayout() {
        this.platforms = []; // Limpar plataformas antigas
        const platformHeight = CONSTANTS.PLATFORM_HEIGHT;
        const groundY = this.canvas.height - 100;
        
        // Plataforma principal (Chão)
        this.platforms.push({
            x: 0,
            y: groundY,
            width: this.canvas.width,
            height: platformHeight,
            color: '#2a2a5a',
            type: 'ground'
        });
        
        // 3 Suspensões em Degrau (Stepped Suspensions) - Relativas ao tamanho da tela
        const steps = [
            { xPct: 0.1, yOffset: 180, width: 200, color: '#8a2be2' },
            { xPct: 0.4, yOffset: 270, width: 200, color: '#39ff14' },
            { xPct: 0.7, yOffset: 360, width: 200, color: '#00bfff' }
        ];

        steps.forEach(step => {
            this.platforms.push({
                x: this.canvas.width * step.xPct,
                y: groundY - step.yOffset,
                width: step.width,
                height: platformHeight,
                color: step.color,
                type: 'platform'
            });
        });
    }

    createPlayers() {
        const groundY = this.canvas.height - 100;

        // Jogador 1
        const player1 = new Fighter(
            this.canvas.width * 0.1, // Começa na esquerda
            groundY - 100,
            this.playerCharacter,
            'Jogador 1',
            1
        );
        player1.y = groundY - player1.height;
        this.inputManager.subscribe(player1);
        
        let player2;
        if (this.mode === 'solo') {
            // CPU - Posicionada no topo (Desafio)
            // Fix: Garante que Y nunca seja negativo (fora da tela)
            const safeSpawnY = Math.max(50, groundY - 350);
            
            player2 = new Fighter(
                this.canvas.width * 0.8,
                safeSpawnY, 
                this.getRandomCharacterExcept(this.playerCharacter),
                'CPU',
                2,
                true // isCPU
            );
            // Configurar dificuldade da IA
            player2.aiState = 'patrol'; 
            player2.reactionTime = 0;
        } else {
            // Segundo jogador humano
            player2 = new Fighter(
                this.canvas.width * 0.8,
                groundY - 100,
                this.getRandomCharacterExcept(this.playerCharacter),
                'Jogador 2',
                2
            );
            player2.y = groundY - player2.height;
            this.inputManager.subscribe(player2);
        }
        
        this.players = [player1, player2];
    }
    
    getRandomCharacterExcept(excludeChar) {
        const characters = Object.values(CHARACTERS);
        const availableChars = characters.filter(char => char !== excludeChar);
        return availableChars[Math.floor(Math.random() * availableChars.length)];
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            if (!this.isPaused && !this.gameOver) {
                this.gameTime--;
                const timerEl = document.getElementById('time-count');
                if(timerEl) timerEl.textContent = this.gameTime;
                
                if (this.gameTime <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }
    
    updateHUD() {
        // Atualizar barras de vida
        this.players.forEach((player, index) => {
            // Usa maxHealth se existir, senão fallback para 900
            const maxHp = player.maxHealth || 900;
            const healthPercent = Math.max(0, (player.health / maxHp) * 100);
            
            const healthBar = document.getElementById(`health-player${index + 1}`);
            if (healthBar) {
                healthBar.style.width = `${healthPercent}%`;
            }

            const specialBar = document.getElementById(`special-player${index + 1}`);
            if (specialBar) {
                const spec = POWER_CASTS[player.element];
                const maxCd = spec ? spec.cooldown : 180;
                const ratio = player.specialCooldown <= 0 ? 1 : 1 - player.specialCooldown / maxCd;
                specialBar.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
                specialBar.classList.toggle('ready', player.specialCooldown <= 0 && !player.cast);
            }
            
            // Atualizar nome do personagem no HUD
            const playerCharElement = document.querySelector(`.player${index + 1} .player-character`);
            if (playerCharElement) {
                playerCharElement.textContent = this.getCharacterName(player.element);
                playerCharElement.className = `player-character ${player.element}`;
            }
            
            // Atualizar nome do jogador no HUD
            const playerNameElement = document.querySelector(`.player${index + 1} .player-name`);
            if (playerNameElement) {
                playerNameElement.textContent = player.name;
            }
        });
        
        // Atualizar pote
        const potEl = document.getElementById('pot-amount');
        if(potEl) potEl.textContent = this.potAmount;
    }
    
    getCharacterName(element) {
        const names = {
            [CHARACTERS.IGNIS]: 'Ignis',
            [CHARACTERS.MARINA]: 'Marina',
            [CHARACTERS.TERRA]: 'Terra',
            [CHARACTERS.ZEPHYR]: 'Zephyr'
        };
        return names[element] || element;
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        this.audioManager.play('select');
        
        // Disparar evento para a UI (main.js)
        window.dispatchEvent(new CustomEvent('game-toggled-pause', { detail: { isPaused: this.isPaused } }));
    }
    
    update() {
        if (this.isPaused || this.gameOver) return;
        
        // Atualizar efeitos visuais
        this.effectsManager.update();
        
        // Atualizar jogadores
        this.players.forEach((player, index) => {
            // Aplicar gravidade
            if (!player.isGrounded) {
                player.velocityY += this.gravity;
            }
            
            // Aplicar fricção
            player.velocityX *= this.friction;

            // Dash e plant do especial, depois da fricção
            this.powerShow.applyMotion(player);
            
            // Atualizar posição
            player.x += player.velocityX;
            player.y += player.velocityY;
            
            // Som de Pulo
            if (player.velocityY === player.jumpForce || 
               (player.canDoubleJump && player.velocityY === player.jumpForce * 0.8 && player.hasDoubleJumped)) {
                 // Detectar início do pulo (hack simples)
                 // Idealmente o Fighter emitiria um evento 'jump'
            }

            // Verificar colisão com plataformas
            player.isGrounded = false;
            this.platforms.forEach(platform => {
                if (this.checkCollision(player, platform)) {
                    // Colisão vertical
                    if (player.velocityY > 0 && player.y + player.height > platform.y) {
                        player.y = platform.y - player.height;
                        player.velocityY = 0;
                        player.isGrounded = true;
                        player.canDoubleJump = player.element === CHARACTERS.ZEPHYR;
                    }
                }
            });
            
            // Verificar limites da arena (Ring Out)
            if (player.y > this.canvas.height + 100) {
                player.health = 0;
                this.audioManager.play('hit');
                this.endGame();
                return;
            }
            
            // Manter jogadores dentro dos limites horizontais
            player.x = Math.max(0, Math.min(this.canvas.width - player.width, player.x));
            
            // Atualizar ataques
            // Detectar ataque iniciado neste frame para som
            const wasAttacking = player.isAttacking;
            player.update();
            if (!wasAttacking && player.isAttacking) {
                this.audioManager.play('attack');
            }
            
            // IA para CPU
            if (player.isCPU && this.mode === 'solo' && !this.gameOver) {
                this.updateCPU(player, index === 0 ? this.players[1] : this.players[0]);
            }
            
            // Verificar colisão entre jogadores
            if (index === 0 && !this.gameOver) {
                this.checkPlayerCollision(this.players[0], this.players[1]);
            }
        });

        this.players.forEach((player) => {
            if (player.cast && player.cast.frame === 0) {
                this.powerShow.onCast(player);
                this.shake = Math.max(this.shake, 4);
            }
        });
        const powerHits = this.powerShow.resolve(this.players);
        powerHits.forEach((hit) => this.applyPowerHit(hit.attacker, hit.defender, hit.spec));
        if (this.shake > 0) this.shake *= 0.86;
        
        this.updateHUD();
    }
    
    updateCPU(cpu, target) {
        // IA "Predadora" - Máquina de Estados Simplificada
        const distanceX = target.x - cpu.x;
        const distanceY = target.y - cpu.y;
        const absDistX = Math.abs(distanceX);
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        // 1. Recuperação (Survival Mode)
        // Se estiver caindo fora da tela, tenta pular desesperadamente
        if (cpu.y > this.canvas.height - 200 && !cpu.isGrounded) {
             cpu.handleInput('up', true);
             // Tenta voltar para o centro
             if (cpu.x < this.canvas.width / 2) {
                 cpu.handleInput('right', true);
             } else {
                 cpu.handleInput('left', true);
             }
             return;
        }

        // 2. Comportamento de Combate (Aggro)
        if (distance < 150) {
            // Encarar o oponente
            if (distanceX > 0) {
                cpu.handleInput('right', true);
                cpu.handleInput('left', false);
            } else {
                cpu.handleInput('left', true);
                cpu.handleInput('right', false);
            }

            // Ataque agressivo se estiver no alcance
            if (absDistX < 80 && Math.abs(distanceY) < 50) {
                if (Math.random() < 0.1) { // 10% chance por frame (muito agressivo)
                    cpu.handleInput('attack', true);
                    setTimeout(() => cpu.handleInput('attack', false), 50);
                }
            }
            
            // Pular se o oponente atacar (Esquiva simples)
            if (target.isAttacking && Math.random() < 0.05) {
                cpu.handleInput('up', true);
                setTimeout(() => cpu.handleInput('up', false), 200);
            }
            
        } else {
            // 3. Caçada (Chase)
            // Se o alvo está mais alto, tenta subir
            if (target.y < cpu.y - 100 && cpu.isGrounded) {
                 cpu.handleInput('up', true);
                 setTimeout(() => cpu.handleInput('up', false), 300);
            }

            // Mover em direção ao alvo
            if (absDistX > 60) {
                if (distanceX > 0) {
                    cpu.handleInput('right', true);
                    cpu.handleInput('left', false);
                } else {
                    cpu.handleInput('left', true);
                    cpu.handleInput('right', false);
                }
            } else {
                // Parar se estiver alinhado horizontalmente mas longe verticalmente
                cpu.handleInput('right', false);
                cpu.handleInput('left', false);
            }
        }
        
        // 4. Uso de Especial (Tático)
        if (cpu.specialCooldown <= 0 && distance < 200 && Math.random() < 0.01) {
            cpu.handleInput('special', true);
            setTimeout(() => cpu.handleInput('special', false), 100);
        }
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    checkPlayerCollision(player1, player2) {
        if (!this.checkCollision(player1, player2)) return;
        
        // Empurrão básico
        const dx = player2.x - player1.x;
        const collisionCenterX = (player1.x + player2.x) / 2;
        const collisionCenterY = (player1.y + player2.y) / 2;
        
        // Resolver sobreposição (Empurrão Físico)
        const push = 2;
        if (dx > 0) {
            player1.velocityX -= push;
            player2.velocityX += push;
        } else {
            player1.velocityX += push;
            player2.velocityX -= push;
        }

        // Processar ataques
        if (player1.isAttacking) {
            this.processAttack(player1, player2, collisionCenterX, collisionCenterY);
        }
        
        if (player2.isAttacking) {
            this.processAttack(player2, player1, collisionCenterX, collisionCenterY);
        }
    }

    processAttack(attacker, defender, centerX, centerY) {
        if (defender.hitLock > 0) return;

        const damage = attacker.attackDamage;
        const shielded = defender.activePower && defender.activePower.type === 'shield';
        const knockback = shielded ? attacker.knockbackPower * 0.5 : attacker.knockbackPower;
        const effectType = {
            [CHARACTERS.IGNIS]: 'fire',
            [CHARACTERS.MARINA]: 'water',
            [CHARACTERS.TERRA]: 'earth',
            [CHARACTERS.ZEPHYR]: 'air'
        }[attacker.element] || 'hit';

        const dealt = this.landHit(attacker, defender, damage, knockback, effectType, shielded ? -2 : -5);
        const basicLabel = shielded ? `BLOQUEIO -${Math.floor(dealt)}` : `-${Math.floor(dealt)}`;
        this.showFloatText(basicLabel, defender.x, defender.y - 22, shielded ? '#7dff9a' : '#ffb020');
        defender.hitLock = 14;
    }

    applyPowerHit(attacker, defender, spec) {
        if (!defender || defender.hitLock > 0 || this.gameOver) return;
        const shielded = defender.activePower && defender.activePower.type === 'shield';
        const knockback = shielded ? spec.knockback * 0.5 : spec.knockback;
        const effectType = {
            ignis: 'fire',
            marina: 'water',
            terra: 'earth',
            zephyr: 'air'
        }[attacker.element] || 'hit';

        const dealt = this.landHit(attacker, defender, spec.damage, knockback, effectType, spec.lift || -6);
        if (spec.slowFrames) defender.slowFrames = shielded ? Math.ceil(spec.slowFrames * 0.6) : spec.slowFrames;
        defender.hitLock = spec.hitLock || 16;
        this.shake = Math.max(this.shake, spec.shake || 6);
        this.effectsManager.createEffect(effectType, defender.x + defender.width / 2, defender.y + defender.height / 2, 70);
        const label = shielded ? 'BLOQUEIO' : `${spec.name} -${Math.floor(dealt)}`;
        this.showFloatText(label, defender.x, defender.y - 36, spec.color || '#fff');
    }

    landHit(attacker, defender, damage, knockback, effectType, lift) {
        const before = defender.health;
        defender.takeDamage(damage);
        const dealt = before - defender.health;
        if (knockback !== 0) {
            const dirX = defender.x - attacker.x;
            const dir = dirX === 0 ? (attacker.cast ? attacker.cast.facing : 1) : (dirX > 0 ? 1 : -1);
            defender.velocityX += dir * knockback;
            defender.velocityY = lift;
        }
        this.effectsManager.createEffect(effectType, defender.x + defender.width / 2, defender.y + defender.height / 2, 40);
        if (this.audioManager && this.audioManager.play) this.audioManager.play('hit');
        if (defender.health <= 0) this.endGame();
        return dealt;
    }
    
    showFloatText(text, x, y, color) {
        // Dispara evento para UI (Main.js tratará de criar o elemento DOM)
        window.dispatchEvent(new CustomEvent('game-float-text', { 
            detail: { text, x, y, color } 
        }));
    }
    
    draw() {
        if (this.isPaused) return;
        
        const ctx = this.ctx;
        
        // Limpar canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();
        if (this.shake > 0.4) {
            ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
        }
        
        // Desenhar fundo (Cyberpunk Gradient)
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#05040a');
        gradient.addColorStop(0.5, '#1a0b2e');
        gradient.addColorStop(1, '#2d1b4e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Efeitos movidos para o final para garantir visibilidade (z-index)

        // Desenhar grade de fundo (Grid)
        ctx.strokeStyle = 'rgba(138, 43, 226, 0.1)';
        ctx.lineWidth = 1;
        const gridSize = 50;
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }

        // Desenhar plataformas (Neon Style)
        this.platforms.forEach(platform => {
            ctx.save();
            
            // Glow Effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = platform.color;
            
            // Corpo da plataforma
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Borda brilhante
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
            
            // Detalhe tecnológico (linhas)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            for(let i=10; i<platform.width; i+=20) {
                ctx.fillRect(platform.x + i, platform.y, 2, platform.height);
            }

            ctx.restore();
        });
        
        // Desenhar jogadores
        this.players.forEach(player => {
            // Desenhar Aura de Especial (Se Ativo)
            if (player.activePower && player.activePower.duration > 0) {
                const auraColor = this.getEffectColor(player.activePower.type);
                const pulse = Math.sin(Date.now() / 100) * 5; // Pulso suave
                
                ctx.save();
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = auraColor;
                ctx.shadowColor = auraColor;
                ctx.shadowBlur = 20;
                
                // Desenhar aura oval ao redor do personagem
                ctx.beginPath();
                ctx.ellipse(
                    player.x + player.width / 2, 
                    player.y + player.height / 2, 
                    (player.width / 1.5) + pulse, 
                    (player.height / 1.5) + pulse, 
                    0, 0, Math.PI * 2
                );
                ctx.fill();
                ctx.restore();
            }

            this.powerShow.drawBehind(ctx, player);
            this.drawCharacter(ctx, player);
            this.powerShow.drawFront(ctx, player);
            this.powerShow.drawMeter(ctx, player);
            
            // Desenhar barra de vida acima do personagem
            const barWidth = player.width;
            const barHeight = 6;
            const barX = player.x + player.width / 2 - barWidth / 2;
            const barY = player.y - 15;
            
            // Fundo da barra
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Vida
            const maxHp = player.maxHealth || 900;
            const healthPct = Math.max(0, player.health / maxHp);
            const healthWidth = healthPct * barWidth;
            
            ctx.fillStyle = healthPct > 0.5 ? '#1dd1a1' : healthPct > 0.25 ? '#feca57' : '#ff6b6b';
            ctx.fillRect(barX, barY, healthWidth, barHeight);
            
            // Desenhar efeitos de ataque
            if (player.isAttacking) {
                const attackRadius = player.element === CHARACTERS.IGNIS ? 40 : 30;
                ctx.fillStyle = this.getAttackColor(player.element);
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(
                    player.x + player.width / 2 + (player.facingRight ? 30 : -30),
                    player.y + player.height / 2,
                    attackRadius,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        });

        this.powerShow.drawWaves(ctx);
        this.powerShow.drawCallout(ctx, this.canvas.width);

        // Desenhar efeitos (ACIMA de tudo para visibilidade)
        this.effectsManager.draw();
        ctx.restore();
    }
    
    getEffectColor(type) {
        const colors = {
            'firestorm': '#ff4500', // Ignis
            'tsunami': '#00bfff',   // Marina
            'shield': '#32cd32',    // Terra
            'tornado': '#ffd700',   // Zephyr
        };
        return colors[type] || '#ffffff';
    }

    walkPose(player) {
        const stepping = player.isGrounded && Math.abs(player.velocityX) > 0.8 && !player.cast;
        if (!stepping) {
            if (!player.isGrounded) {
                const tilt = Math.max(-0.16, Math.min(0.16, -player.velocityY * 0.012));
                return { rot: tilt, sx: 1, sy: player.velocityY < 0 ? 1.05 : 0.95, step: -1 };
            }
            return { rot: 0, sx: 1, sy: 1, step: -1 };
        }

        // Quatro poses: apoio esquerdo, passagem, apoio direito, passagem.
        const poses = [
            { rot: -0.16, sx: 1.04, sy: 0.92 },
            { rot: -0.03, sx: 0.97, sy: 1.08 },
            { rot: 0.16, sx: 1.04, sy: 0.92 },
            { rot: 0.03, sx: 0.97, sy: 1.08 }
        ];
        const pace = Math.abs(player.velocityX) > 8 ? 4 : 6;
        const step = Math.floor(player.animTick / pace) % 4;
        return { ...poses[step], step };
    }

    drawCharacter(ctx, player) {
        const pose = this.walkPose(player);
        const width = player.width;
        const height = player.height;
        const feet = player.y + height;
        const cx = player.x + width / 2;
        const sprite = this.sprites[player.element];
        const hasSprite = sprite && sprite.complete && sprite.naturalWidth > 0;

        ctx.save();
        ctx.translate(cx, feet);
        ctx.scale(player.facingRight ? 1 : -1, 1);
        ctx.rotate(pose.rot);
        ctx.scale(pose.sx, pose.sy);

        if (hasSprite) {
            ctx.drawImage(sprite, -width / 2, -height, width, height);
        } else {
            ctx.fillStyle = this.getCharacterColor(player.element);
            ctx.fillRect(-width / 2, -height, width, height);
            ctx.fillStyle = 'white';
            ctx.fillRect(-width / 4, -height + height / 4, width / 2, height / 4);
        }
        ctx.restore();

        if (pose.step === 0 || pose.step === 2) {
            ctx.save();
            ctx.globalAlpha = 0.45;
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            const behind = player.facingRight ? player.x - 6 : player.x + width;
            ctx.fillRect(behind, feet - 3, 10, 3);
            ctx.restore();
        }
    }
    
    getCharacterColor(element) {
        const colors = {
            ignis: '#ff6b6b',
            marina: '#48dbfb',
            terra: '#1dd1a1',
            zephyr: '#feca57'
        };
        return colors[element] || '#ffffff';
    }
    
    getAttackColor(element) {
        const colors = {
            ignis: '#ff9f43',
            marina: '#0abde3',
            terra: '#10ac84',
            zephyr: '#ff9ff3'
        };
        return colors[element] || '#ffffff';
    }
    
    endGame() {
        if (this.gameOver) return;
        
        this.gameOver = true;
        clearInterval(this.timer);
        
        // Determinar vencedor
        let winner = null;
        let loser = null;
        
        if (this.players[0].health > this.players[1].health) {
            winner = this.players[0];
            loser = this.players[1];
        } else if (this.players[1].health > this.players[0].health) {
            winner = this.players[1];
            loser = this.players[0];
        } else {
            winner = this.players[0];
            loser = this.players[1];
        }
        
        // Processar economia da partida com segurança
        let economyResult = { earnings: 0, newTotal: 0 };
        try {
            if (window.gameStorage && window.gameStorage.processMatchEconomy) {
                // Usa global window.gameStorage
                economyResult = window.gameStorage.processMatchEconomy(
                    11, // ID do jogador atual (mock)
                    this.players.length
                );
                console.log('Economia processada com sucesso:', economyResult);
            } else {
                console.warn('GameStorage não encontrado. Usando valores padrão.');
            }
        } catch (e) {
            console.error('Erro ao processar economia no endGame:', e);
            // Fallback para evitar travamento
            economyResult = { earnings: 50, newTotal: 1000 };
        }
        
        // Disparar evento de fim de jogo para Main tratar a UI
        window.dispatchEvent(new CustomEvent('game-over', { 
            detail: { 
                winner, 
                loser, 
                economyResult,
                gameMode: this.mode
            } 
        }));
    }
    
    getCharacterEmoji(element) {
        const emojis = {
            ignis: '🔥',
            marina: '💧',
            terra: '🌿',
            zephyr: '💨'
        };
        return emojis[element] || '❓';
    }
    
    start() {
        const gameLoop = () => {
            if (!this.isPaused) {
                // Atualizar lógica apenas se não for fim de jogo
                if (!this.gameOver) {
                    this.update();
                }
                // Sempre desenhar (mesmo em Game Over, para evitar tela congelada)
                this.draw();
            }
            requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    }
    
    stop() {
        this.gameOver = true;
        clearInterval(this.timer);
        this.inputManager.destroy();
    }
}

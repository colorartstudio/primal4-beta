// ============================================================================
// GAME ENGINE ATUALIZADA - SISTEMA DE PODERES
// ============================================================================

class GameEngine {
    constructor(canvas, ctx, playerCharacter, mode) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.playerCharacter = playerCharacter;
        this.mode = mode;
        
        // Configurações otimizadas para mobile
        this.gravity = 0.5;
        this.friction = 0.85;
        this.platforms = [];
        this.players = [];
        this.gameTime = 99;
        this.timer = null;
        this.isPaused = false;
        this.gameOver = false;
        
        // Sistema de efeitos
        this.effects = [];
        this.powerEffects = [];
        
        // Controles
        this.keys = {};
        this.setupControls();
        
        // Pote da partida
        this.potAmount = 200;
        
        // Inicializar
        this.initializeGameElements();
    }
    
    initializeGameElements() {
        // Criar arena otimizada para mobile
        const platformHeight = 15;
        const groundY = this.canvas.height - 80;
        
        // Plataforma principal (maior para mobile)
        this.platforms.push({
            x: 0,
            y: groundY,
            width: this.canvas.width,
            height: platformHeight,
            color: 'rgba(106, 17, 203, 0.7)'
        });
        
        // Plataformas flutuantes (3 para mobile)
        const floatingPlatforms = [
            { x: this.canvas.width * 0.1, y: groundY - 120, width: 120 },
            { x: this.canvas.width * 0.4, y: groundY - 180, width: 100 },
            { x: this.canvas.width * 0.7, y: groundY - 120, width: 120 }
        ];
        
        floatingPlatforms.forEach((plat, i) => {
            this.platforms.push({
                x: plat.x,
                y: plat.y,
                width: plat.width,
                height: platformHeight,
                color: i === 1 ? 'rgba(0, 255, 157, 0.7)' : 'rgba(106, 17, 203, 0.7)'
            });
        });
        
        // Criar jogadores com posições ajustadas
        const player1 = new Fighter(
            this.canvas.width * 0.2,
            groundY - 60,
            this.playerCharacter,
            'Jogador 1',
            1
        );
        
        let player2;
        if (this.mode === 'solo') {
            player2 = new Fighter(
                this.canvas.width * 0.7,
                groundY - 60,
                this.getRandomCharacterExcept(this.playerCharacter),
                'CPU',
                2,
                true
            );
        } else {
            player2 = new Fighter(
                this.canvas.width * 0.7,
                groundY - 60,
                this.getRandomCharacterExcept(this.playerCharacter),
                'Jogador 2',
                2
            );
        }
        
        this.players = [player1, player2];
        this.updateHUD();
        this.startTimer();
    }
    
    // NOVO: Sistema de efeitos visuais
    createEffect(type, x, y, size = 50) {
        const effect = {
            type,
            x,
            y,
            size,
            life: 1.0,
            maxLife: 1.0,
            color: this.getEffectColor(type)
        };
        
        this.effects.push(effect);
        
        // Criar elemento DOM para efeitos especiais
        if (type.includes('power')) {
            this.createPowerEffectDOM(type, x, y, size);
        }
        
        return effect;
    }
    
    createPowerEffectDOM(type, x, y, size) {
        const effectDiv = document.createElement('div');
        effectDiv.className = `power-effect ${type}-effect`;
        effectDiv.style.cssText = `
            position: absolute;
            left: ${x - size/2}px;
            top: ${y - size/2}px;
            width: ${size}px;
            height: ${size}px;
            z-index: 5;
            pointer-events: none;
        `;
        
        document.getElementById('power-effects').appendChild(effectDiv);
        
        // Remover após animação
        setTimeout(() => {
            if (effectDiv.parentNode) {
                effectDiv.parentNode.removeChild(effectDiv);
            }
        }, 1000);
    }
    
    getEffectColor(type) {
        const colors = {
            'fire': '#ff006e',
            'water': '#2575fc',
            'earth': '#00ff9d',
            'air': '#ffd700',
            'heal': '#00ff9d',
            'damage': '#ff006e'
        };
        return colors[type] || '#ffffff';
    }
    
    updateEffects() {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.life -= 0.02;
            
            if (effect.life <= 0) {
                this.effects.splice(i, 1);
            }
        }
    }
    
    drawEffects() {
        this.effects.forEach(effect => {
            const alpha = effect.life;
            const size = effect.size * (1 + (1 - effect.life));
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha * 0.7;
            
            // Efeito de partículas
            if (effect.type === 'fire') {
                this.ctx.fillStyle = effect.color;
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const distance = size * (1 - effect.life);
                    const px = effect.x + Math.cos(angle) * distance;
                    const py = effect.y + Math.sin(angle) * distance;
                    const particleSize = size * 0.1 * effect.life;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(px, py, particleSize, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            } else if (effect.type === 'water') {
                // Onda concêntrica
                this.ctx.strokeStyle = effect.color;
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(effect.x, effect.y, size * (1 - effect.life), 0, Math.PI * 2);
                this.ctx.stroke();
            } else if (effect.type === 'earth') {
                // Terremoto (linhas)
                this.ctx.strokeStyle = effect.color;
                this.ctx.lineWidth = 2;
                for (let i = 0; i < 5; i++) {
                    const offset = (i - 2) * 10;
                    this.ctx.beginPath();
                    this.ctx.moveTo(effect.x - size/2 + offset, effect.y - size/2);
                    this.ctx.lineTo(effect.x + size/2 + offset, effect.y + size/2);
                    this.ctx.stroke();
                }
            } else if (effect.type === 'air') {
                // Redemoinho
                this.ctx.strokeStyle = effect.color;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                for (let i = 0; i < 3; i++) {
                    const radius = size * (1 - effect.life) * (0.8 + i * 0.2);
                    this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
                }
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        });
    }
    
    // NOVO: Sistema de alertas
    showAlert(text, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${type}`;
        alertDiv.textContent = text;
        
        const container = document.getElementById('alert-container');
        container.appendChild(alertDiv);
        
        // Remover após 2 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 2000);
    }
    
    // Atualização do loop principal
    update() {
        if (this.isPaused || this.gameOver) return;
        
        // Atualizar efeitos
        this.updateEffects();
        
        // Atualizar jogadores
        this.players.forEach((player, index) => {
            // Gravidade
            if (!player.isGrounded) {
                player.velocityY += this.gravity;
            }
            
            // Fricção
            player.velocityX *= this.friction;
            
            // Atualizar posição
            player.x += player.velocityX;
            player.y += player.velocityY;
            
            // Colisão com plataformas
            player.isGrounded = false;
            this.platforms.forEach(platform => {
                if (this.checkCollision(player, platform)) {
                    if (player.velocityY > 0 && player.y + player.height > platform.y) {
                        player.y = platform.y - player.height;
                        player.velocityY = 0;
                        player.isGrounded = true;
                        player.canDoubleJump = player.element === 'zephyr';
                    }
                }
            });
            
            // Ring Out
            if (player.y > this.canvas.height + 100) {
                player.health = 0;
                this.showAlert(`${player.name} caiu da arena!`, 'danger');
                this.endGame();
                return;
            }
            
            // Limites horizontais
            player.x = Math.max(10, Math.min(this.canvas.width - player.width - 10, player.x));
            
            // Atualizar estado
            player.update();
            
            // IA para CPU
            if (player.isCPU && this.mode === 'solo' && !this.gameOver) {
                this.updateCPU(player, index === 0 ? this.players[1] : this.players[0]);
            }
            
            // Colisão entre jogadores
            if (index === 0 && !this.gameOver) {
                this.checkPlayerCollision(this.players[0], this.players[1]);
            }
            
            // Efeitos de poder ativos
            if (player.activePower) {
                this.updatePlayerPower(player);
            }
        });
        
        this.updateHUD();
    }
    
    updatePlayerPower(player) {
        const power = player.activePower;
        power.duration--;
        
        if (power.duration <= 0) {
            player.activePower = null;
            this.showAlert(`${player.name}: Poder terminou`, 'info');
            return;
        }
        
        // Aplicar efeitos contínuos do poder
        switch (power.type) {
            case 'ignis_firestorm':
                // Fogo persegue o oponente
                const target = player === this.players[0] ? this.players[1] : this.players[0];
                if (Math.random() < 0.3) {
                    this.createEffect('fire', target.x + target.width/2, target.y, 30);
                    target.takeDamage(1);
                }
                break;
                
            case 'marina_tsunami':
                // Área de lentidão
                player.slowAura = true;
                break;
                
            case 'terra_shield':
                // Redução de dano
                player.damageReduction = 0.5;
                break;
                
            case 'zephyr_tornado':
                // Velocidade aumentada
                player.speedBoost = 1.5;
                break;
        }
    }
    
    // Sistema de colisão melhorado
    checkPlayerCollision(player1, player2) {
        if (!this.checkCollision(player1, player2)) return;
        
        const dx = player2.x - player1.x;
        const collisionCenterX = (player1.x + player2.x) / 2;
        const collisionCenterY = (player1.y + player2.y) / 2;
        
        // Empurrão básico
        const pushForce = 3;
        player1.velocityX += dx > 0 ? -pushForce : pushForce;
        player2.velocityX += dx > 0 ? pushForce : -pushForce;
        
        // Ataques
        if (player1.isAttacking) {
            this.processAttack(player1, player2, collisionCenterX, collisionCenterY);
        }
        
        if (player2.isAttacking) {
            this.processAttack(player2, player1, collisionCenterX, collisionCenterY);
        }
        
        // Efeitos de poder ativo
        if (player1.activePower) {
            this.applyPowerEffect(player1, player2);
        }
        if (player2.activePower) {
            this.applyPowerEffect(player2, player1);
        }
    }
    
    processAttack(attacker, defender, centerX, centerY) {
        let damage = attacker.attackDamage;
        let knockback = attacker.knockbackPower;
        
        // Bônus de elemento
        switch (attacker.element) {
            case 'ignis':
                damage *= 1.3;
                this.createEffect('fire', centerX, centerY, 40);
                this.showAlert(`${attacker.name}: Ataque de Fogo!`, 'danger');
                break;
            case 'marina':
                knockback *= 1.5;
                this.createEffect('water', centerX, centerY, 35);
                this.showAlert(`${attacker.name}: Empurrão Marinho!`, 'info');
                break;
            case 'terra':
                damage *= 0.9;
                knockback *= 0.7;
                this.createEffect('earth', centerX, centerY, 45);
                this.showAlert(`${attacker.name}: Golpe Sismico!`, 'info');
                break;
            case 'zephyr':
                damage *= 1.1;
                this.createEffect('air', centerX, centerY, 30);
                this.showAlert(`${attacker.name}: Rajada de Ar!`, 'info');
                break;
        }
        
        // Aplicar redução de dano se tiver escudo
        if (defender.activePower && defender.activePower.type === 'terra_shield') {
            damage *= 0.5;
            this.createEffect('earth', defender.x + defender.width/2, defender.y, 50);
        }
        
        // Aplicar dano
        defender.takeDamage(damage);
        
        // Aplicar knockback
        const dirX = defender.x - attacker.x;
        defender.velocityX += (dirX > 0 ? 1 : -1) * knockback;
        defender.velocityY -= 8;
        
        // Criar efeito visual
        this.createEffect('damage', centerX, centerY, 25);
        
        // Verificar morte
        if (defender.health <= 0) {
            this.showAlert(`${defender.name} foi derrotado!`, 'danger');
            this.endGame();
        }
    }
    
    applyPowerEffect(source, target) {
        const power = source.activePower;
        if (!power) return;
        
        const distance = Math.sqrt(
            Math.pow(target.x - source.x, 2) + 
            Math.pow(target.y - source.y, 2)
        );
        
        // Verificar se está no alcance
        if (distance < power.range) {
            switch (power.type) {
                case 'marina_tsunami':
                    // Lentidão
                    target.slowEffect = 0.6;
                    this.createEffect('water', target.x + target.width/2, target.y, 25);
                    break;
                    
                case 'zephyr_tornado':
                    // Atração
                    const pullForce = 0.5;
                    const dirX = source.x - target.x;
                    const dirY = source.y - target.y;
                    target.velocityX += dirX * pullForce;
                    target.velocityY += dirY * pullForce;
                    this.createEffect('air', target.x + target.width/2, target.y, 20);
                    break;
            }
        }
    }
    
    // NOVO: Draw atualizado com efeitos
    draw() {
        if (this.isPaused) return;
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Fundo gradiente
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a0033');
        gradient.addColorStop(1, '#0a001a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar efeitos primeiro (para ficarem atrás)
        this.drawEffects();
        
        // Desenhar plataformas
        this.platforms.forEach(platform => {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Efeito 3D
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 4);
            
            // Borda brilhante
            ctx.strokeStyle = 'rgba(106, 17, 203, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        });
        
        // Desenhar jogadores
        this.players.forEach(player => {
            this.drawCharacter(ctx, player);
            
            // Desenhar barra de vida
            this.drawHealthBar(ctx, player);
            
            // Desenhar indicador de poder ativo
            if (player.activePower) {
                this.drawPowerIndicator(ctx, player);
            }
        });
        
        // Desenhar efeitos de poder especiais
        this.drawSpecialEffects(ctx);
    }
    
    drawCharacter(ctx, player) {
        const x = player.x;
        const y = player.y;
        const width = player.width;
        const height = player.height;
        
        // Efeito de poder ativo
        if (player.activePower) {
            ctx.save();
            const pulse = Math.sin(Date.now() * 0.01) * 0.1 + 1;
            ctx.translate(x + width/2, y + height/2);
            ctx.scale(pulse, pulse);
            ctx.translate(-x - width/2, -y - height/2);
        }
        
        // Tenta carregar o SVG
        if (sprites[player.element] && sprites[player.element].complete && sprites[player.element].naturalWidth > 0) {
            ctx.save();
            
            // Efeito de brilho para poder ativo
            if (player.activePower) {
                ctx.shadowColor = this.getCharacterColor(player.element);
                ctx.shadowBlur = 20;
            }
            
            if (!player.facingRight) {
                ctx.translate(x + width, y);
                ctx.scale(-1, 1);
                ctx.drawImage(sprites[player.element], 0, 0, width, height);
            } else {
                ctx.drawImage(sprites[player.element], x, y, width, height);
            }
            ctx.restore();
        } else {
            // Fallback: desenhar personagem estilo chibi
            this.drawChibiCharacter(ctx, player);
        }
        
        if (player.activePower) {
            ctx.restore();
        }
    }
    
    drawChibiCharacter(ctx, player) {
        const x = player.x;
        const y = player.y;
        const width = player.width;
        const height = player.height;
        
        // Cor do personagem
        ctx.fillStyle = this.getCharacterColor(player.element);
        
        // Corpo (círculo)
        ctx.beginPath();
        ctx.arc(x + width/2, y + height/2, width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Detalhes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x + width/2, y + height/3, width/4, 0, Math.PI * 2); // Cabeça
        ctx.fill();
        
        // Olhos
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x + width/2 - 5, y + height/3, 3, 0, Math.PI * 2);
        ctx.arc(x + width/2 + 5, y + height/3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Elemento
        ctx.fillStyle = this.getCharacterColor(player.element);
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.element.charAt(0).toUpperCase(), x + width/2, y + height - 10);
    }
    
    drawHealthBar(ctx, player) {
        const barWidth = 50;
        const barHeight = 6;
        const barX = player.x + player.width/2 - barWidth/2;
        const barY = player.y - 12;
        
        // Fundo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Vida
        const healthPercent = player.health / 100;
        const healthWidth = barWidth * healthPercent;
        
        // Gradiente baseado na vida
        const healthGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
        if (healthPercent > 0.6) {
            healthGradient.addColorStop(0, '#00ff9d');
            healthGradient.addColorStop(1, '#1dd1a1');
        } else if (healthPercent > 0.3) {
            healthGradient.addColorStop(0, '#ffd700');
            healthGradient.addColorStop(1, '#feca57');
        } else {
            healthGradient.addColorStop(0, '#ff006e');
            healthGradient.addColorStop(1, '#ff6b6b');
        }
        
        ctx.fillStyle = healthGradient;
        ctx.fillRect(barX, barY, healthWidth, barHeight);
        
        // Borda
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    drawPowerIndicator(ctx, player) {
        const x = player.x + player.width/2;
        const y = player.y - 25;
        const radius = 8;
        
        // Círculo pulsante
        const pulse = Math.sin(Date.now() * 0.01) * 2 + radius;
        
        ctx.fillStyle = this.getCharacterColor(player.element);
        ctx.beginPath();
        ctx.arc(x, y, pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Anel externo
        ctx.strokeStyle = this.getCharacterColor(player.element);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    drawSpecialEffects(ctx) {
        // Desenhar áreas de efeito de poder
        this.players.forEach(player => {
            if (player.activePower) {
                const power = player.activePower;
                const centerX = player.x + player.width/2;
                const centerY = player.y + player.height/2;
                
                ctx.save();
                ctx.globalAlpha = 0.2;
                
                switch (power.type) {
                    case 'marina_tsunami':
                        // Área de lentidão
                        ctx.fillStyle = '#2575fc';
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, power.range, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                        
                    case 'terra_shield':
                        // Escudo
                        ctx.strokeStyle = '#00ff9d';
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
                        ctx.stroke();
                        break;
                }
                
                ctx.restore();
            }
        });
    }
    
    getCharacterColor(element) {
        const colors = {
            ignis: '#ff006e',
            marina: '#2575fc',
            terra: '#00ff9d',
            zephyr: '#ffd700'
        };
        return colors[element] || '#ffffff';
    }
    
    // Resto da classe permanece similar, com ajustes para mobile...
}
export default class Fighter {
    constructor(x, y, element, name, playerNumber, isCPU = false) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.element = element;
        this.name = name;
        this.playerNumber = playerNumber;
        this.isCPU = isCPU;
        
        // Atributos
        this.health = 300; // Tankier Gameplay (3x mais vida)
        this.velocityX = 0;
        this.velocityY = 0;
        this.isGrounded = false;
        this.facingRight = playerNumber === 2; // Player 1 virado para direita, Player 2 para esquerda
        this.canDoubleJump = element === 'zephyr';
        this.hasDoubleJumped = false;
        
        // Ataques
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.specialCooldown = 0;
        
        // Poderes Ativos
        this.activePower = null; // { type, duration, ... }
        this.damageReduction = 0;
        this.speedMultiplier = 1;
        
        // Controles
        this.controls = {
            left: false,
            right: false,
            up: false,
            down: false,
            attack: false,
            special: false
        };
        
        // Estatísticas baseadas no elemento
        this.setElementStats();
    }
    
    setElementStats() {
        switch (this.element) {
            case 'ignis':
                this.baseSpeed = 5;
                this.jumpForce = -12;
                this.attackRange = 40;
                this.attackDamage = 12;
                this.knockbackPower = 5;
                break;
            case 'marina':
                this.baseSpeed = 4.5;
                this.jumpForce = -11;
                this.attackRange = 35;
                this.attackDamage = 10;
                this.knockbackPower = 8; // Alto knockback
                break;
            case 'terra':
                this.baseSpeed = 4;
                this.jumpForce = -10;
                this.attackRange = 35;
                this.attackDamage = 15; // Alto dano
                this.knockbackPower = 4;
                break;
            case 'zephyr':
                this.baseSpeed = 6; // Rápido
                this.jumpForce = -13;
                this.attackRange = 30;
                this.attackDamage = 9;
                this.knockbackPower = 6;
                break;
            default:
                this.baseSpeed = 5;
                this.jumpForce = -11;
                this.attackRange = 35;
                this.attackDamage = 10;
                this.knockbackPower = 5;
        }
        this.speed = this.baseSpeed;
    }
    
    handleInput(action, isPressed) {
        this.controls[action] = isPressed;
        
        if (isPressed) {
            if (action === 'left') {
                this.velocityX = -this.speed * this.speedMultiplier;
                this.facingRight = false;
            } else if (action === 'right') {
                this.velocityX = this.speed * this.speedMultiplier;
                this.facingRight = true;
            } else if (action === 'up') {
                this.jump();
            } else if (action === 'attack' && this.attackCooldown <= 0) {
                this.attack();
            } else if (action === 'special' && this.specialCooldown <= 0) {
                this.activatePower();
            }
        } else {
            if (action === 'left' && this.velocityX < 0) {
                this.velocityX = 0;
            } else if (action === 'right' && this.velocityX > 0) {
                this.velocityX = 0;
            }
        }
    }
    
    jump() {
        if (this.isGrounded) {
            this.velocityY = this.jumpForce;
            this.isGrounded = false;
            this.hasDoubleJumped = false;
        } else if (this.canDoubleJump && !this.hasDoubleJumped) {
            this.velocityY = this.jumpForce * 0.8;
            this.hasDoubleJumped = true;
        }
    }
    
    attack() {
        this.isAttacking = true;
        this.attackCooldown = 25; // frames
        
        // Efeito baseado no elemento
        if (this.element === 'marina') {
            this.velocityX += this.facingRight ? -2 : 2; // Recuo
        } else if (this.element === 'zephyr') {
            this.velocityX += this.facingRight ? 5 : -5; // Avanço rápido
        }
    }
    
    activatePower() {
        this.isAttacking = true;
        this.specialCooldown = 180; // 3 segundos de cooldown
        
        // Definir poder baseado no elemento
        switch (this.element) {
            case 'ignis':
                this.activePower = {
                    type: 'firestorm',
                    duration: 180, // 3 segundos (Aumentado)
                    range: 150,
                    damagePerTick: 0.5
                };
                break;
            case 'marina':
                this.activePower = {
                    type: 'tsunami',
                    duration: 150, // 2.5 segundos (Aumentado)
                    range: 200,
                    slowEffect: 0.5
                };
                break;
            case 'terra':
                this.activePower = {
                    type: 'shield',
                    duration: 240, // 4 segundos (Aumentado)
                    damageReduction: 0.75 // 75% Redução (Tank)
                };
                this.damageReduction = 0.75;
                break;
            case 'zephyr':
                this.activePower = {
                    type: 'tornado',
                    duration: 120, // 2 segundos (Aumentado)
                    speedBoost: 1.8 // Super Velocidade
                };
                this.speedMultiplier = 1.8;
                this.velocityX = this.facingRight ? 20 : -20; // Dash inicial mais forte
                break;
        }
    }
    
    updatePower() {
        if (!this.activePower) return;
        
        this.activePower.duration--;
        
        if (this.activePower.duration <= 0) {
            // Resetar efeitos ao terminar
            if (this.activePower.type === 'terra') this.damageReduction = 0;
            if (this.activePower.type === 'zephyr') this.speedMultiplier = 1;
            
            this.activePower = null;
        }
    }
    
    takeDamage(amount) {
        const finalDamage = amount * (1 - this.damageReduction);
        this.health = Math.max(0, this.health - finalDamage);
    }
    
    update() {
        // Atualizar cooldowns
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.specialCooldown > 0) this.specialCooldown--;
        
        // Resetar estado de ataque
        if (this.attackCooldown <= 10) this.isAttacking = false;
        
        // Atualizar poder ativo
        this.updatePower();
        
        // Aplicar movimento baseado nos controles (com multiplicador de velocidade)
        if (this.controls.left) {
            this.velocityX = -this.speed * this.speedMultiplier;
            this.facingRight = false;
        }
        if (this.controls.right) {
            this.velocityX = this.speed * this.speedMultiplier;
            this.facingRight = true;
        }
    }
}

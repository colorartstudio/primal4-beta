export default class Fighter {
    constructor(x, y, element, name, playerNumber, isCPU = false) {
        this.x = x;
        this.y = y;
        this.width = 74;
        this.height = 108;
        this.animTick = 0;
        this.element = element;
        this.name = name;
        this.playerNumber = playerNumber;
        this.isCPU = isCPU;
        
        // Atributos
        this.maxHealth = 900; // Tankier Gameplay (3x mais vida: 300 -> 900)
        this.health = this.maxHealth;
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
        this.hitLock = 0;
        this.slowFrames = 0;
        this.cast = null;
        
        // Poderes Ativos
        this.activePower = null; // { type, duration }
        this.damageReduction = 0;
        
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
                this.attackDamage = 13; // Golpe pesado, abaixo do que o escudo antigo permitia
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

    moveScale() {
        if (this.slowFrames > 0) return 0.5;
        if (this.activePower && this.activePower.type === 'tornado') {
            return 1.65;
        }
        return 1;
    }
    
    handleInput(action, isPressed) {
        this.controls[action] = isPressed;
        
        if (isPressed) {
            if (action === 'left') {
                this.velocityX = -this.speed * this.moveScale();
                this.facingRight = false;
            } else if (action === 'right') {
                this.velocityX = this.speed * this.moveScale();
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
        if (this.cast) return;
        const cooldowns = { ignis: 180, marina: 180, terra: 320, zephyr: 160 };
        this.specialCooldown = cooldowns[this.element] || 180;
        this.cast = {
            frame: 0,
            facing: this.facingRight ? 1 : -1,
            dashed: false
        };
    }
    
    updatePower() {
        if (!this.activePower) return;
        
        this.activePower.duration--;
        
        if (this.activePower.duration <= 0) {
            this.damageReduction = 0;
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
        if (this.hitLock > 0) this.hitLock--;
        if (this.slowFrames > 0) this.slowFrames--;
        
        // Resetar estado de ataque
        if (this.attackCooldown <= 10) this.isAttacking = false;
        
        // Atualizar poder ativo
        this.updatePower();

        if (this.cast) {
            this.facingRight = this.cast.facing > 0;
        }
        
        const scale = this.moveScale();
        if (this.controls.left && !this.cast) {
            this.velocityX = -this.speed * scale;
            this.facingRight = false;
        }
        if (this.controls.right && !this.cast) {
            this.velocityX = this.speed * scale;
            this.facingRight = true;
        }

        const stepping = this.isGrounded && Math.abs(this.velocityX) > 0.8 && !this.cast;
        if (stepping) this.animTick += 1;
        else this.animTick = 0;
    }
}

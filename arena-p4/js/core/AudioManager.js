export default class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = 0.3;
        this.isMuted = false;
    }

    play(type) {
        if (this.isMuted) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        switch (type) {
            case 'attack':
                this.synthAttack();
                break;
            case 'hit':
                this.synthHit();
                break;
            case 'jump':
                this.synthJump();
                break;
            case 'select':
                this.synthSelect();
                break;
            case 'start':
                this.synthStart();
                break;
        }
    }

    // Gerador de Som de Pulo (Frequência sobe)
    synthJump() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(this.masterVolume * 0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    // Gerador de Som de Ataque (Ruído/Sweep)
    synthAttack() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(this.masterVolume * 0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    // Gerador de Som de Dano (Grave)
    synthHit() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    // Gerador de Som de UI (Select)
    synthSelect() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    // Melodia de Início
    synthStart() {
        const now = this.ctx.currentTime;
        [440, 554, 659].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.3, now + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
            
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.4);
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }
}

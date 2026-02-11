import { KEY_MAPPINGS } from '../utils/Constants.js';

export default class InputManager {
    constructor() {
        this.keys = {};
        this.touchMap = new Map(); // Map<identifier, keyString>
        this.observers = []; // Objects listening to input (e.g., players)
        
        // Bind handlers to retain 'this' context and allow removal
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleTouch = this.handleTouch.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.preventDefault = e => e.preventDefault();

        this.setupKeyboard();
        this.setupTouch();
    }

    subscribe(observer) {
        this.observers.push(observer);
    }

    setupKeyboard() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    handleKeyDown(e) {
        if (this.keys[e.code]) return; // Prevent repeat
        this.keys[e.code] = true;
        this.notifyObservers(e.code, true);
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
        this.notifyObservers(e.code, false);
    }

    setupTouch() {
        this.controlsContainer = document.querySelector('.mobile-controls');
        if (!this.controlsContainer) return;

        // Prevent default browser zooming/scrolling
        this.controlsContainer.addEventListener('touchstart', this.preventDefault, { passive: false });
        this.controlsContainer.addEventListener('touchmove', this.preventDefault, { passive: false });
        this.controlsContainer.addEventListener('touchend', this.preventDefault, { passive: false });

        // Bind events to the whole document to catch slides out of buttons
        document.addEventListener('touchstart', this.handleTouch, { passive: false });
        document.addEventListener('touchmove', this.handleTouch, { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    }

    handleTouch(e) {
        // Only process if it touches our controls
        const changedTouches = e.changedTouches;

        for (let i = 0; i < changedTouches.length; i++) {
            const touch = changedTouches[i];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            
            // Check if target is a button or inside a button
            const button = target?.closest('button[data-key]');
            
            const previousKey = this.touchMap.get(touch.identifier);
            const currentKey = button ? button.dataset.key : null;

            if (currentKey !== previousKey) {
                // Key changed
                if (previousKey) {
                    this.keys[previousKey] = false;
                    this.notifyObservers(previousKey, false);
                    // Remove visual feedback
                    const prevBtn = document.querySelector(`button[data-key="${previousKey}"]`);
                    if (prevBtn) prevBtn.classList.remove('active');
                }

                if (currentKey) {
                    this.keys[currentKey] = true;
                    this.notifyObservers(currentKey, true);
                    // Add visual feedback
                    button.classList.add('active');
                    
                    // Haptic feedback
                    if (navigator.vibrate) navigator.vibrate(10);
                }
                
                this.touchMap.set(touch.identifier, currentKey);
            }
        }
    }

    handleTouchEnd(e) {
        const changedTouches = e.changedTouches;

        for (let i = 0; i < changedTouches.length; i++) {
            const touch = changedTouches[i];
            const key = this.touchMap.get(touch.identifier);

            if (key) {
                this.keys[key] = false;
                this.notifyObservers(key, false);
                
                const btn = document.querySelector(`button[data-key="${key}"]`);
                if (btn) btn.classList.remove('active');
                
                this.touchMap.delete(touch.identifier);
            }
        }
    }

    notifyObservers(code, isPressed) {
        const mapping = KEY_MAPPINGS[code];
        if (!mapping) return;

        // Global actions (Pause)
        if (mapping.action === 'pause' && isPressed) {
            window.dispatchEvent(new CustomEvent('game-pause'));
            return;
        }

        this.observers.forEach(observer => {
            if (observer.playerNumber === mapping.player + 1 || 
               (observer.isCPU && mapping.player === undefined)) { 
               observer.handleInput(mapping.action, isPressed);
            }
        });
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        document.removeEventListener('touchstart', this.handleTouch);
        document.removeEventListener('touchmove', this.handleTouch);
        document.removeEventListener('touchend', this.handleTouchEnd);

        if (this.controlsContainer) {
            this.controlsContainer.removeEventListener('touchstart', this.preventDefault);
            this.controlsContainer.removeEventListener('touchmove', this.preventDefault);
            this.controlsContainer.removeEventListener('touchend', this.preventDefault);
        }
    }
}

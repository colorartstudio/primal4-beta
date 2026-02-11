export const CONSTANTS = {
    GRAVITY: 0.5,
    FRICTION: 0.8,
    PLATFORM_HEIGHT: 20,
    GAME_TIME: 99,
    CANVAS_WIDTH_RATIO: 1, // Full width
    CANVAS_HEIGHT_RATIO: 1 // Full height
};

export const CHARACTERS = {
    IGNIS: 'ignis',
    MARINA: 'marina',
    TERRA: 'terra',
    ZEPHYR: 'zephyr'
};

export const KEY_MAPPINGS = {
    // Jogador 1 (WASD)
    'KeyW': { player: 0, action: 'up' },
    'KeyA': { player: 0, action: 'left' },
    'KeyS': { player: 0, action: 'down' },
    'KeyD': { player: 0, action: 'right' },
    'KeyF': { player: 0, action: 'attack' },
    'KeyG': { player: 0, action: 'special' },
    
    // Jogador 2 (Setas + NumPad)
    'ArrowUp': { player: 1, action: 'up' },
    'ArrowLeft': { player: 1, action: 'left' },
    'ArrowDown': { player: 1, action: 'down' },
    'ArrowRight': { player: 1, action: 'right' },
    'Numpad1': { player: 1, action: 'attack' },
    'Numpad2': { player: 1, action: 'special' },
    'Digit1': { player: 1, action: 'attack' },
    'Digit2': { player: 1, action: 'special' },
    
    // Controles gerais
    'Space': { player: 0, action: 'up' }, // Pulo alternativo
    'Escape': { action: 'pause' },
    'KeyP': { action: 'pause' }
};

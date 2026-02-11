import GameEngine from './core/GameEngine.js';
import AudioManager from './core/AudioManager.js';
import { Fireworks } from './utils/Effects.js';

// Estado Global
let currentScreen = 'loading';
let selectedCharacter = null;
let gameMode = null; // 'solo' ou 'versus'
let game = null;
let sprites = {};
let audioManager = new AudioManager();
let fireworks = null;

// Elementos do DOM
const screens = {
    loading: document.getElementById('loading-screen'),
    intro: document.getElementById('intro-screen'),
    title: document.getElementById('title-screen'),
    characterSelect: document.getElementById('character-select-screen'),
    game: document.getElementById('game-screen'),
    pause: document.getElementById('pause-screen'),
    result: document.getElementById('result-screen')
};

// Sistema de Sprites
function loadSprites() {
    sprites = {
        ignis: new Image(),
        marina: new Image(),
        terra: new Image(),
        zephyr: new Image()
    };
    
    sprites.ignis.src = 'assets/ignis.svg';
    sprites.marina.src = 'assets/marina.svg';
    sprites.terra.src = 'assets/terra.svg';
    sprites.zephyr.src = 'assets/zephyr.svg';
    
    const loadPromises = Object.values(sprites).map(sprite => {
        return new Promise((resolve) => {
            sprite.onload = resolve;
            sprite.onerror = () => {
                console.warn(`Sprite ${sprite.src} não carregada, usando fallback`);
                resolve();
            };
        });
    });
    
    return Promise.all(loadPromises);
}

// Inicialização
window.addEventListener('DOMContentLoaded', async () => {
    // Simular carregamento
    setTimeout(() => {
        switchScreen('intro');
        initializeEventListeners();
        updateRankingDisplay();
        initializeCharacterPreviews();
        
        // Iniciar Fogos
        fireworks = new Fireworks('fireworks-canvas', audioManager);
        fireworks.start();

    }, 2000);
    
    await loadSprites();
});

function switchScreen(screenName) {
    Object.values(screens).forEach(screen => {
        if(screen) screen.classList.add('hidden');
    });
    
    if(screens[screenName]) {
        screens[screenName].classList.remove('hidden');
        // GARANTIA DE VISIBILIDADE (Essencial para o app não sumir)
        screens[screenName].style.display = ''; 
        screens[screenName].style.opacity = '';
        currentScreen = screenName;
    }
    
    if (screenName === 'game' && gameMode && selectedCharacter) {
        startGame();
    }
}

function initializeEventListeners() {
    // Intro Screen Logic
    const handleLogin = () => {
        if(fireworks) fireworks.stop();
        audioManager.play('select');
        
        // Animação de saída da intro (opcional)
        screens.intro.style.transition = 'opacity 0.5s ease';
        screens.intro.style.opacity = '0';
        
        setTimeout(() => {
            switchScreen('title');
            screens.intro.style.display = 'none'; // Garantir que saia do fluxo
        }, 500);
    };

    document.getElementById('btn-login').addEventListener('click', handleLogin);
    document.getElementById('btn-register').addEventListener('click', handleLogin); // Simulação por enquanto

    // Menu Principal
    document.getElementById('btn-solo').addEventListener('click', () => {
        audioManager.play('select');
        gameMode = 'solo';
        document.getElementById('select-mode-text').textContent = 'Modo: Solo vs CPU';
        switchScreen('characterSelect');
    });
    
    document.getElementById('btn-versus').addEventListener('click', () => {
        audioManager.play('select');
        document.getElementById('invite-section').classList.remove('hidden');
    });
    
    document.getElementById('btn-ranking').addEventListener('click', () => {
        audioManager.play('select');
        document.getElementById('ranking-section').classList.remove('hidden');
        updateRankingDisplay();
    });
    
    document.getElementById('btn-how-to-play').addEventListener('click', () => {
        audioManager.play('select');
        document.getElementById('how-to-play-section').classList.remove('hidden');
    });
    
    // Convite
    document.getElementById('btn-start-local').addEventListener('click', () => {
        audioManager.play('select');
        gameMode = 'versus';
        document.getElementById('select-mode-text').textContent = 'Modo: PvP Local';
        document.getElementById('invite-section').classList.add('hidden');
        switchScreen('characterSelect');
    });
    
    document.getElementById('btn-cancel').addEventListener('click', () => {
        audioManager.play('select');
        document.getElementById('invite-section').classList.add('hidden');
    });
    
    // Ranking
    document.getElementById('btn-close-ranking').addEventListener('click', () => {
        audioManager.play('select');
        document.getElementById('ranking-section').classList.add('hidden');
    });
    
    // Tutorial
    document.getElementById('btn-close-tutorial').addEventListener('click', () => {
        audioManager.play('select');
        document.getElementById('how-to-play-section').classList.add('hidden');
    });
    
    document.getElementById('btn-close-tutorial-top').addEventListener('click', () => {
        audioManager.play('select');
        document.getElementById('how-to-play-section').classList.add('hidden');
    });
    
    // Seleção de Personagem
    document.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', () => {
            audioManager.play('select');
            document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedCharacter = card.dataset.character;
            document.getElementById('btn-start-fight').disabled = false;
        });
    });
    
    document.getElementById('btn-back-to-menu').addEventListener('click', () => {
        audioManager.play('select');
        switchScreen('title');
    });
    
    document.getElementById('btn-start-fight').addEventListener('click', () => {
        audioManager.play('select');
        if (selectedCharacter) {
            switchScreen('game');
        }
    });
    
    // Controles do Jogo
    document.getElementById('btn-exit-game').addEventListener('click', () => {
        audioManager.play('select');
        if (game) game.stop();
        switchScreen('title');
    });

    document.getElementById('btn-pause').addEventListener('click', () => {
        if (game) game.togglePause();
    });
    
    // Tela de Pausa
    document.getElementById('btn-resume').addEventListener('click', () => {
        if (game) game.togglePause();
    });
    
    document.getElementById('btn-restart').addEventListener('click', () => {
        audioManager.play('select');
        if (game) {
            game.stop();
            startGame();
        }
    });
    
    document.getElementById('btn-quit-to-menu').addEventListener('click', () => {
        audioManager.play('select');
        if (game) game.stop();
        switchScreen('title');
    });
    
    // Tela de Resultado
    document.getElementById('btn-rematch').addEventListener('click', () => {
        audioManager.play('select');
        switchScreen('characterSelect');
    });
    
    document.getElementById('btn-character-select').addEventListener('click', () => {
        audioManager.play('select');
        switchScreen('characterSelect');
    });
    
    document.getElementById('btn-back-to-menu-result').addEventListener('click', () => {
        audioManager.play('select');
        switchScreen('title');
    });
    
    // Mostrar controles móveis se for dispositivo móvel
    if ('ontouchstart' in window) {
        document.querySelector('.mobile-controls').classList.remove('hidden');
    }

    // Escutar eventos do jogo
    window.addEventListener('game-toggled-pause', (e) => {
        if (e.detail.isPaused) {
            switchScreen('pause');
        } else {
            switchScreen('game');
        }
    });

    window.addEventListener('game-over', (e) => {
        showResultScreen(e.detail.winner, e.detail.loser, e.detail.economyResult);
    });

    // Eventos de UI do Jogo
    window.addEventListener('game-float-text', (e) => {
        const { text, x, y, color } = e.detail;
        const floatEl = document.createElement('div');
        floatEl.className = 'float-text';
        floatEl.textContent = text;
        floatEl.style.left = `${x}px`;
        floatEl.style.top = `${y}px`;
        floatEl.style.color = color;
        document.body.appendChild(floatEl);
        
        setTimeout(() => {
            if(floatEl.parentNode) floatEl.parentNode.removeChild(floatEl);
        }, 1000);
    });
}

function startGame() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Notificar Engine sobre o redimensionamento
    if (game && typeof game.resize === 'function') {
        game.resize(canvas.width, canvas.height);
    }
}
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    game = new GameEngine(canvas, ctx, selectedCharacter, gameMode, sprites, audioManager);
    game.start();
}

function updateRankingDisplay() {
    // Usa a global window.gameStorage
    if (!window.gameStorage) return;

    const rankingList = document.getElementById('ranking-list');
    const playerRankFooter = document.getElementById('player-rank-display');
    const topPlayers = window.gameStorage.getTopRanking();
    
    rankingList.innerHTML = '';
    let playerInTop10 = false;
    
    topPlayers.forEach((player) => {
        const isCurrentUser = player.name === "JogadorAtual";
        if (isCurrentUser) playerInTop10 = true;

        const item = document.createElement('div');
        item.className = `ranking-item rank-${player.rank} ${isCurrentUser ? 'current-player' : ''}`;
        
        const displayName = isCurrentUser ? "Você" : player.name;

        item.innerHTML = `
            <div class="col-rank">
                <div class="rank-badge">${player.rank}º</div>
            </div>
            <div class="col-player player-info">
                <span class="player-avatar">${player.avatar}</span>
                <span class="player-name">${displayName}</span>
            </div>
            <div class="col-wins stat-value stat-wins">${player.wins}</div>
            <div class="col-coins stat-value stat-coins">${player.coins}</div>
        `;
        rankingList.appendChild(item);
    });

    if (!playerInTop10) {
        const currentUserData = window.gameStorage.getCurrentUserRank();
        playerRankFooter.classList.remove('hidden');
        playerRankFooter.innerHTML = '';
        
        const item = document.createElement('div');
        item.className = `ranking-item current-player`;
        item.style.borderTop = "none"; 
        item.style.marginTop = "0";
        
        item.innerHTML = `
            <div class="col-rank">
                <div class="rank-badge" style="background: rgba(72, 219, 251, 0.2);">${currentUserData.rank}º</div>
            </div>
            <div class="col-player player-info">
                <span class="player-avatar">${currentUserData.avatar}</span>
                <span class="player-name">Você</span>
            </div>
            <div class="col-wins stat-value stat-wins">${currentUserData.wins}</div>
            <div class="col-coins stat-value stat-coins">${currentUserData.coins}</div>
        `;
        playerRankFooter.appendChild(item);
    } else {
        playerRankFooter.classList.add('hidden');
    }
}

function initializeCharacterPreviews() {
    const characters = {
        ignis: { emoji: '🔥', color: '#ff6b6b' },
        marina: { emoji: '💧', color: '#48dbfb' },
        terra: { emoji: '🌿', color: '#1dd1a1' },
        zephyr: { emoji: '💨', color: '#feca57' }
    };
    
    document.querySelectorAll('.character-preview').forEach(preview => {
        const charType = preview.classList[1];
        const charInfo = characters[charType];
        
        if (sprites[charType] && sprites[charType].complete && sprites[charType].naturalWidth > 0) {
            preview.innerHTML = '';
            const img = document.createElement('img');
            img.src = sprites[charType].src;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            preview.appendChild(img);
        } else {
            preview.innerHTML = charInfo.emoji;
            preview.style.backgroundColor = `${charInfo.color}20`;
            preview.style.color = charInfo.color;
            preview.style.fontSize = '4rem';
            preview.style.display = 'flex';
            preview.style.alignItems = 'center';
            preview.style.justifyContent = 'center';
        }
    });
}

function showResultScreen(winner, loser, economyResult) {
    // Determinar se Jogador 1 ganhou
    const isPlayerWinner = winner.name === 'Jogador 1';
    
    // Elementos DOM
    const victoryTitle = document.getElementById('victory-title');
    const defeatTitle = document.getElementById('defeat-title');
    const winnerDisplay = document.getElementById('winner-character');
    const winnerName = document.getElementById('winner-name');
    const winnerRing = document.querySelector('.winner-avatar-ring');
    
    // Resetar estados
    victoryTitle.classList.add('hidden');
    defeatTitle.classList.add('hidden');
    winnerRing.style.setProperty('--primary-purple', getCharacterColor(winner.element));
    
    // Título e Áudio
    if (isPlayerWinner) {
        victoryTitle.classList.remove('hidden');
        audioManager.play('start'); // Som de vitória
    } else {
        defeatTitle.classList.remove('hidden');
        audioManager.play('hit'); // Som de derrota
    }
    
    // Avatar do Vencedor (Emoji ou Imagem)
    const emojis = { ignis: '🔥', marina: '💧', terra: '🌿', zephyr: '💨' };
    winnerDisplay.innerHTML = emojis[winner.element] || '🏆';
    winnerDisplay.className = `winner-emoji ${winner.element}`;
    
    // Nome do Vencedor
    winnerName.textContent = winner.name;
    winnerName.style.color = getCharacterColor(winner.element);
    
    // --- Estatísticas Pessoais ---
    const prizeEl = document.getElementById('prize-amount');
    const costEl = document.getElementById('match-cost');
    const netEl = document.getElementById('net-gain');
    
    // Animar Números (Count Up)
    animateValue(prizeEl, 0, economyResult.prize, 1000, '+');
    costEl.textContent = '-100'; // Fixo
    
    const netGain = economyResult.prize - 100;
    animateValue(netEl, 0, netGain, 1500, netGain >= 0 ? '+' : '');
    
    // Cores Semânticas
    netEl.className = `stat-value ${netGain >= 0 ? 'success' : 'danger'} highlight-text`;
    
    // --- Ecossistema ---
    animateValue(document.getElementById('eco-game'), 0, economyResult.feeDistribution.gameEcosystem, 800, '+');
    animateValue(document.getElementById('eco-donation'), 0, economyResult.feeDistribution.donations, 900, '+');
    animateValue(document.getElementById('eco-devs'), 0, economyResult.feeDistribution.developers, 1000, '+');
    
    updateRankingDisplay();
    
    setTimeout(() => {
        switchScreen('result');
    }, 1000);
}

// Helper: Animar números
function animateValue(element, start, end, duration, prefix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        element.textContent = `${prefix}${current}`;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Helper: Cor do personagem
function getCharacterColor(element) {
    const colors = {
        ignis: '#ff4500',
        marina: '#00bfff',
        terra: '#32cd32',
        zephyr: '#ffd700'
    };
    return colors[element] || '#ffffff';
}

// Sistema de Armazenamento Local (Fase 1)
// Na Fase 2, substituir por chamadas ao Supabase

class GameStorage {
    constructor() {
        this.initializeStorage();
    }

    // Inicializa os dados no localStorage se não existirem
    initializeStorage() {
        if (!localStorage.getItem('primal4_users')) {
            this.createMockData();
        }
        
        // Inicializa variáveis do ecossistema se não existirem
        if (!localStorage.getItem('primal4_ecosystem')) {
            localStorage.setItem('primal4_ecosystem', JSON.stringify({
                gameEcosystem: 0,
                donations: 0,
                developers: 0
            }));
        }
        
        // Inicializa histórico de partidas se não existir
        if (!localStorage.getItem('primal4_matches')) {
            localStorage.setItem('primal4_matches', JSON.stringify([]));
        }
    }

    // Cria dados mock para a Fase 1
    createMockData() {
        const mockUsers = [
            { id: 1, name: "DrakoFogo", character: "ignis", wins: 42, losses: 8, coins: 2850, avatar: "🐉" },
            { id: 2, name: "SirenAzul", character: "marina", wins: 38, losses: 12, coins: 2450, avatar: "🧜‍♀️" },
            { id: 3, name: "TitanVerde", character: "terra", wins: 35, losses: 15, coins: 2200, avatar: "🗿" },
            { id: 4, name: "TempestAmarelo", character: "zephyr", wins: 31, losses: 19, coins: 1950, avatar: "🌪️" },
            { id: 5, name: "FenixVermelha", character: "ignis", wins: 28, losses: 22, coins: 1650, avatar: "🔥" },
            { id: 6, name: "AquaLady", character: "marina", wins: 25, losses: 25, coins: 1400, avatar: "💧" },
            { id: 7, name: "PedraSólida", character: "terra", wins: 22, losses: 28, coins: 1150, avatar: "🪨" },
            { id: 8, name: "VentoLivre", character: "zephyr", wins: 19, losses: 31, coins: 900, avatar: "💨" },
            { id: 9, name: "ChamasEternas", character: "ignis", wins: 15, losses: 35, coins: 600, avatar: "🌋" },
            { id: 10, name: "Maremoto", character: "marina", wins: 12, losses: 38, coins: 350, avatar: "🌊" },
            { id: 11, name: "JogadorAtual", character: "ignis", wins: 0, losses: 0, coins: 1000, avatar: "🎮" }
        ];

        localStorage.setItem('primal4_users', JSON.stringify(mockUsers));
    }

    // Retorna todos os usuários
    getUsers() {
        const users = JSON.parse(localStorage.getItem('primal4_users')) || [];
        return users;
    }

    // Retorna o usuário atual (jogador principal)
    getCurrentUser() {
        const users = this.getUsers();
        return users.find(user => user.name === "JogadorAtual") || users[0];
    }

    // Atualiza o usuário atual
    updateCurrentUser(updates) {
        const users = this.getUsers();
        const currentUserIndex = users.findIndex(user => user.name === "JogadorAtual");
        
        if (currentUserIndex !== -1) {
            users[currentUserIndex] = { ...users[currentUserIndex], ...updates };
            localStorage.setItem('primal4_users', JSON.stringify(users));
            return users[currentUserIndex];
        }
        
        return null;
    }

    // Retorna o ranking top 10 baseado em moedas e vitórias
    getTopRanking() {
        const users = this.getUsers();
        
        // Inclui todos os usuários, inclusive o atual
        // Ordena por moedas (desc) e depois por vitórias (desc)
        const sortedUsers = users.sort((a, b) => {
            if (b.coins !== a.coins) return b.coins - a.coins;
            return b.wins - a.wins;
        });

        // Adiciona a posição real a cada usuário antes de cortar
        const rankedUsers = sortedUsers.map((user, index) => ({
            ...user,
            rank: index + 1
        }));

        return rankedUsers.slice(0, 10);
    }

    // Retorna a posição e dados do jogador atual
    getCurrentUserRank() {
        const users = this.getUsers();
        
        // Ordena para descobrir o rank
        const sortedUsers = users.sort((a, b) => {
            if (b.coins !== a.coins) return b.coins - a.coins;
            return b.wins - a.wins;
        });

        const rank = sortedUsers.findIndex(user => user.name === "JogadorAtual") + 1;
        const userData = sortedUsers.find(user => user.name === "JogadorAtual");

        return {
            ...userData,
            rank: rank
        };
    }

    // Processa a economia de uma partida
    processMatchEconomy(winnerId, playersCount) {
        const entryCost = 100;
        const totalPot = entryCost * playersCount;
        const fee = totalPot * 0.10; // 10% de taxa
        const prize = totalPot * 0.90; // 90% para o vencedor
        
        // Distribuição da taxa
        const feeDistribution = {
            gameEcosystem: Math.floor(fee * 0.25), // 25% da taxa (2.5% do total)
            donations: Math.floor(fee * 0.25),     // 25% da taxa (2.5% do total)
            developers: Math.floor(fee * 0.50)     // 50% da taxa (5% do total)
        };
        
        // Atualiza o ecossistema
        const ecosystem = JSON.parse(localStorage.getItem('primal4_ecosystem'));
        ecosystem.gameEcosystem += feeDistribution.gameEcosystem;
        ecosystem.donations += feeDistribution.donations;
        ecosystem.developers += feeDistribution.developers;
        localStorage.setItem('primal4_ecosystem', JSON.stringify(ecosystem));
        
        // Atualiza o usuário vencedor (se for o jogador atual)
        const users = this.getUsers();
        const winnerIndex = users.findIndex(user => user.id === winnerId);
        
        if (winnerIndex !== -1 && users[winnerIndex].name === "JogadorAtual") {
            users[winnerIndex].coins += prize;
            users[winnerIndex].wins += 1;
            localStorage.setItem('primal4_users', JSON.stringify(users));
        }
        
        // Registra a partida
        const matches = JSON.parse(localStorage.getItem('primal4_matches')) || [];
        matches.push({
            id: matches.length + 1,
            winnerId,
            playersCount,
            prize,
            feeDistribution,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('primal4_matches', JSON.stringify(matches));
        
        return {
            totalPot,
            fee,
            prize,
            feeDistribution,
            winner: users[winnerIndex] || null
        };
    }

    // Retorna as estatísticas do ecossistema
    getEcosystemStats() {
        return JSON.parse(localStorage.getItem('primal4_ecosystem'));
    }

    // Retorna o histórico de partidas
    getMatchHistory() {
        return JSON.parse(localStorage.getItem('primal4_matches')) || [];
    }

    // Reinicia os dados (para teste)
    resetData() {
        this.createMockData();
        localStorage.setItem('primal4_ecosystem', JSON.stringify({
            gameEcosystem: 0,
            donations: 0,
            developers: 0
        }));
        localStorage.setItem('primal4_matches', JSON.stringify([]));
    }
}

// Exporta uma instância única do storage
window.gameStorage = new GameStorage();
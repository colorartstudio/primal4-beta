# Economia e ranking

Implementado em `js/storage.js`. A tela de vitória lê o retorno em `js/main.js`.

## Regra desenhada

Para `playersCount` lutadores (hoje sempre **2**):

| Item | Cálculo | Valor com 2 lutadores |
| --- | --- | --- |
| Entrada | 100 moedas por cabeça | 100 |
| Pote | `100 × playersCount` | 200 |
| Taxa | 10% do pote | 20 |
| Prêmio | 90% do pote | 180 |
| Ecossistema | `floor(taxa × 0.25)` | 5 |
| Doação | `floor(taxa × 0.25)` | 5 |
| Devs | `floor(taxa × 0.50)` | 10 |

A taxa mostrada no rodapé do menu coincide com esses percentuais: 90% vencedor, 10% ecossistema. O texto de “cada partida custa 100 moedas” descreve a entrada.

## O que a luta faz de fato

- O HUD mostra o pote **200** gravado no motor. Não passa por `processMatchEconomy` para desenhar esse número.
- No fim da partida o motor chama `processMatchEconomy(11, quantidade de lutadores)`. O id **11** é o mock `JogadorAtual`. O vencedor real da arena **não** entra nessa chamada.
- A entrada de 100 **não é debitada** no início. Só o prêmio é somado, e só se o id 11 for o `JogadorAtual`.
- Vitória no placar do usuário também sobe **+1** nessa mesma condição, mesmo se a CPU ganhou o round.
- A tela de resultado anima `economyResult.prize` e calcula ganho líquido `prize − 100` só na interface. O saldo no `localStorage` recebe o prêmio inteiro (180), sem subtrair a entrada.
- A fatia do ecossistema (5 / 5 / 10) acumula em `primal4_ecosystem` em toda partida processada.

## Ranking

Top 10 lido do `localStorage`:

1. Mais moedas.
2. Em empate de moedas, mais vitórias.

O usuário atual começa o mock com **1000** moedas, **0** vitórias e personagem `ignis`, nome `JogadorAtual`.

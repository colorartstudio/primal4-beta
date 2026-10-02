# Partida

## Modos

- **Solo:** jogador 1 escolhe o elemento. A CPU nasce com um dos outros três, sorteado.
- **Versus local:** o jogador 1 escolhe o elemento. O jogador 2 também recebe um elemento sorteado, diferente do jogador 1. Não há tela de escolha para o segundo guerreiro.
- O pote mostrado no HUD nasce fixo em **200**.
- Dois lutadores por partida. FFA com mais jogadores não existe no motor.

## Relógio

- Duração: **99 segundos**.
- O timer pausa com o jogo pausado e para quando a partida acaba.
- Em **0**, a partida encerra na hora.

## Como a partida termina

1. Vida de um lutador chega a **0**.
2. Ring out: o lutador passa de `canvas.height + 100` para baixo. A vida dele vai a 0 e a partida encerra naquele frame.
3. O tempo chega a 0.

Vencedor: quem ficou com **mais vida**.

Empate de vida: o **jogador 1** vence (inclusive no desempate do tempo).

O ring out encerra a luta mesmo que o outro lutador esteja com menos vida, porque a vida de quem caiu vira 0 antes da comparação.

## Corpo

Todos os guerreiros usam o mesmo corpo:

- Largura **74**
- Altura **108**
- Vida máxima **900**
- Vida inicial **900**

## Controles

| Ação | Jogador 1 | Jogador 2 |
| --- | --- | --- |
| Pulo | W ou Espaço | Seta cima |
| Esquerda | A | Seta esquerda |
| Direita | D | Seta direita |
| Abaixar | S | Seta baixo |
| Ataque | F | 1 ou Numpad 1 |
| Especial | G | 2 ou Numpad 2 |
| Pausa | Esc ou P | Esc ou P |

**Hoje:** a tecla de abaixar entra no mapa de input e no tutorial, mas `Fighter` não aplica agachar, defesa baixa nem queda rápida.

Espaço é pulo extra só do jogador 1.

## Seleção visual

A descrição da carta no menu ainda promete papéis que o combate não aplica por inteiro. O detalhe está em [guerreiros.md](guerreiros.md).

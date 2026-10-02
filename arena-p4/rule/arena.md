# Arena e física

## Mundo

- Gravidade: **0.5** por frame, só enquanto o lutador não está no chão.
- Fricção horizontal: `velocityX` é multiplicada por **0.8** todo frame, antes de somar a posição.
- Movimento contínuo (tecla presa) reescreve `velocityX` para `±speed × speedMultiplier` depois da fricção, dentro de `Fighter.update()`.
- Paredes laterais: o X fica preso entre **0** e `largura do canvas − 40`. Não há queda pelas laterais.
- Ring out só existe para baixo. Ver [partida.md](partida.md).

## Plataformas

Sempre recriadas no tamanho atual da tela.

- Chão: y = `altura − 100`, largura total, altura **20**.
- Três degraus, largura fixa **200**:

| Degrau | X | Altura acima do chão |
| --- | --- | --- |
| Esquerda | 10% da largura | 180 |
| Centro | 40% da largura | 270 |
| Direita | 70% da largura | 360 |

A colisão com plataforma só resolve a queda (velocidade Y positiva). O lutador gruda no topo da plataforma. Não há bloqueio de teto, de parede de plataforma nem passagem controlada por baixo: qualquer sobreposição de caixas com Y caindo vira pouso.

## Pulo

- No chão: `velocityY = jumpForce` do guerreiro.
- Segundo pulo: só Zephyr, e só uma vez por salto. Força = `jumpForce × 0.8`.
- Ao pousar, o segundo pulo volta a existir se o elemento for Zephyr.

## Nascente

- Jogador 1: 10% da largura, 100 px acima do chão, virado para a direita.
- Jogador 2 humano: 80% da largura, 100 px acima do chão, virado para a esquerda.
- CPU: 80% da largura, no máximo 350 px acima do chão, sem sair acima de y = 50.

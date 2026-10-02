# CPU (modo solo)

A CPU é um `Fighter` com `isCPU`. Não escolhe elemento por função: recebe um dos três que o jogador não escolheu.

Decisão a cada frame, nesta ordem. A CPU não usa abaixar.

## 1. Recuperação

Se `y > altura do canvas − 200` e ainda não está no chão:

- Segura pulo.
- Anda para o centro da tela.
- Ignora o resto da IA neste frame.

## 2. Briga (distância euclidiana < 150)

- Anda na direção horizontal do alvo e vira o rosto para ele.
- Se `|Δx| < 80` e `|Δy| < 50`: **10%** de chance por frame de apertar ataque por 50 ms.
- Se o alvo está com `isAttacking`: **5%** de chance de segurar pulo por 200 ms.

## 3. Perseguição (distância ≥ 150)

- Se o alvo está pelo menos **100 px** acima e a CPU está no chão: pulo por 300 ms.
- Se `|Δx| > 60`: anda até o alvo.
- Se já está alinhada na horizontal: solta esquerda e direita.

## 4. Especial

Independente do bloco acima (exceto quando a recuperação deu `return`):

- Cooldown do especial em zero, distância **< 200** e **1%** de chance por frame: aperta especial por 100 ms.

O especial da CPU segue as mesmas regras do jogador em [guerreiros.md](guerreiros.md).

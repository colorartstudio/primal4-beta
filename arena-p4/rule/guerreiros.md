# Guerreiros

Valores de `Fighter.setElementStats` e `activatePower`. O papel escrito na tela está na coluna **Tela**. A coluna **Hoje** é o que a luta faz.

## Comparativo

| | Ignis | Marina | Terra | Zephyr |
| --- | ---: | ---: | ---: | ---: |
| Elemento | fogo | água | terra | ar |
| Velocidade | 5 | 4.5 | 4 | 6 |
| Força do pulo | −12 | −11 | −10 | −13 |
| `attackRange` (não usado no acerto) | 40 | 35 | 35 | 30 |
| Dano do básico | 12 | 10 | 13 | 9 |
| Knockback | 5 | 8 | 4 | 6 |
| Pulo duplo | não | não | não | sim |
| Cor de fallback | `#ff6b6b` | `#48dbfb` | `#1dd1a1` | `#feca57` |

Corpo, vida (900) e cooldown de botões são iguais para os quatro. Ver [combate.md](combate.md).

Golpes para zerar 900 de vida, se cada acerto contasse uma vez e sem redução: Ignis 75, Marina 90, Terra 70, Zephyr 100.

---

## Ignis

**Tela:** hitbox maior e dano alto.

**Hoje no básico**

- Maior dano entre os ágeis, mas Terra bate mais forte (15 contra 12).
- `attackRange` 40 só existe como dado. O acerto continua sendo a caixa do corpo.
- O círculo do golpe desenhado é o único “alcance” visível maior (raio 40 contra 30).
- Sem recuo nem avanço no básico.

**Especial — Firestorm**

A liberação é uma sequência de frames. O dano sai no frame 8, num raio de 118. Detalhe em [poderes.md](poderes.md).

---

## Marina

**Tela:** empurra o oponente.

**Hoje no básico**

- Maior knockback passivo (**8**).
- No frame do ataque, ganha um recuo próprio: `velocityX += −2` se olha para a direita, `+2` se olha para a esquerda.

**Especial — Tsunami**

No frame 8 nasce uma onda que anda na direção do olhar, empurra e deixa o alvo mais lento por 50 frames. Detalhe em [poderes.md](poderes.md).

---

## Terra

**Tela:** mais pesado e resistente a knockback.

**Hoje no básico**

- Mais lento (4) e pulo mais curto (−10).
- Golpe pesado de **13**, ainda o mais forte dos básicos, e menor knockback (**4**).
- Não há massa, peso nem redução passiva de knockback. Empurrão de contato (±2) e knockback funcionam iguais aos outros.
- Cai na mesma gravidade (0.5). Não existe “cai mais rápido”.

**Especial — Manto**

No frame 8 o solo estoura num raio de 72. O escudo dura **90** frames, corta **45%** do dano e deixa metade do knockback. O botão só volta depois de **320** frames, então existe uma janela longa sem o Manto.

---

## Zephyr

**Tela:** pulo duplo e mais velocidade.

**Hoje no básico**

- Mais rápido (6) e pulo mais alto (−13).
- Segundo pulo com força `−13 × 0.8 = −10.4`, uma vez por salto.
- Menor dano (9).
- No frame do ataque, avança: `velocityX += 5` se olha para a direita, `−5` se olha para a esquerda.

**Especial — Tornado**

Do frame 6 ao 15 ele avança em dash e acerta uma vez no raio 52. Depois disso a velocidade fica em ×1.65 por cerca de 70 frames e volta ao normal. Detalhe em [poderes.md](poderes.md).

---

## Efeitos visuais ligados ao golpe

`EffectsManager` só desenha partículas. Não alteram hitbox nem dano.

| Tipo | Quando | Desenho |
| --- | --- | --- |
| fire | Acerto do Ignis | Círculo que encolhe |
| water | Acerto da Marina | Anel que cresce |
| earth | Acerto da Terra, e de novo no escudo | Quadrado |
| air | Acerto do Zephyr | Arco |
| hit | Reservado, o combate dos quatro usa o tipo do elemento | Círculo |

Vida da partícula: cai **0.05** por frame a partir de 1.0 (~20 frames).

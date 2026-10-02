# Frames da liberação

Cada especial é uma sequência curta. O golpe existe num frame marcado, não no clique inteiro.

O lutador fica plantado até o frame de liberação (o dash do Zephyr é a exceção). Um acerto do especial também trava o alvo por alguns frames, então a rajada do básico não empilha em cima do poder no mesmo contato.

A barra fina embaixo do sprite e a segunda barra do HUD enchem de novo quando o cooldown acaba. No frame 0 aparece o nome do poder no centro da arena.

Números em `js/vfx/PowerFrames.js`.

## Ignis — Firestorm

| Frames | O que se vê | O que a luta faz |
| --- | --- | --- |
| 0–7 | Brasas girando e fechando no corpo | Plantado. Sem dano |
| 8 | Anel abre | Dano **28**, knockback **9**, raio **118** |
| 9–29 | Línguas de fogo se apagam | Só visual |

Cooldown do botão: **180** frames.

## Marina — Tsunami

| Frames | O que se vê | O que a luta faz |
| --- | --- | --- |
| 0–7 | Gotas puxadas para a frente | Plantada. Sem dano |
| 8 | A onda nasce na frente do corpo | Começa a viajar |
| 8–33 da onda | Crista andando na direção do olhar | No primeiro toque: dano **16**, knockback **18**, alvo a 50% da velocidade por **50** frames |

A onda vive **26** frames e anda **11** px por frame. Cooldown: **180**.

## Terra — Manto

| Frames | O que se vê | O que a luta faz |
| --- | --- | --- |
| 0–7 | Lascas sobem do chão | Plantado. Sem dano |
| 8 | Placas fecham num arco | Dano **10**, knockback **8**, raio **72**. Escudo liga |
| 9–25 | O arco abre e some | Visual da pancada |
| depois | Aura verde | Por **90** frames: dano recebido × **0.55** e knockback pela metade. Marina ainda deixa o Terra mais lento. Ao acabar, a defesa volta ao normal |

Cooldown: **320** frames (~5 s). O escudo ocupa cerca de **90** frames disso.

## Zephyr — Tornado

| Frames | O que se vê | O que a luta faz |
| --- | --- | --- |
| 0–5 | Arcos de vento | Plantado |
| 6–15 | Redemoinho e rastros para trás | Dash de **13** px/frame. Dano **14** e knockback **8** uma vez, raio **52** |
| 16–27 | O giro se abre | Visual |
| depois | Aura dourada | Velocidade × **1.65** por **70** frames, contados desde o frame 6 |

Cooldown: **160**. O segundo pulo do básico continua só no Zephyr.

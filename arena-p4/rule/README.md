# Regras atuais — Primal 4

Fonte de verdade desta pasta: o jogo que o navegador carrega hoje.

- Entrada: `index.html` → `js/main.js` (módulo)
- Combate e arena: `js/core/GameEngine.js`
- Guerreiro: `js/entities/Fighter.js`
- Constantes globais: `js/utils/Constants.js`
- Economia: `js/storage.js`
- Partículas da arena: `js/core/EffectsManager.js`

`js/game1.js` não entra na página. Os números dele não valem para a jogabilidade atual.

Tempos de cooldown estão em **frames do loop** (`requestAnimationFrame`). Os comentários do código assumem ~60 fps (180 frames ≈ 3 segundos). Se o loop cair de taxa, os cooldowns demoram mais no relógio.

## Índice

| Arquivo | Conteúdo |
| --- | --- |
| [partida.md](partida.md) | Modos, tempo, vitória, ring out, controles |
| [arena.md](arena.md) | Física, plataformas, limites |
| [combate.md](combate.md) | Acerto, dano, knockback, janela de ataque |
| [guerreiros.md](guerreiros.md) | Stats e especial de cada elemento |
| [poderes.md](poderes.md) | Frames da liberação de cada poder |
| [ia.md](ia.md) | CPU do modo solo |
| [economia.md](economia.md) | Pote, taxa, prêmio, ranking |

O texto ao lado de cada regra descreve o comportamento **executado**, inclusive desvios do tutorial em `index.html`. Esses desvios estão marcados com **hoje** e **tela**.

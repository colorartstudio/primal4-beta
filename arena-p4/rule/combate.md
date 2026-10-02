# Combate

## O que conta como acerto

O golpe básico acerta quando as **caixas do corpo** (74×108) se sobrepõem e `isAttacking` ainda é verdadeiro no atacante.

O campo `attackRange` de cada guerreiro **não entra** no teste de acerto. O círculo desenhado na frente do sprite também é só visual: raio **40** para Ignis e **30** para os outros, deslocado 30 px para o lado que ele olha.

Se os corpos não encostam, o golpe não dá dano, mesmo com o círculo pintado em cima do alvo.

## Empurrão de contato

Todo frame em que os corpos se cruzam, cada um recebe **±2** de velocidade horizontal para se separar, antes do knockback do golpe.

## Janela do ataque básico

- Ao apertar ataque com cooldown em zero: `isAttacking = true`, cooldown = **25** frames.
- `isAttacking` apaga quando o cooldown chega a **10** ou menos.
- Janela útil de acerto: cerca de **15 frames** (cooldown de 25 até 11).
- Depois de um acerto, o alvo recebe `hitLock` de **14** frames. O mesmo aperto não aplica o golpe de novo enquanto os corpos continuam juntos.

## Fórmula do dano

Caminho normal:

```
danoFinal = danoDoGolpe × (1 − damageReduction)
vida = max(0, vida − danoFinal)
```

`damageReduction` começa em **0**.

Knockback no caminho normal:

- Direção: do atacante para o defensor no eixo X.
- `velocityX += sinal × knockbackPower` (já modificado por bônus, se houver).
- `velocityY = -5` (substitui a velocidade vertical, não soma).

O número flutuante é o dano que a vida realmente perdeu, já com a redução do Manto.

## Especial

O botão de especial abre a sequência descrita em [poderes.md](poderes.md). O dano do poder sai no frame de liberação (área, onda ou dash), separado do ataque básico.

`damageReduction` volta a **0** quando o escudo da Terra termina. O bônus de velocidade do Zephyr volta a **1** quando o tornado termina.

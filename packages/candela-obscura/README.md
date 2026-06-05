# @lippelt/srd-candela-obscura

Módulo Candela Obscura / Illuminated Worlds para [`@lippelt/srd-core`](../core).

> Candela Obscura™ é trademark da [Darrington Press LLC](https://darringtonpress.com/). Mecânica derivada do sistema Illuminated Worlds sob a [Darrington Press Community Gaming License (DPCGL)](https://darringtonpress.com/license/). Candela Obscura não tem tradução oficial PT-BR; usamos termos próprios.

## O que inclui

- **Reserva de dados d6 (take highest)** — `roll('check' | 'action' | 'pool', { pool, gilded? })`
  - `6` → `clean` (sucesso pleno)
  - `4-5` → `partial` (sucesso com custo)
  - `1-3` → `failure` (falha)
  - `gilded: true` anota a recuperação de 1 Impulso (Drive).
- **Rolagem de resistência** — `roll('resistance', { pool })` interpreta o resultado em termos de redução de consequência (−0/−1/−2 Impulso).
- **6 condições** — Sangrando, Abalado, Caçado, Iluminado, Comprometido, Exausto (Bleeding, Shaken, Hunted, Illuminated, Compromised, Exhausted).
- **7 campos de status** — bodyMarks/brainMarks/bleedMarks (marcas no corpo / mentais / de sangramento, 0..3 cada), cicatrizes (0..9), Impulso em 3 grupos (Coragem, Astúcia, Intuição).
- **Presets de dados** — reserva 1..6 + resistência.

## Não inclui

Setting (Newfaire, capítulos da Candela, lore), nomes de NPCs, conteúdo de campanha. Use o livro/SRD oficial pra esse material.

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { candelaObscura } from '@lippelt/srd-candela-obscura'

register(candelaObscura)
```

## Licença

[MIT](LICENSE) (código). Mecânica usa Illuminated Worlds via DPCGL.

# @lippelt/srd-candela-obscura

Módulo Candela Obscura / Illuminated Worlds para [`@lippelt/srd-core`](../core).

> Candela Obscura™ é trademark da [Darrington Press LLC](https://darringtonpress.com/). Mecânica derivada do sistema Illuminated Worlds sob a [Darrington Press Community Gaming License (DPCGL)](https://darringtonpress.com/license/).

## O que inclui

- **Dice pool d6 (take highest)** — `roll('check' | 'action' | 'pool', { pool, gilded? })`
  - `6` → `clean` (sucesso pleno)
  - `4-5` → `partial` (sucesso com custo)
  - `1-3` → `failure`
  - `gilded: true` anota recuperação de 1 Drive
- **Resistance roll** — `roll('resistance', { pool })` interpreta o outcome em termos de redução de consequência (-0/-1/-2 Drive)
- **6 conditions** — Bleeding, Shaken, Hunted, Illuminated, Compromised, Exhausted
- **7 tracker fields:** bodyMarks/brainMarks/bleedMarks (0..3 cada), scars (0..9), drive em 3 grupos (Nerve, Cunning, Intuition)
- **Dice presets:** pool 1..6 + resistance

## Não inclui

Setting (Newfaire, Capítulos da Candela, lore), nomes de NPCs, conteúdo de campaign. Use o livro/SRD oficial pra esse material.

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { candelaObscura } from '@lippelt/srd-candela-obscura'

register(candelaObscura)
```

## Licença

[MIT](LICENSE) (código). Mecânica usa Illuminated Worlds via DPCGL.

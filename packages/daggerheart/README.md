# @lippelt/srd-daggerheart

Módulo Daggerheart para [`@lippelt/srd-core`](../core).

> Daggerheart™ é trademark da [Darrington Press LLC](https://darringtonpress.com/). Este pacote usa mecânicas do [Daggerheart SRD](https://www.daggerheart.com/srd/) sob a [Darrington Press Community Gaming License (DPCGL)](https://darringtonpress.com/license/).

## O que inclui

- **Duality Dice** — `roll('check' | 'duality', { modifier, difficulty?, advantage?, disadvantage? })` rola 2d12 (Hope/Fear). Anota outcome: `with-hope`, `with-fear` ou `critical` (Hope = Fear).
- **Damage thresholds** — `applyDamage(amount, { major, severe, armorMark? })` retorna HP marks (0..3) conforme a banda. `armorMark: true` reduz a severidade em 1 banda.
- **Damage roll** — `roll('damage', { count, sides, modifier })` simples
- **10 conditions** — Restrained, Vulnerable, Hidden, Burning, Poisoned, Stunned, Distracted, Cloaked, Charged, Down
- **10 tracker fields** — HP/HPmax, Stress/Stmax, Armor/Armax, Hope, Evasion, Major/Severe Thresholds
- **7 dice presets** — Duality + d4/d6/d8/d10/d12 (damage) + d20

## Não inclui

Conteúdo de campaign frame (Witherwild), nomes de classes/ancestries/communities específicos, lore. Use o livro/SRD oficial pra esse material.

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { daggerheart } from '@lippelt/srd-daggerheart'

register(daggerheart)
```

## Licença

[MIT](LICENSE) (código). Mecânicas usam o Daggerheart SRD via DPCGL.

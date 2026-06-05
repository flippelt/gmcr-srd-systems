# @lippelt/srd-starfinder-1e

Módulo Starfinder 1ª Edição para [`@lippelt/srd-core`](../core).

Baseado no [Starfinder SRD](https://www.aonsrd.com/) da Paizo sob **Open Game License v1.0a**.

## Bundle

- **7 dice presets** — d20, d4–d12, d100
- **30 conditions** SRD (Asleep, Bleeding, Burning, Dazed, Dying, Encumbered, Entangled, Exhausted, Fascinated, Fatigued, Flat-Footed, Frightened, Grappled, Off-target, Paralyzed, Pinned, Sickened, Staggered, Stunned, etc)
- **8 tracker fields** — **EAC** + **KAC** (separadas, energia vs cinético), Fort, Ref, Will, BAB, **Stamina Points**, **Resolve Points**
- **Rules:**
  - `roll('d20'/'check'/'ability'/'skill', { modifier })`
  - `roll('attack', { modifier, damageType: 'kinetic'|'energy', targetEAC?, targetKAC? })` — escolhe a AC certa
  - `roll('save', { modifier, dc })`
  - `roll('damage', { count, sides, modifier, damageType? })`
- **Helpers:** `abilityMod`, `spellSaveDC`, **`applyToStaminaThenHp`** (drena SP primeiro, sobra vai pra HP)

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { starfinder1e } from '@lippelt/srd-starfinder-1e'

register(starfinder1e)
```

## Licença

[MIT](LICENSE). Conteúdo do Starfinder SRD sob OGL 1.0a.

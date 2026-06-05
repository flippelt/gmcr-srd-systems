# @lippelt/srd-pathfinder-1e

Módulo Pathfinder 1ª Edição para [`@lippelt/srd-core`](../core).

Baseado no [Pathfinder Reference Document](https://paizo.com/community/communityuse) da Paizo, sob **Open Game License v1.0a**.

## Bundle

- **7 dice presets** — d20, d4–d12, d100
- **32 conditions** PRD (Bleed, Broken, Dazed, Dazzled, Dying, Energy Drained, Flat-Footed, Frightened, Grappled, Helpless, Incorporeal, Invisible, Nauseated, Panicked, Paralyzed, Petrified, Pinned, Prone, Shaken, Sickened, Staggered, Stunned, etc)
- **9 tracker fields** — CA, Touch, Flat-Footed, Fort, Ref, Will, BAB, **CMB**, **CMD**
- **Rules:**
  - `roll('d20'/'check'/'ability'/'skill', { modifier })`
  - `roll('attack', { modifier, targetAC, critRange? })` — 20 nat crita; threat range
  - `roll('save', { modifier, dc })` — 20 nat auto-passa; 1 nat auto-falha
  - `roll('damage', { count, sides, modifier, critMultiplier? })`
  - `roll('combat-maneuver'/'maneuver', { cmb, targetCMD })` — manobras CMB vs CMD
- **Helpers:** `abilityMod`, `spellSaveDC`, `combatManeuverDefense`

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { pathfinder1e } from '@lippelt/srd-pathfinder-1e'

register(pathfinder1e)
```

## Licença

[MIT](LICENSE). Conteúdo do PRD sob OGL 1.0a.

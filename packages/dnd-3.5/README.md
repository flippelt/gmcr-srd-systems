# @lippelt/srd-dnd-3.5

Módulo D&D 3.5 para [`@lippelt/srd-core`](../core).

Baseado no [System Reference Document 3.5](https://www.opengamingfoundation.org/) sob a **Open Game License v1.0a**.

## Bundle

- **7 dice presets** — d20, d4–d12, d100
- **24 conditions** SRD 3.5 (Blinded, Cowering, Dazed, Dying, Frightened, Grappled, Helpless, Panicked, Paralyzed, Petrified, Pinned, Prone, Shaken, Sickened, Stunned, etc)
- **5 tracker fields** — CA, Fort, Ref, Will, BAB
- **Rules:**
  - `roll('d20'/'check'/'ability'/'skill', { modifier })` — d20 + mod, anota 20/1 natural
  - `roll('attack', { modifier, targetAC, critRange? })` — vs AC, marca crit (20 nat auto + threat range)
  - `roll('save', { modifier, dc })` — 20 nat auto-passa, 1 nat auto-falha
  - `roll('damage', { count, sides, modifier, critMultiplier? })` — multiplica dados em crit (×2/×3/×4)
- **Helpers:** `abilityMod`, `spellSaveDC`

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { dnd35 } from '@lippelt/srd-dnd-3.5'

register(dnd35)
```

## Licença

[MIT](LICENSE). Conteúdo do SRD 3.5 sob OGL 1.0a.

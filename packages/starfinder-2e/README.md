# @lippelt/srd-starfinder-2e

Módulo Starfinder 2ª Edição para [`@lippelt/srd-core`](../core).

Baseado no [Starfinder Second Edition Reference Document](https://paizo.com/community/communityuse) sob a [ORC License](https://paizo.com/orclicense).

## O que combina

SF2e une dois universos mecânicos:

- **De PF2e:** degrees of success ±10 (critical success/success/failure/critical failure), proficiency ranks, 3-action economy (Quickened/Slowed valoradas), Multiple Attack Penalty (MAP).
- **De SF1e:** EAC/KAC separadas pelo tipo do dano, Stamina Points + HP (drena SP primeiro), Resolve Points como recurso narrativo.

## Bundle

- **7 dice presets** — d20, d4–d12, d100
- **31 conditions** (Clumsy N, Frightened N, Quickened, Slowed N, Wounded N + Off-Guard e Overheated específicos do SF2)
- **10 tracker fields** — EAC, KAC, Fort, Ref, Will, Perception, Speed, SP, RP, Hero Points
- **Rules:**
  - `roll('check'/'skill'/'perception', { modifier, dc? })`
  - `roll('attack', { modifier, damageType: 'kinetic'|'energy', targetEAC?, targetKAC?, map? })`
  - `roll('save', { modifier, dc })`
  - `roll('damage', { count, sides, modifier, damageType?, critical? })` — crit ×2
- **Helpers:** `abilityMod`, `proficiencyBonus(rank)`, `degreeOfSuccess(total, dc, natural)`, **`applyToStaminaThenHp`**

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { starfinder2e } from '@lippelt/srd-starfinder-2e'

register(starfinder2e)
```

## Licença

[MIT](LICENSE). Conteúdo do SF2 SRD sob ORC License.

# @lippelt/srd-pathfinder-2e

Módulo Pathfinder 2e para [`@lippelt/srd-core`](../core).

Baseado no [Pathfinder Reference Document (PF2)](https://paizo.com/community/communityuse) sob a [ORC License](https://paizo.com/orclicense).

## Diferenças vs PF1e

- **Degrees of success**: Crit Success (≥ DC+10), Success (≥ DC), Failure (≥ DC−10), Crit Failure (< DC−10). 20 natural sobe um grau, 1 natural desce.
- **Multiple Attack Penalty (MAP)**: 2º ataque −5, 3º −10 — parâmetro `map` na rolagem de attack.
- **Proficiency ranks**: untrained/trained/expert/master/legendary com bônus 0/2/4/6/8.
- **3-action economy**: tracker traz `quickened` e `slowed` como conditions valoradas.
- **Hero Points** + **Focus Points** como recursos.

## Bundle

- **7 dice presets** — d20, d4–d12, d100
- **36 conditions** (Clumsy N, Doomed N, Drained N, Dying N, Enfeebled N, Frightened N, Quickened, Slowed N, Stunned N, Stupefied N, Wounded N, etc — todas com valor numérico)
- **8 tracker fields** — CA, Fort, Ref, Will, Perception, Speed, Hero Points, Focus Points
- **Rules:**
  - `roll('check'/'skill'/'perception', { modifier, dc? })` — retorna degree of success
  - `roll('attack', { modifier, targetAC, map? })` — MAP aplicado, degree of success
  - `roll('save', { modifier, dc })`
  - `roll('damage', { count, sides, modifier, critical? })` — crit dobra o total
- **Helpers:** `abilityMod`, `proficiencyBonus(rank)`, `degreeOfSuccess(total, dc, natural)`

## Uso

```ts
import { register } from '@lippelt/srd-core'
import { pathfinder2e } from '@lippelt/srd-pathfinder-2e'

register(pathfinder2e)
```

## Licença

[MIT](LICENSE). Conteúdo do PRD PF2 sob ORC License.

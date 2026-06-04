# @flippelt/srd-dnd5e-2024

Módulo D&D 5e (2024 / "One D&D") para [`@flippelt/srd-core`](../core).

Baseado no [System Reference Document 5.2](https://dnd.wizards.com/resources/systems-reference-document) da Wizards of the Coast, sob **Creative Commons Attribution 4.0 International**.

## Diferenças vs `@flippelt/srd-dnd5e-2014`

- **Exhaustion**: agora uma escala única 1..10 com **−2 cumulativo** em d20 tests por nível; nível 10 = morte (vs 6 níveis discretos do 5.1).
  - O parâmetro `exhaustion` no `roll('d20')` / `roll('attack')` / `roll('save')` aplica o penalty automaticamente.
  - O tracker tem o campo `exhaustion` (0..10) pra registrar.
- **Conditions**: 14 + Exhaustion como entrada única (em vez de `exhaustion-1` até `exhaustion-6`).
- **Resto da matemática**: idêntica à 2014 — advantage/disadvantage, crit em 20 natural, save DC = 8 + prof + mod, etc.

## Bundle

- **9 dice presets** — d20 (+ adv/desv), d4-d12, d100
- **15 conditions** — Blinded, Charmed, Deafened, Exhaustion (level), Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious
- **4 tracker fields** — CA, Exh, Mortes ✓, Mortes ✗
- **Rules:** `check`, `attack`, `save`, `damage`, `applyDamage` (resistance/vulnerability/immunity)
- **Helpers:** `abilityMod`, `spellSaveDC`, `spellAttackBonus`, `exhaustionPenalty`

## Uso

```ts
import { register } from '@flippelt/srd-core'
import { dnd5e2024 } from '@flippelt/srd-dnd5e-2024'

register(dnd5e2024)
```

## Licença

[MIT](LICENSE). Mecânica deriva do SRD 5.2 (CC-BY 4.0, Wizards of the Coast).

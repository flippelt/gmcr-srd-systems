# @lippelt/srd-dnd5e-2014

Módulo Dungeons & Dragons 5ª Edição (2014) para [`@lippelt/srd-core`](../core).

> D&D® é trademark da Wizards of the Coast LLC. Este pacote usa mecânicas do [System Reference Document 5.1](https://dnd.wizards.com/resources/systems-reference-document) sob a [Creative Commons Attribution 4.0 International License (CC-BY 4.0)](https://creativecommons.org/licenses/by/4.0/legalcode).

## O que inclui

- **d20 com vantagem/desvantagem** — `roll('check' | 'd20', { modifier, advantage?, disadvantage? })`. Vantagem e desvantagem se cancelam (regra SRD).
- **Attack roll vs AC** — `roll('attack', { modifier, targetAC?, advantage?, disadvantage? })`. Crítico natural 20 sempre acerta; 1 sempre erra.
- **Saving throw** — `roll('save', { modifier, dc?, advantage?, disadvantage? })`.
- **Damage roll** — `roll('damage', { count, sides, modifier, critical? })`. `critical: true` dobra os dados.
- **Helpers exportados**:
  - `abilityMod(score)` — `floor((score - 10) / 2)`
  - `spellSaveDC(proficiency, casterMod)` — `8 + prof + mod`
  - `spellAttackBonus(proficiency, casterMod)` — `prof + mod`
- **20 conditions** — Blinded, Charmed, Deafened, Exhaustion (níveis 1–6), Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious.
- **3 tracker fields** — AC (Classe de Armadura), Death Successes ✓, Death Failures ✗.
- **9 dice presets** — d20, d20 advantage/disadvantage, d4/d6/d8/d10/d12 (damage), d100.

## Não inclui

Spells, classes, races, monstros, items específicos — esse conteúdo deve vir do livro/SRD oficial ou de uma camada acima (compendium do consumidor). Este pacote modela só **mecânicas** (dice, condições, modificadores derivados).

## Uso

```ts
import { register, getSystem } from '@lippelt/srd-core'
import { dnd5e2014, abilityMod, spellSaveDC } from '@lippelt/srd-dnd5e-2014'

register(dnd5e2014)

const sys = getSystem('dnd5e-2014')!

// Attack roll com vantagem contra CA 16
const atk = sys.rules!.roll!('attack', { modifier: 6, targetAC: 16, advantage: true })
// → { total: 24, notes: ['vantagem', 'acertou (CA 16)'], ... }

// DC de feitiço pra um warlock CHA 18 com proficiência +3
const dc = spellSaveDC(3, abilityMod(18))   // 14
```

## Testes determinísticos

```ts
import { setRoller, resetRoller } from '@lippelt/srd-dnd5e-2014'

setRoller(() => 20)         // todo d20 vira 20
const r = dnd5e2014.rules!.roll!('attack', { modifier: 5 })
// → crítico natural 20
resetRoller()
```

## Licença

[MIT](LICENSE) (código). Mecânicas do SRD 5.1 sob CC-BY 4.0 (atribuição: Wizards of the Coast LLC).

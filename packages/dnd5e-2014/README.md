# @lippelt/srd-dnd5e-2014

Módulo Dungeons & Dragons 5ª Edição (2014) para [`@lippelt/srd-core`](../core).

> D&D® é trademark da Wizards of the Coast LLC. Este pacote usa mecânicas do [System Reference Document 5.1](https://dnd.wizards.com/resources/systems-reference-document) sob a [Creative Commons Attribution 4.0 International License (CC-BY 4.0)](https://creativecommons.org/licenses/by/4.0/legalcode). Termos em PT-BR seguem a tradução oficial Galápagos Jogos.

## O que inclui

- **d20 com vantagem/desvantagem** — `roll('check' | 'd20', { modifier, advantage?, disadvantage? })`. Vantagem e desvantagem se cancelam (regra do SRD).
- **Rolagem de ataque vs CA** — `roll('attack', { modifier, targetAC?, advantage?, disadvantage? })`. 20 natural sempre acerta; 1 natural sempre erra.
- **Teste de resistência** — `roll('save', { modifier, dc?, advantage?, disadvantage? })`.
- **Rolagem de dano** — `roll('damage', { count, sides, modifier, critical? })`. `critical: true` dobra os dados.
- **Utilitários exportados:**
  - `abilityMod(score)` — `floor((score - 10) / 2)`
  - `spellSaveDC(proficiency, casterMod)` — `8 + prof + mod`
  - `spellAttackBonus(proficiency, casterMod)` — `prof + mod`
- **20 condições** — Cego, Enfeitiçado, Surdo, Exaustão (níveis 1–6), Amedrontado, Agarrado, Incapacitado, Invisível, Paralisado, Petrificado, Envenenado, Caído, Contido, Atordoado, Inconsciente.
- **3 campos de status** — CA (Classe de Armadura), Mortes ✓, Mortes ✗.
- **9 presets de dados** — d20, d20 com vantagem/desvantagem, d4/d6/d8/d10/d12 (dano), d100.

## Uso

```ts
import { register, getSystem } from '@lippelt/srd-core'
import { dnd5e2014, abilityMod, spellSaveDC } from '@lippelt/srd-dnd5e-2014'

register(dnd5e2014)

const sys = getSystem('dnd5e-2014')!

// Ataque com vantagem contra CA 16
const atk = sys.rules!.roll!('attack', { modifier: 6, targetAC: 16, advantage: true })
// → { total: 24, notes: ['vantagem', 'acertou (CA 16)'], ... }

// CD de magia pra um warlock CAR 18 com proficiência +3
const cd = spellSaveDC(3, abilityMod(18))   // 14
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
